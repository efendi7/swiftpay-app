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
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions } from '../../hooks/useTransaction';
import { formatCurrency, getDisplayId, formatDate } from '../../utils/transactionsUtils';
import { Transaction } from '../../hooks/useTransaction';
import { Search, X, ChevronDown, ChevronUp, Calendar, Filter } from 'lucide-react-native';

type FilterMode = 'today' | 'week' | 'month' | 'all' | 'specificMonth' | 'dateRange';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const COLORS = {
  primary: '#1C3A5A',
  secondary: '#00A79D',
  accent: '#F58220',
  background: '#F5F5F5',
  cardBg: '#FFFFFF',
  textDark: '#444444',
  textLight: '#7f8c8d',
  success: '#4CAF50',
  danger: '#F44336',
};

const TransactionScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('today');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'oldest'>('latest');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filterHeight] = useState(new Animated.Value(0));

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

  // Animasi filter toggle
  useEffect(() => {
    Animated.timing(filterHeight, {
      toValue: isFilterExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isFilterExpanded]);

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

  const toggleFilter = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const handleFilterSelect = (mode: FilterMode) => {
    setFilterMode(mode);
    
    // Tutup filter otomatis untuk filter cepat
    if (mode !== 'specificMonth' && mode !== 'dateRange') {
      setIsFilterExpanded(false);
    }

    // Reset state filter lain
    if (mode !== 'specificMonth') {
      setSelectedMonth(new Date().getMonth());
      setSelectedYear(currentYear);
    }
    if (mode !== 'dateRange') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const displayId = getDisplayId(item);

    return (
      <TouchableOpacity style={styles.transactionCard} onPress={() => showTransactionDetail(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.idBadge}>
            <Text style={styles.transactionId}>{displayId}</Text>
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

        {isAdmin && item.cashierName && (
          <View style={styles.cashierSection}>
            <Text style={styles.cashierLabel}>Kasir:</Text>
            <Text style={styles.cashierName}>{item.cashierName}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemCount}>{item.items.length} item</Text>
          </View>
          <Text style={styles.transactionTotal}>{formatCurrency(item.total)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (mode: FilterMode, label: string) => (
    <TouchableOpacity
      style={[styles.filterChip, filterMode === mode && styles.filterChipActive]}
      onPress={() => handleFilterSelect(mode)}
    >
      <Text style={[styles.filterChipText, filterMode === mode && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (sort: typeof selectedSort, label: string) => (
    <TouchableOpacity
      style={[styles.sortChip, selectedSort === sort && styles.sortChipActive]}
      onPress={() => setSelectedSort(sort)}
    >
      <Text style={[styles.sortChipText, selectedSort === sort && styles.sortChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderMonthPicker = () => {
    if (filterMode !== 'specificMonth') return null;

    return (
      <View style={styles.monthPickerContainer}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
        >
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        <View style={styles.monthDisplay}>
          <Calendar size={18} color={COLORS.secondary} />
          <Text style={styles.monthYearText}>
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
        >
          <Text style={styles.arrowText}>▶</Text>
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
        <View style={styles.dateRangeRow}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateLabel}>Dari:</Text>
            <Text style={styles.dateValue}>{formatDateDisplay(startDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateLabel}>Sampai:</Text>
            <Text style={styles.dateValue}>{formatDateDisplay(endDate)}</Text>
          </TouchableOpacity>
        </View>

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
        <ActivityIndicator size="small" color={COLORS.secondary} />
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
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Memuat transaksi...</Text>
      </View>
    );
  }

  const maxHeight = filterHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <LinearGradient colors={[COLORS.primary, '#2c537a']} style={StyleSheet.absoluteFill} />
        <Text style={styles.title}>Laporan Penjualan</Text>
        <Text style={styles.subtitle}>
          {isAdmin ? 'Semua Transaksi Kasir' : 'Transaksi Saya'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={isAdmin ? "Cari nomor, kasir, email..." : "Cari nomor transaksi..."}
          value={searchInput}
          onChangeText={setSearchInput}
          placeholderTextColor="#999"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchInput('')}>
            <X size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Info */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          Total: <Text style={styles.summaryValue}>{filteredTransactions().length}</Text> transaksi
        </Text>
        <TouchableOpacity style={styles.filterToggle} onPress={toggleFilter}>
          <Filter size={16} color={COLORS.secondary} />
          <Text style={styles.filterToggleText}>Filter</Text>
          {isFilterExpanded ? (
            <ChevronUp size={16} color={COLORS.secondary} />
          ) : (
            <ChevronDown size={16} color={COLORS.secondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Section dengan Animated */}
      <Animated.View style={[styles.filterWrapper, { maxHeight, overflow: 'hidden' }]}>
        <View style={styles.filterContent}>
          {/* Filter Cepat */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Periode</Text>
            <View style={styles.chipRow}>
              {renderFilterButton('today', 'Hari Ini')}
              {renderFilterButton('week', 'Minggu Ini')}
            </View>
            <View style={styles.chipRow}>
              {renderFilterButton('month', 'Bulan Ini')}
              {renderFilterButton('all', 'Semua')}
            </View>
          </View>

          {/* Filter Lanjutan */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Filter Lanjutan</Text>
            <View style={styles.chipRow}>
              {renderFilterButton('specificMonth', 'Pilih Bulan')}
              {renderFilterButton('dateRange', 'Rentang Tanggal')}
            </View>
          </View>

          {renderMonthPicker()}
          {renderDateRangePicker()}

          {/* Sorting */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Urutkan</Text>
            <View style={styles.chipRow}>
              {renderSortButton('latest', 'Terbaru')}
              {renderSortButton('oldest', 'Terlama')}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions()}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 90 }, // Extra space untuk bottom nav
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
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  
  // Header
  header: { 
    paddingHorizontal: 25,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  
  // Search
  searchContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF', 
    marginHorizontal: 20,
    marginTop: -15,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { 
    flex: 1,
    padding: 12, 
    fontSize: 15,
    color: COLORS.textDark,
  },
  clearButton: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: COLORS.textLight, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  // Summary Bar
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  summaryText: { fontSize: 14, color: COLORS.textLight },
  summaryValue: { fontWeight: 'bold', color: COLORS.textDark },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  filterToggleText: { fontSize: 14, fontWeight: '600', color: COLORS.secondary },

  // Filter Section
  filterWrapper: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterContent: {
    padding: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  chipRow: { 
    flexDirection: 'row', 
    gap: 8,
    marginBottom: 8,
  },
  filterChip: { 
    flex: 1,
    paddingVertical: 10, 
    paddingHorizontal: 12,
    borderRadius: 10, 
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: { 
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterChipText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: COLORS.textDark,
  },
  filterChipTextActive: { color: '#FFF' },
  
  sortChip: { 
    flex: 1,
    paddingVertical: 10, 
    paddingHorizontal: 12,
    borderRadius: 10, 
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortChipActive: { 
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  sortChipText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: COLORS.textDark,
  },
  sortChipTextActive: { color: '#FFF' },

  // Month Picker
  monthPickerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  monthArrow: { 
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  arrowText: { 
    fontSize: 18, 
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthYearText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.textDark,
  },

  // Date Range Picker
  dateRangeContainer: { 
    marginBottom: 12,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    padding: 14, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  dateValue: { 
    fontSize: 14, 
    color: COLORS.textDark,
    fontWeight: '600',
  },

  // Transaction List
  listContainer: { 
    padding: 16,
  },
  listContainerEmpty: { flex: 1 },
  
  transactionCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    padding: 16, 
    marginBottom: 12, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
  },
  idBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  transactionId: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLORS.textDark,
  },
  transactionDate: { 
    fontSize: 12, 
    color: COLORS.textLight,
  },
  cashierSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cashierLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  cashierName: { 
    fontSize: 13, 
    color: COLORS.secondary, 
    fontWeight: '600',
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  itemInfo: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemCount: { 
    fontSize: 12, 
    color: COLORS.textDark,
    fontWeight: '600',
  },
  transactionTotal: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.secondary,
  },
  
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60,
  },
  emptyText: { 
    fontSize: 16, 
    color: '#999', 
    textAlign: 'center',
  },
  footerLoader: { 
    paddingVertical: 20, 
    alignItems: 'center',
  },
  footerText: { 
    marginTop: 8, 
    fontSize: 14, 
    color: '#666',
  },
});

export default TransactionScreen;