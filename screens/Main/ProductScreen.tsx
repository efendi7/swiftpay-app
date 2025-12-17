// screens/Main/ProductScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs, query } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Collapsible from 'react-native-collapsible';

const COLORS = {
  primary: '#1C3A5A',
  secondary: '#00A79D',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  textDark: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
};

type SortType = 'newest' | 'oldest' | 'stock-high' | 'stock-low';
type FilterMode = 'all' | 'specificMonth' | 'dateRange';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  createdAt: any;
}

const ProductScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI States
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  
  // Month Picker States
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Date Range States
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, sortType, filterMode, selectedMonth, selectedYear, startDate, endDate, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(query(productsRef));
      const productsList: Product[] = [];
      snapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
    }

    if (filterMode === 'specificMonth') {
      filtered = filtered.filter(p => {
        if (!p.createdAt) return false;
        const date = p.createdAt.toDate();
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      });
    } else if (filterMode === 'dateRange' && startDate && endDate) {
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(23, 59, 59, 999));
      filtered = filtered.filter(p => {
        if (!p.createdAt) return false;
        const pDate = p.createdAt.toDate();
        return pDate >= start && pDate <= end;
      });
    }

    filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
      const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
      switch (sortType) {
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'stock-high': return b.stock - a.stock;
        case 'stock-low': return a.stock - b.stock;
        default: return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, sortType, filterMode, selectedMonth, selectedYear, startDate, endDate, searchQuery]);

  const renderMonthPicker = () => {
    if (filterMode !== 'specificMonth') return null;
    return (
      <View style={styles.pickerContainer}>
        <TouchableOpacity onPress={() => {
          if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
          else setSelectedMonth(selectedMonth - 1);
        }} style={styles.arrowButton}><Text style={styles.arrowText}>←</Text></TouchableOpacity>
        <Text style={styles.monthYearText}>{MONTH_NAMES[selectedMonth]} {selectedYear}</Text>
        <TouchableOpacity onPress={() => {
          if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
          else setSelectedMonth(selectedMonth + 1);
        }} style={styles.arrowButton}><Text style={styles.arrowText}>→</Text></TouchableOpacity>
      </View>
    );
  };

  const renderDateRangePicker = () => {
    if (filterMode !== 'dateRange') return null;
    return (
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateButtonText}>Dari: {startDate ? startDate.toLocaleDateString('id-ID') : 'Pilih'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.dateButtonText}>Sampai: {endDate ? endDate.toLocaleDateString('id-ID') : 'Pilih'}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker value={startDate || new Date()} mode="date" display="default"
            onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }} />
        )}
        {showEndPicker && (
          <DateTimePicker value={endDate || new Date()} mode="date" display="default"
            onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }} />
        )}
      </View>
    );
  };

  const ProductCard = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productBarcode}>Barcode: {item.barcode}</Text>
        </View>
        <View style={[styles.stockBadge, { backgroundColor: item.stock < 10 ? COLORS.danger : COLORS.success }]}>
          <Text style={styles.stockText}>{item.stock}</Text>
        </View>
      </View>
      <View style={styles.productFooter}>
        <Text style={styles.priceText}>Rp {item.price.toLocaleString('id-ID')}</Text>
        <Text style={styles.dateText}>{item.createdAt?.toDate().toLocaleDateString('id-ID')}</Text>
      </View>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Memuat produk...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Produk</Text>
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Cari nama atau barcode..." value={searchQuery}
            onChangeText={setSearchQuery} placeholderTextColor={COLORS.textLight} />
          {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Text style={styles.clearIcon}>✕</Text></TouchableOpacity> : null}
        </View>
      </View>

      <TouchableOpacity style={styles.toggleButton} onPress={() => setIsFilterExpanded(!isFilterExpanded)}>
        <Text style={styles.toggleText}>{isFilterExpanded ? '↑ Sembunyikan Filter' : '↓ Filter & Urutkan'}</Text>
        <Text style={styles.countText}>{filteredProducts.length} Produk</Text>
      </TouchableOpacity>

      <Collapsible collapsed={!isFilterExpanded}>
        <View style={styles.filterBox}>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.chip, filterMode === 'all' && styles.chipActive]} 
              onPress={() => {setFilterMode('all'); setIsFilterExpanded(false);}}>
              <Text style={[styles.chipText, filterMode === 'all' && styles.chipTextActive]}>Semua</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, filterMode === 'specificMonth' && styles.chipActive]} 
              onPress={() => setFilterMode('specificMonth')}>
              <Text style={[styles.chipText, filterMode === 'specificMonth' && styles.chipTextActive]}>Bulan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, filterMode === 'dateRange' && styles.chipActive]} 
              onPress={() => setFilterMode('dateRange')}>
              <Text style={[styles.chipText, filterMode === 'dateRange' && styles.chipTextActive]}>Rentang</Text>
            </TouchableOpacity>
          </View>
          {renderMonthPicker()}
          {renderDateRangePicker()}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.sortBtn, sortType === 'stock-high' && styles.chipActive]} onPress={() => setSortType('stock-high')}>
              <Text style={[styles.chipText, sortType === 'stock-high' && styles.chipTextActive]}>Stok ↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sortBtn, sortType === 'newest' && styles.chipActive]} onPress={() => setSortType('newest')}>
              <Text style={[styles.chipText, sortType === 'newest' && styles.chipTextActive]}>Terbaru</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Collapsible>

      <FlatList data={filteredProducts} renderItem={({ item }) => <ProductCard item={item} />}
        keyExtractor={item => item.id} contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing} onRefresh={loadProducts} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.textLight },
  header: { padding: 16, backgroundColor: COLORS.primary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 10 },
  searchInput: { flex: 1, paddingVertical: 10, color: COLORS.textDark },
  clearIcon: { padding: 5, color: COLORS.textLight },
  toggleButton: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: COLORS.border },
  toggleText: { color: COLORS.secondary, fontWeight: 'bold' },
  countText: { color: COLORS.textLight },
  filterBox: { backgroundColor: '#FFF', padding: 15, borderBottomWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: { flex: 1, padding: 10, backgroundColor: COLORS.background, borderRadius: 8, alignItems: 'center' },
  sortBtn: { flex: 1, padding: 10, backgroundColor: '#F0F0F0', borderRadius: 8, alignItems: 'center' },
  chipActive: { backgroundColor: COLORS.secondary },
  chipText: { color: COLORS.textDark, fontSize: 12 },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
  
  // Card Styles yang diperbaiki
  productCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  productInfo: { flex: 1 }, // Ini property yang tadi dilaporkan hilang
  productName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  productBarcode: { fontSize: 12, color: COLORS.textLight },
  stockBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  stockText: { color: '#FFF', fontWeight: 'bold' },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  dateText: { fontSize: 12, color: COLORS.textLight },

  // Picker Styles
  pickerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  arrowButton: { padding: 10 },
  arrowText: { fontSize: 20, color: COLORS.secondary, fontWeight: 'bold' },
  monthYearText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20 },
  dateRangeContainer: { flexDirection: 'row', gap: 10, marginVertical: 10 },
  dateButton: { flex: 1, padding: 12, backgroundColor: COLORS.background, borderRadius: 8, alignItems: 'center' },
  dateButtonText: { fontSize: 12, color: COLORS.textDark },
});

export default ProductScreen;