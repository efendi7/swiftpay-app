// src/screens/Main/TransactionScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Collapsible from 'react-native-collapsible';
import { useTransactions } from '../../hooks/useTransaction';
import { formatCurrency, getDisplayId, formatDate } from '../../utils/transactionsUtils';
import { Transaction } from '../../hooks/useTransaction';

type FilterMode = 'today' | 'week' | 'month' | 'all' | 'specificMonth' | 'dateRange';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const TransactionScreen = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('today');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'oldest'>('latest');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Untuk filter bulan spesifik
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Untuk filter rentang tanggal
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { 
    transactions, 
    loading, 
    isAdmin, 
    refetch, 
    loadingMore,
    hasMore,
    loadMore 
  } = useTransactions(filterMode, selectedSort, searchQuery, {
    month: filterMode === 'specificMonth' ? selectedMonth : undefined,
    year: filterMode === 'specificMonth' ? selectedYear : undefined,
    startDate: filterMode === 'dateRange' ? startDate : undefined,
    endDate: filterMode === 'dateRange' ? endDate : undefined,
  });

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Client-side instant filter
  const filteredTransactions = useCallback(() => {
    if (!searchInput.trim()) return transactions;

    const searchLower = searchInput.toLowerCase();
    return transactions.filter((t) =>
      (t.transactionNumber || '').toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower) ||
      (t.cashierName && t.cashierName.toLowerCase().includes(searchLower)) ||
      (t.cashierEmail && t.cashierEmail.toLowerCase().includes(searchLower))
    );
  }, [transactions, searchInput]);

  const showTransactionDetail = (transaction: Transaction) => {
    const itemDetails = transaction.items
      .map((item, index) =>
        `${index + 1}. ${item.productName || 'Produk'} - Qty: ${item.qty} x ${formatCurrency(item.price)}`
      )
      .join('\n');

    const displayId = getDisplayId(transaction);

    let title = `Detail Transaksi ${displayId}`;
    let message = `Tanggal: ${formatDate(transaction.date)}`;

    if (isAdmin && transaction.cashierName) {
      message += `\nKasir: ${transaction.cashierName}`;
      if (transaction.cashierEmail) {
        message += `\nEmail: ${transaction.cashierEmail}`;
      }
    }

    message += `\n\nProduk:\n${itemDetails}\n\nTotal: ${formatCurrency(transaction.total)}`;

    Alert.alert(title, message, [{ text: 'Tutup' }]);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const displayId = getDisplayId(item);

    return (
      <TouchableOpacity style={styles.transactionCard} onPress={() => showTransactionDetail(item)}>
        <View style={styles.transactionHeader}>
          <View style={styles.leftHeader}>
            <Text style={styles.transactionId}>{displayId}</Text>
            {isAdmin && item.cashierName && (
              <View style={styles.cashierInfo}>
                <Text style={styles.cashierName}>{item.cashierName}</Text>
                {item.cashierEmail && (
                  <Text style={styles.cashierEmail}>{item.cashierEmail}</Text>
                )}
              </View>
            )}
          </View>
          <Text style={styles.transactionDate}>
            {new Date(item.date.toMillis()).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.transactionBody}>
          <Text style={styles.itemCount}>{item.items.length} item</Text>
          <Text style={styles.transactionTotal}>{formatCurrency(item.total)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (mode: FilterMode, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filterMode === mode && styles.filterButtonActive]}
      onPress={() => {
        setFilterMode(mode);
        
        // --- TAMBAHKAN INI ---
        // Tutup filter otomatis jika memilih filter cepat (bukan bulan/rentang tanggal)
        if (mode !== 'specificMonth' && mode !== 'dateRange') {
          setIsFilterExpanded(false);
        }
        // --------------------

        if (mode !== 'specificMonth') {
          setSelectedMonth(new Date().getMonth());
          setSelectedYear(currentYear);
        }
        if (mode !== 'dateRange') {
          setStartDate(null);
          setEndDate(null);
        }
      }}
    >
      <Text style={[styles.filterButtonText, filterMode === mode && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (sort: typeof selectedSort, label: string) => (
    <TouchableOpacity
      style={[styles.sortButton, selectedSort === sort && styles.sortButtonActive]}
      onPress={() => setSelectedSort(sort)}
    >
      <Text style={[styles.sortButtonText, selectedSort === sort && styles.sortButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderMonthPicker = () => {
    if (filterMode !== 'specificMonth') return null;

    return (
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.monthYearText}>
          {MONTH_NAMES[selectedMonth]} {selectedYear}
        </Text>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
        >
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDateRangePicker = () => {
    if (filterMode !== 'dateRange') return null;

    const formatDateDisplay = (date: Date | null) =>
      date ? date.toLocaleDateString('id-ID') : 'Pilih tanggal';

    return (
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateButtonText}>Dari: {formatDateDisplay(startDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.dateButtonText}>Sampai: {formatDateDisplay(endDate)}</Text>
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={startDate || new Date()}
            onChange={(event, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) setStartDate(date);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={endDate || new Date()}
            onChange={(event, date) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (date) setEndDate(date);
            }}
          />
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00A79D" />
        <Text style={styles.footerText}>Memuat lebih banyak...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Tidak ada transaksi yang sesuai' : 'Tidak ada transaksi'}
      </Text>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00A79D" />
        <Text style={styles.loadingText}>Memuat transaksi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAdmin ? 'Riwayat Transaksi Semua Kasir' : 'Riwayat Transaksi Saya'}
        </Text>
        <Text style={styles.subtitle}>Total: {filteredTransactions().length} transaksi</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={isAdmin ? "Cari nomor, kasir, atau email..." : "Cari nomor transaksi..."}
          value={searchInput}
          onChangeText={setSearchInput}
          placeholderTextColor="#999"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchInput('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tombol Toggle Filter */}
      <TouchableOpacity
        style={styles.toggleFilterButton}
        onPress={() => setIsFilterExpanded(!isFilterExpanded)}
      >
        <Text style={styles.toggleFilterText}>
          {isFilterExpanded ? '↑ Sembunyikan Filter' : '↓ Tampilkan Filter Lanjutan'}
        </Text>
      </TouchableOpacity>

      {/* Semua Filter dalam Collapsible */}
      <Collapsible collapsed={!isFilterExpanded}>
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            {renderFilterButton('today', 'Hari Ini')}
            {renderFilterButton('week', 'Minggu Ini')}
            {renderFilterButton('month', 'Bulan Ini')}
            {renderFilterButton('all', 'Semua')}
          </View>

          <View style={styles.filterRow}>
            {renderFilterButton('specificMonth', 'Bulan')}
            {renderFilterButton('dateRange', 'Rentang Tanggal')}
          </View>

          {renderMonthPicker()}
          {renderDateRangePicker()}

          <View style={styles.sortContainer}>
            {renderSortButton('latest', 'Terbaru')}
            {renderSortButton('oldest', 'Terlama')}
          </View>
        </View>
      </Collapsible>

      <FlatList
        data={filteredTransactions()}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredTransactions().length === 0 && styles.listContainerEmpty
        ]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshing={loading && transactions.length > 0}
        onRefresh={refetch}
        onEndReached={() => {
          if (hasMore && !loadingMore && !searchInput) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: { backgroundColor: '#00A79D', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 14, color: '#E0F7FA', marginTop: 4 },
  searchContainer: { padding: 16, backgroundColor: '#FFF', position: 'relative' },
  searchInput: { backgroundColor: '#F5F5F5', padding: 12, paddingRight: 40, borderRadius: 8, fontSize: 16 },
  clearButton: { position: 'absolute', right: 24, top: '50%', transform: [{ translateY: -12 }], width: 24, height: 24, borderRadius: 12, backgroundColor: '#CCC', justifyContent: 'center', alignItems: 'center' },
  clearButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  
  // Styles Baru untuk Collapsible
  toggleFilterButton: {
    backgroundColor: '#FFF',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  toggleFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A79D',
  },
  filterSection: {
    backgroundColor: '#FFF',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#FFF', gap: 8 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#00A79D' },
  filterButtonText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterButtonTextActive: { color: '#FFF' },
  pickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#FFF', gap: 20 },
  arrowButton: { padding: 10 },
  arrowText: { fontSize: 24, color: '#00A79D' },
  monthYearText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dateRangeContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF', gap: 12 },
  dateButton: { flex: 1, backgroundColor: '#F0F0F0', padding: 14, borderRadius: 8, alignItems: 'center' },
  dateButtonText: { fontSize: 14, color: '#333' },
  sortContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF', gap: 8 },
  sortButton: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center' },
  sortButtonActive: { backgroundColor: '#00A79D' },
  sortButtonText: { fontSize: 12, fontWeight: '600', color: '#666' },
  sortButtonTextActive: { color: '#FFF' },
  
  listContainer: { padding: 16 },
  listContainerEmpty: { flex: 1 },
  transactionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  leftHeader: { flex: 1, marginRight: 12 },
  transactionId: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cashierInfo: { marginTop: 4 },
  cashierName: { fontSize: 14, color: '#00A79D', fontWeight: '600' },
  cashierEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  transactionDate: { fontSize: 12, color: '#999', textAlign: 'right' },
  transactionBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  itemCount: { fontSize: 14, color: '#666' },
  transactionTotal: { fontSize: 18, fontWeight: 'bold', color: '#00A79D' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center' },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  footerText: { marginTop: 8, fontSize: 14, color: '#666' },
});

export default TransactionScreen;