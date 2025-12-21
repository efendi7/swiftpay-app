import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpDown } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { ProductStat } from '../../types/dashboard.types';

interface Props {
  title: string;
  data: ProductStat[];
  unit: string;
  color: string;
}

export const ProductRankingCard: React.FC<Props> = ({ title, data, unit, color }) => {
  const [isAsc, setIsAsc] = useState(false);

  // Sorting lokal: Tertinggi (Desc) atau Terendah (Asc)
  const sortedData = [...data]
    .sort((a, b) => (isAsc ? a.value - b.value : b.value - a.value))
    .slice(0, 10);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setIsAsc(!isAsc)}>
          <ArrowUpDown size={14} color={COLORS.primary} />
          <Text style={styles.filterText}>{isAsc ? 'Terendah ↑' : 'Tertinggi ↓'}</Text>
        </TouchableOpacity>
      </View>

      {sortedData.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada data periode ini</Text>
        </View>
      ) : (
        sortedData.map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{index + 1}. {item.name}</Text>
              <Text style={styles.itemValue}>{item.value} {unit}</Text>
            </View>
            {/* Progress Bar (Diagram Batang) */}
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.barFill, 
                  { width: `${(item.value / maxValue) * 100}%`, backgroundColor: color }
                ]} 
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 10 },
  title: { fontSize: 14, fontFamily: 'PoppinsSemiBold', color: COLORS.textDark },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9F8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  filterText: { fontSize: 11, marginLeft: 5, color: COLORS.primary, fontFamily: 'PoppinsMedium' },
  itemRow: { marginBottom: 14 },
  itemInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { fontSize: 12, fontFamily: 'PoppinsRegular', color: COLORS.textDark, flex: 1, marginRight: 10 },
  itemValue: { fontSize: 12, fontFamily: 'PoppinsSemiBold', color: COLORS.textDark },
  barContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, width: '100%', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  emptyContainer: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: COLORS.textLight, fontSize: 12, fontFamily: 'PoppinsRegular' }
});