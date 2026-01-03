import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpDown, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../../../constants/colors';
import { ProductStat } from '../../../types/dashboard.types';
import { BaseCard } from '../../ui/BaseCard';

interface BaseProps {
  title: string;
  data: ProductStat[];
  unit: string;
  color: string;
  defaultSortAsc?: boolean;
  onSeeMore?: () => void;
  limit?: number;
}

export const BaseProductRanking: React.FC<BaseProps> = ({
  title,
  data,
  unit,
  color,
  onSeeMore,
  defaultSortAsc = false,
  limit = 10,
}) => {
  const [isAsc, setIsAsc] = useState(defaultSortAsc);

  const sortedData = [...data]
    .sort((a, b) => (isAsc ? a.value - b.value : b.value - a.value))
    .slice(0, limit);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <BaseCard variant="ultraSoft" style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setIsAsc(!isAsc)}
        >
          <ArrowUpDown size={14} color={COLORS.primary} />
          <Text style={styles.filterText}>
            {isAsc ? 'Terendah ↑' : 'Tertinggi ↓'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {sortedData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Belum ada data periode ini</Text>
        </View>
      ) : (
        <>
          {sortedData.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {index + 1}. {item.name}
                </Text>
                <Text style={styles.itemValue}>
                  {item.value} {unit}
                </Text>
              </View>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}

          {onSeeMore && (
            <TouchableOpacity style={styles.seeMoreBtn} onPress={onSeeMore}>
              <Text style={styles.seeMoreText}>Lihat Selengkapnya</Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </>
      )}
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },

  title: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textDark,
  },

  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  filterText: {
    fontSize: 10,
    marginLeft: 5,
    color: COLORS.primary,
    fontFamily: 'PoppinsMedium',
  },

  itemRow: {
    marginBottom: 14,
  },

  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  itemName: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 10,
  },

  itemValue: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textDark,
  },

  barContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  emptyText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
  },

  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },

  seeMoreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'PoppinsMedium',
    marginRight: 4,
  },
});
