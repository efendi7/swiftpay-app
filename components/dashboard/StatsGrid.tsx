// ============================================================
// 5. components/dashboard/StatsGrid.tsx (TEXT ALIGNMENT FIXED)
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Package, ArrowDownLeft, ArrowUpRight, ClipboardList } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const PADDING_SCREEN = 40; 
const GAP = 10;
const CARD_WIDTH = (width - PADDING_SCREEN - (GAP * 2)) / 3;

interface StatsGridProps {
  totalProducts: number;
  totalIn: number;
  totalOut: number;
  dateLabel?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = React.memo(
  ({ totalProducts, totalIn, totalOut, dateLabel = 'Hari ini' }) => {
    return (
      <View style={styles.container}>
        <View style={styles.headerTitle}>
          <ClipboardList size={20} color={COLORS.textDark} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Ringkasan Inventaris</Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.statCard}>
            <View style={styles.iconCircle}>
              <Package size={14} color="#059669" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{totalProducts}</Text>
              <Text style={styles.statLabel}>Total{"\n"}Produk</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5' }]}>
              <ArrowDownLeft size={14} color="#10b981" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{totalIn}</Text>
              <Text style={styles.statLabel}>Masuk{"\n"}{dateLabel}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
              <ArrowUpRight size={14} color="#ef4444" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{totalOut}</Text>
              <Text style={styles.statLabel}>Keluar{"\n"}{dateLabel}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  // Ubah bagian statCard di StyleSheet
statCard: {
  backgroundColor: '#FFF',
  width: CARD_WIDTH,
  height: 65,
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 8,
  flexDirection: 'row',
  alignItems: 'flex-start',
  
  // Optimasi Bayangan: Kurangi elevation jika di Android terasa "kedip"
  elevation: 2, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  
  // Tambahkan border halus sebagai fallback agar struktur tetap kokoh
  borderWidth: 1,
  borderColor: '#f0f0f0', 
},
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2, // ✅ Sedikit padding dari atas
  },
  textContainer: {
    marginLeft: 6,
    flexShrink: 1,
    justifyContent: 'flex-start', // ✅ Konten mulai dari atas
    alignItems: 'flex-start', // ✅ Text align kiri
  },
  statValue: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: COLORS.textDark,
    lineHeight: 18,
    textAlign: 'left', // ✅ Explicit left align
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
    lineHeight: 11,
    textAlign: 'left', // ✅ Explicit left align
    marginTop: 0, // ✅ Remove negative margin
  },
});