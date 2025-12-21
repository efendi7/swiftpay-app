import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Package, ArrowDownLeft, ArrowUpRight, ClipboardList } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// Penyesuaian kalkulasi lebar karena sekarang ada padding di dalam card utama
const PADDING_OUTER = 40; // Padding ScrollView
const PADDING_INNER = 32; // Padding di dalam card utama (16 * 2)
const GAP = 8;
const CARD_WIDTH = (width - PADDING_OUTER - PADDING_INNER - (GAP * 2)) / 3;

interface StatsGridProps {
  totalProducts: number;
  totalIn: number;
  totalOut: number;
  dateLabel?: string;
  isLoading?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = React.memo(
  ({ totalProducts, totalIn, totalOut, dateLabel = 'Hari ini', isLoading }) => {
    return (
      <View style={[styles.mainCard, { opacity: isLoading ? 0.7 : 1 }]}>
        {/* Header di dalam Card */}
        <View style={styles.headerTitle}>
          <View style={styles.iconBox}>
            <ClipboardList size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Ringkasan Inventaris</Text>
            <Text style={styles.dateLabelText}>{dateLabel}</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {/* Item 1: Total Produk */}
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
              <Package size={14} color="#059669" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{totalProducts}</Text>
              <Text style={styles.statLabel}>Total{"\n"}Produk</Text>
            </View>
          </View>

          {/* Item 2: Masuk */}
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5' }]}>
              <ArrowDownLeft size={14} color="#10b981" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{totalIn}</Text>
              <Text style={styles.statLabel}>Stok{"\n"}Masuk</Text>
            </View>
          </View>

          {/* Item 3: Keluar */}
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
              <ArrowUpRight size={14} color="#ef4444" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{totalOut}</Text>
              <Text style={styles.statLabel}>Stok{"\n"}Keluar</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    // Bayangan seragam dengan Chart
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    padding: 8,
    backgroundColor: '#E8F5F3',
    borderRadius: 10,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textDark,
  },
  dateLabelText: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
    marginTop: -2,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textContainer: {
    marginLeft: 6,
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: COLORS.textDark,
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
    lineHeight: 11,
  },
});