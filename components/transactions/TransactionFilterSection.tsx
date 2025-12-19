import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ChevronDown, ChevronUp, Filter, Clock, Calendar } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import MonthPicker from './MonthPicker';

type SortType = 'latest' | 'oldest';
type FilterMode = 'all' | 'specificMonth' | 'today';

interface Props {
  filterMode: FilterMode;
  selectedSort: SortType;
  selectedMonth: number;
  selectedYear: number;
  transactionCount: number;
  onFilterChange: (mode: FilterMode) => void;
  onSortChange: (sort: SortType) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const TransactionFilterSection: React.FC<Props> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    filterMode, selectedSort, transactionCount, onFilterChange, onSortChange,
    selectedMonth, selectedYear, onMonthChange, onYearChange
  } = props;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.toggle} 
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.toggleLeft}>
          <Filter size={18} color={COLORS.primary} />
          <Text style={styles.toggleText}>Filter & Urutkan</Text>
        </View>
        <View style={styles.toggleRight}>
          <Text style={styles.countText}>{transactionCount} Transaksi</Text>
          {isExpanded ? <ChevronUp size={20} color="#94A3B8" /> : <ChevronDown size={20} color="#94A3B8" />}
        </View>
      </TouchableOpacity>

      <Collapsible collapsed={!isExpanded} duration={300}>
        <View style={styles.filterBox}>
          {/* BARIS 1: 3 KOLOM FILTER MODE */}
          <View style={styles.mainRow}>
            <TouchableOpacity 
              style={[styles.mainBtn, filterMode === 'today' && styles.activePrimary]}
              onPress={() => onFilterChange('today')}
            >
              <Clock size={16} color={filterMode === 'today' ? '#FFF' : COLORS.primary} />
              <Text style={[styles.mainBtnText, filterMode === 'today' && styles.textWhite]}>Hari Ini</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mainBtn, filterMode === 'specificMonth' && styles.activePrimary]}
              onPress={() => onFilterChange('specificMonth')}
            >
              <Calendar size={16} color={filterMode === 'specificMonth' ? '#FFF' : COLORS.primary} />
              <Text style={[styles.mainBtnText, filterMode === 'specificMonth' && styles.textWhite]}>Pilih Bulan</Text>
            </TouchableOpacity>
          </View>

          {/* MONTH PICKER */}
          <Collapsible collapsed={filterMode !== 'specificMonth'} duration={300}>
            <View style={styles.pickerWrapper}>
              <MonthPicker 
                selectedMonth={selectedMonth} 
                selectedYear={selectedYear}
                onMonthChange={onMonthChange}
                onYearChange={onYearChange}
              />
            </View>
          </Collapsible>

          {/* BARIS 2: SORTING */}
          <Text style={styles.label}>Urutkan</Text>
          <View style={styles.sortRow}>
            <TouchableOpacity 
              style={[styles.sortBtn, selectedSort === 'latest' && styles.activeSecondary]}
              onPress={() => onSortChange('latest')}
            >
              <Text style={[styles.sortText, selectedSort === 'latest' && styles.textWhite]}>Terbaru</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sortBtn, selectedSort === 'oldest' && styles.activeSecondary]}
              onPress={() => onSortChange('oldest')}
            >
              <Text style={[styles.sortText, selectedSort === 'oldest' && styles.textWhite]}>Terlama</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  toggle: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleText: { color: '#1E293B', fontFamily: 'PoppinsSemiBold', fontSize: 14 },
  countText: { color: '#64748B', fontFamily: 'PoppinsMedium', fontSize: 12 },
  filterBox: { paddingHorizontal: 16, paddingBottom: 20 },
  
  // MAIN ROW (Filter Mode)
  mainRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  mainBtn: { 
    flex: 1, 
    height: 45, 
    flexDirection: 'row', 
    gap: 8, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  mainBtnText: { color: '#64748B', fontFamily: 'PoppinsSemiBold', fontSize: 13 },
  
  // SORT ROW
  label: { fontSize: 11, fontFamily: 'PoppinsBold', color: '#94A3B8', marginBottom: 8, marginLeft: 4 },
  sortRow: { flexDirection: 'row', gap: 10 },
  sortBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 8, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  sortText: { color: '#64748B', fontSize: 12, fontFamily: 'PoppinsMedium' },
  
  // PICKER
  pickerWrapper: { marginBottom: 15, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 10 },
  
  // ACTIVE STATES
  activePrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  activeSecondary: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  textWhite: { color: '#FFF' }
});