import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Package, ArrowDownLeft, ArrowUpRight, ClipboardList } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// PERHITUNGAN PRESISI:
// Layar - (Padding Layar 20*2) - (Gap antar card 10*2)
const PADDING_SCREEN = 40; 
const GAP = 10;
const CARD_WIDTH = (width - PADDING_SCREEN - (GAP * 2)) / 3;

interface StatsGridProps {
  totalProducts: number;
  inToday: number;
  outToday: number;
}

export const StatsGrid: React.FC<StatsGridProps> = React.memo(
  ({ totalProducts, inToday, outToday }) => {
    return (
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerTitle}>
          <ClipboardList size={20} color={COLORS.textDark} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Ringkasan Inventaris</Text>
        </View>

        {/* 3 Grid Layout */}
        <View style={styles.gridContainer}>
          {/* Card 1: Total */}
          <View style={styles.statCard}>
            <View style={styles.iconCircle}>
               <Package size={14} color="#059669" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{totalProducts}</Text>
              <Text style={styles.statLabel}>Total Produk</Text>
            </View>
          </View>

          {/* Card 2: Masuk */}
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5' }]}>
               <ArrowDownLeft size={14} color="#10b981" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{inToday}</Text>
              <Text style={styles.statLabel}>Masuk{"\n"}Hari ini</Text>

            </View>
          </View>

          {/* Card 3: Keluar */}
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
               <ArrowUpRight size={14} color="#ef4444" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statValue}>{outToday}</Text>
              <Text style={styles.statLabel}>Keluar{"\n"}Hari ini</Text>
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
    paddingLeft: 2, // Menyelaraskan dengan card
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold', // Sesuai config App.js Anda
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statCard: {
    backgroundColor: '#FFF',
    width: CARD_WIDTH,
    height: 65, // Tinggi seragam agar rapi
    borderRadius: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center konten di dalam card
    // Shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 6,
    flexShrink: 1, // Mencegah teks meluap jika angka besar
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
    marginTop: -2,
  },
});