import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ChevronDown, ChevronUp, Filter, Calendar, TrendingUp, Clock, Search, X } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface FilterProps {
  products: any[];
  searchQuery: string;
  onSearchChange: (text: string) => void;
  filterMode: 'all' | 'today' | 'range';
  sortType: string;
  userRole?: 'admin' | 'kasir';
  onFiltered: (filtered: any[]) => void;
  onFilterModeChange: (mode: any) => void;
  onSortChange: (sort: string) => void;
}

export const FilterSection = ({
  products,
  searchQuery,
  onSearchChange,
  filterMode,
  sortType,
  userRole,
  onFiltered,
  onFilterModeChange,
  onSortChange,
}: FilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentCount, setCurrentCount] = useState(products.length);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Logika Pencarian: Mencakup Nama, Barcode, dan Kategori sekaligus
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.barcode?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) // Kategori otomatis terfilter lewat sini
      );
    }

    // Filter Waktu
    if (filterMode === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(p => p.createdAt?.toDate?.().toDateString() === today);
    } else if (filterMode === 'range') {
      const targetDate = selectedDate.toDateString();
      filtered = filtered.filter(p => p.createdAt?.toDate?.().toDateString() === targetDate);
    }

    // Filter Status Stok
    if (sortType === 'stock-safe') {
      filtered = filtered.filter(p => (p.stock || 0) > 10);
    } else if (sortType === 'stock-critical') {
      filtered = filtered.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10);
    } else if (sortType === 'stock-empty') {
      filtered = filtered.filter(p => (p.stock || 0) <= 0);
    }

    // Sort Logic
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'sold-desc': return (b.sold || 0) - (a.sold || 0);
        case 'date-desc': return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
        case 'date-asc': return (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0);
        default: return 0;
      }
    });

    setCurrentCount(filtered.length);
    onFiltered(filtered);
  }, [products, searchQuery, filterMode, sortType, selectedDate, onFiltered]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mainCard}>
        {/* HANYA SEARCH BAR (KATEGORI OTOMATIS LEWAT INPUT INI) */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={userRole === 'admin' ? "Cari produk, barcode, atau kategori..." : "Cari produk..."}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* TOMBOL TOGGLE FILTER (UNTUK WAKTU & SORTIR) */}
        <TouchableOpacity 
          style={styles.toggle} 
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.toggleLeft}>
            <Filter size={18} color={COLORS.secondary} />
            <Text style={styles.toggleText}>Filter Lanjutan</Text>
          </View>
          <View style={styles.toggleRight}>
            <Text style={styles.countText}>{currentCount} Item</Text>
            {isExpanded ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
          </View>
        </TouchableOpacity>

        <Collapsible collapsed={!isExpanded}>
          <View style={styles.filterBox}>
            <Text style={styles.sectionLabel}>Waktu</Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.btn, filterMode === 'today' && styles.btnActive]}
                onPress={() => onFilterModeChange('today')}
              >
                <Clock size={14} color={filterMode === 'today' ? '#FFF' : COLORS.secondary} style={{marginRight: 6}}/>
                <Text style={[styles.btnText, filterMode === 'today' && styles.btnTextActive]}>Hari Ini</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, filterMode === 'range' && styles.btnActive]}
                onPress={() => setDatePickerVisibility(true)}
              >
                <Text style={[styles.btnText, filterMode === 'range' && styles.btnTextActive]}>Pilih Tanggal</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Stok & Urutan</Text>
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <SortBtn label="Terlaris" type="sold-desc" current={sortType} onSelect={onSortChange} icon={<TrendingUp size={12} color={sortType === 'sold-desc' ? '#FFF' : '#F59E0B'} />} />
                <SortBtn label="Terbaru" type="date-desc" current={sortType} onSelect={onSortChange} />
              </View>
              <View style={styles.gridRow}>
                <SortBtn label="Aman" type="stock-safe" current={sortType} onSelect={onSortChange} activeColor="#22C55E" />
                <SortBtn label="Kritis" type="stock-critical" current={sortType} onSelect={onSortChange} activeColor="#F59E0B" />
                <SortBtn label="Habis" type="stock-empty" current={sortType} onSelect={onSortChange} activeColor="#EF4444" />
              </View>
            </View>
          </View>
        </Collapsible>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          setSelectedDate(date);
          onFilterModeChange('range');
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
};

const SortBtn = ({ label, type, current, onSelect, icon, activeColor }: any) => {
  const isActive = current === type;
  const backgroundColor = isActive ? (activeColor || COLORS.secondary) : '#F8FAFC';
  const borderColor = isActive ? (activeColor || COLORS.secondary) : '#E2E8F0';

  return (
    <TouchableOpacity 
      style={[styles.gridItem, { backgroundColor, borderColor }]}
      onPress={() => onSelect(type)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {icon}
        <Text numberOfLines={1} style={[styles.gridText, isActive && { color: '#FFF', fontFamily: 'PoppinsBold' }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54, // Tinggi lebih lega untuk search bar utama
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    color: '#1E293B',
  },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  toggle: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, alignItems: 'center' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleText: { fontFamily: 'PoppinsSemiBold', fontSize: 13, color: '#475569' },
  countText: { color: COLORS.secondary, fontSize: 11, fontFamily: 'PoppinsBold' },
  filterBox: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionLabel: { fontSize: 10, fontFamily: 'PoppinsBold', color: '#CBD5E1', marginBottom: 6, marginTop: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 6 },
  btn: { flex: 1, flexDirection: 'row', paddingVertical: 10, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  btnText: { fontSize: 11, fontFamily: 'PoppinsSemiBold', color: '#64748B' },
  btnTextActive: { color: '#FFF' },
  gridContainer: { gap: 6 },
  gridRow: { flexDirection: 'row', gap: 6 },
  gridItem: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  gridText: { fontSize: 10, fontFamily: 'PoppinsMedium', color: '#64748B' }
});

export default FilterSection;