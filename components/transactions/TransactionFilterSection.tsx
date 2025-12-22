import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ChevronDown, ChevronUp, Clock, Calendar, Filter, Search, X } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FilterMode, SortType } from '../../types/transaction.type';

interface Props {
  searchInput: string;
  onSearchChange: (text: string) => void;
  filterMode: FilterMode;
  selectedSort: SortType;
  selectedDate: Date; // Tambahkan ini di props (kirim dari Screen)
  transactionCount: number;
  isAdmin: boolean;
  onFilterChange: (mode: FilterMode) => void;
  onSortChange: (sort: SortType) => void;
  onDateChange: (date: Date) => void; // Tambahkan ini untuk handle ganti tanggal
}

const TransactionFilterSection: React.FC<Props> = ({
  searchInput,
  onSearchChange,
  filterMode,
  selectedSort,
  selectedDate,
  transactionCount,
  isAdmin,
  onFilterChange,
  onSortChange,
  onDateChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mainCard}>
        {/* SEARCH SECTION */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={isAdmin ? "Cari No. TRX atau Kasir..." : "Cari No. Transaksi..."}
            value={searchInput}
            onChangeText={onSearchChange}
            placeholderTextColor="#94A3B8"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* TOGGLE HEADER */}
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
            <Text style={styles.countText}>{transactionCount} Transaksi</Text>
            {isExpanded ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
          </View>
        </TouchableOpacity>

        <Collapsible collapsed={!isExpanded} duration={300}>
          <View style={styles.filterBox}>
            <Text style={styles.sectionLabel}>Waktu</Text>
            <View style={styles.row}>
              <FilterButton
                label="Semua"
                active={filterMode === 'all'}
                onPress={() => onFilterChange('all')}
              />
              <FilterButton
                label="Hari Ini"
                icon={<Clock size={14} color={filterMode === 'today' ? '#FFF' : COLORS.secondary} />}
                active={filterMode === 'today'}
                onPress={() => onFilterChange('today')}
              />
              <FilterButton
                label={filterMode === 'specificMonth' ? selectedDate.toLocaleDateString('id-ID') : "Pilih Tanggal"}
                icon={<Calendar size={14} color={filterMode === 'specificMonth' ? '#FFF' : COLORS.secondary} />}
                active={filterMode === 'specificMonth'}
                onPress={() => setDatePickerVisibility(true)}
              />
            </View>

            <Text style={styles.sectionLabel}>Urutan</Text>
            <View style={styles.row}>
              <SortButton
                label="Terbaru"
                active={selectedSort === 'latest'}
                onPress={() => onSortChange('latest')}
              />
              <SortButton
                label="Terlama"
                active={selectedSort === 'oldest'}
                onPress={() => onSortChange('oldest')}
              />
            </View>
          </View>
        </Collapsible>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          onDateChange(date);
          onFilterChange('specificMonth'); // Kita gunakan mode ini untuk range tanggal
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
};

const FilterButton = ({ label, icon, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.btn, active && styles.btnActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
    <Text style={[styles.btnText, active && styles.btnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const SortButton = ({ label, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.btn, active && styles.btnActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.btnText, active && styles.btnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

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
    height: 54,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    color: '#1E293B',
  },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    alignItems: 'center',
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleText: { fontFamily: 'PoppinsSemiBold', fontSize: 13, color: '#475569' },
  countText: { color: COLORS.secondary, fontSize: 11, fontFamily: 'PoppinsBold' },
  filterBox: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionLabel: { fontSize: 10, fontFamily: 'PoppinsBold', color: '#CBD5E1', marginBottom: 6, marginTop: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 6 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  btnText: { fontSize: 11, fontFamily: 'PoppinsSemiBold', color: '#64748B' },
  btnTextActive: { color: '#FFF' },
});

export default TransactionFilterSection;