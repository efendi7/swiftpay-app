// src/utils/transactionUtils.ts

import { Timestamp } from 'firebase/firestore';

/**
 * Format timestamp menjadi string tanggal yang readable
 */
export const formatDate = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format timestamp untuk tampilan singkat (tanpa tahun)
 */
export const formatDateShort = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format angka menjadi format mata uang Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

/**
 * Dapatkan display ID untuk transaksi
 * Prioritas: transactionNumber > shortened ID
 */
export const getDisplayId = (transaction: {
  transactionNumber?: string;
  id: string;
}): string => {
  return transaction.transactionNumber 
    ? transaction.transactionNumber 
    : `#${transaction.id.substring(0, 8).toUpperCase()}`;
};

/**
 * Extract nama dari email jika displayName tidak tersedia
 */
export const getNameFromEmail = (email: string): string => {
  return email.split('@')[0];
};

/**
 * Format info kasir untuk display
 */
export const formatCashierInfo = (
  cashierName?: string, 
  cashierEmail?: string
): { name: string; email: string } => {
  const name = cashierName || (cashierEmail ? getNameFromEmail(cashierEmail) : 'Kasir');
  const email = cashierEmail || '';
  return { name, email };
};

/**
 * Group transaksi berdasarkan tanggal
 */
export const groupTransactionsByDate = (transactions: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  
  transactions.forEach((transaction) => {
    const date = transaction.date.toDate().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
  });
  
  return grouped;
};

/**
 * Calculate total dari transaksi
 */
export const calculateTotal = (transactions: any[]): number => {
  return transactions.reduce((sum, t) => sum + (t.total || 0), 0);
};

/**
 * Debounce function untuk search
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};