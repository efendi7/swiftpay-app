// src/hooks/useTransactions.ts

import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  Timestamp,
  doc,
  getDoc,
  DocumentSnapshot,
} from 'firebase/firestore';
import { Alert } from 'react-native';

export interface TransactionItem {
  productId: string;
  qty: number;
  price: number;
  productName?: string;
}

export interface Transaction {
  id: string;
  cashierId: string;
  cashierName?: string;
  cashierEmail?: string;
  total: number;
  date: Timestamp;
  items: TransactionItem[];
  transactionNumber?: string;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  isAdmin: boolean;
  hasMore: boolean;
  refetch: () => void;
  loadMore: () => void;
}

type FilterMode = 'today' | 'week' | 'month' | 'all' | 'specificMonth' | 'dateRange';
type SortType = 'latest' | 'oldest';

interface FilterOptions {
  month?: number;
  year?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

const PAGE_SIZE = 20;

export const useTransactions = (
  filterMode: FilterMode,
  selectedSort: SortType,
  searchQuery: string,
  options: FilterOptions = {}
): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const prevFilterMode = useRef(filterMode);
  const prevSort = useRef(selectedSort);
  const prevOptions = useRef(options);
  const isFirstRender = useRef(true);

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (filterMode) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'all':
        start = new Date(0);
        break;
      case 'specificMonth':
        if (options.month !== undefined && options.year !== undefined) {
          start = new Date(options.year, options.month, 1);
          end = new Date(options.year, options.month + 1, 0, 23, 59, 59, 999);
        }
        break;
      case 'dateRange':
        if (options.startDate && options.endDate) {
          start = new Date(options.startDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(options.endDate);
          end.setHours(23, 59, 59, 999);
        } else {
          start = new Date(0);
        }
        break;
    }

    return { start, end };
  };

  const checkUserRole = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User tidak terautentikasi');
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    return userDoc.exists() && userDoc.data()?.role === 'admin';
  };

  const fetchCashierInfo = async (cashierId: string): Promise<{ name: string; email: string }> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', cashierId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          name: data?.displayName || (data?.email ? data.email.split('@')[0] : 'Kasir'),
          email: data?.email || '',
        };
      }
      return { name: 'Kasir Dihapus', email: '' };
    } catch {
      return { name: 'Error Nama', email: '' };
    }
  };

  const fetchTransactions = async (isLoadingMore = false): Promise<void> => {
    try {
      if (isLoadingMore) setLoadingMore(true);
      else setLoading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User tidak terautentikasi');
        return;
      }

      const isAdminUser = await checkUserRole();
      setIsAdmin(isAdminUser);

      const { start, end } = getDateRange();
      const transactionsRef = collection(db, 'transactions');
      const orderDirection = selectedSort === 'latest' ? 'desc' : 'asc';

      let q;

      if (isLoadingMore && lastDoc) {
        if (isAdminUser) {
          q = query(
            transactionsRef,
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end)),
            orderBy('date', orderDirection),
            startAfter(lastDoc),
            limit(PAGE_SIZE)
          );
        } else {
          q = query(
            transactionsRef,
            where('cashierId', '==', currentUser.uid),
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end)),
            orderBy('date', orderDirection),
            startAfter(lastDoc),
            limit(PAGE_SIZE)
          );
        }
      } else {
        if (isAdminUser) {
          q = query(
            transactionsRef,
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end)),
            orderBy('date', orderDirection),
            limit(PAGE_SIZE)
          );
        } else {
          q = query(
            transactionsRef,
            where('cashierId', '==', currentUser.uid),
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end)),
            orderBy('date', orderDirection),
            limit(PAGE_SIZE)
          );
        }
      }

      const snapshot = await getDocs(q);
      const loaded: Transaction[] = [];

      setHasMore(snapshot.docs.length === PAGE_SIZE);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let cashierInfo = { name: '', email: '' };
        if (isAdminUser && data.cashierId) {
          cashierInfo = await fetchCashierInfo(data.cashierId);
        }

        loaded.push({
          id: docSnap.id,
          cashierId: data.cashierId || '',
          cashierName: isAdminUser ? cashierInfo.name : undefined,
          cashierEmail: isAdminUser ? cashierInfo.email : undefined,
          total: data.total || 0,
          date: data.date,
          items: data.items || [],
          transactionNumber: data.transactionNumber,
        });
      }

      if (isLoadingMore) {
        setTransactions(prev => [...prev, ...loaded]);
      } else {
        setTransactions(loaded);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Gagal memuat transaksi');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchTransactions(true);
  };

  const refetch = () => {
    setLastDoc(null);
    setHasMore(true);
    fetchTransactions(false);
  };

  useEffect(() => {
    const modeChanged = prevFilterMode.current !== filterMode;
    const sortChanged = prevSort.current !== selectedSort;
    const optionsChanged =
      prevOptions.current.month !== options.month ||
      prevOptions.current.year !== options.year ||
      prevOptions.current.startDate?.getTime() !== options.startDate?.getTime() ||
      prevOptions.current.endDate?.getTime() !== options.endDate?.getTime();

    if (modeChanged || sortChanged || optionsChanged || isFirstRender.current) {
      setLastDoc(null);
      setHasMore(true);
      setTransactions([]);
      prevFilterMode.current = filterMode;
      prevSort.current = selectedSort;
      prevOptions.current = options;
      fetchTransactions(false);

      if (isFirstRender.current) isFirstRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, selectedSort, options.month, options.year, options.startDate, options.endDate]);

  return {
    transactions,
    loading,
    loadingMore,
    isAdmin,
    hasMore,
    refetch,
    loadMore,
  };
};

export default useTransactions;