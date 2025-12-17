// src/screens/Main/CashierDashboard.tsx - MODERN DESIGN UNTUK KASIR

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { auth, db } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

type CashierDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CashierDashboard'
>;

const { width } = Dimensions.get('window');

// Warna yang sama dengan AdminDashboard agar konsisten
const COLORS = {
  primary: '#1C3A5A',
  secondary: '#00A79D',
  accent: '#F58220',
  background: '#F5F5F5',
  cardBg: '#FFFFFF',
  textDark: '#444444',
  textLight: '#7f8c8d',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
};

const CashierDashboard = () => {
  const navigation = useNavigation<CashierDashboardNavigationProp>();

  // State statistik kasir (hanya transaksi hari ini)
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Tentukan awal hari ini (00:00:00)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'transactions'),
        where('cashierId', '==', currentUser.uid),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      setTodayTransactions(snapshot.size);

      let revenue = 0;
      snapshot.forEach((doc) => {
        revenue += doc.data().total || 0;
      });
      setTodayRevenue(revenue);
    } catch (error) {
      console.error('Error fetching cashier data:', error);
      Alert.alert('Error', 'Gagal memuat data hari ini');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Komponen Stat Card
  const StatCard = ({ title, value, subtitle, color, icon }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.statCardContent}>
        <View>
          <Text style={styles.statLabel}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
          <Text style={{ fontSize: 28 }}>{icon}</Text>
        </View>
      </View>
    </View>
  );

  // Komponen Menu Card
  const MenuCard = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
        <Text style={{ fontSize: 36 }}>{icon}</Text>
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <View style={[styles.menuArrow, { backgroundColor: color }]}>
        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Halo, Kasir!</Text>
            <Text style={styles.headerName}>SwiftPay POS</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={{ fontSize: 24 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statistik Hari Ini */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Ringkasan Hari Ini</Text>

          <View style={styles.statsRow}>
            <StatCard
              title="Transaksi"
              value={loading ? '...' : todayTransactions}
              subtitle="Penjualan hari ini"
              color={COLORS.accent}
              icon="🛒"
            />
            <StatCard
              title="Pendapatan"
              value={loading ? '...' : formatCurrency(todayRevenue)}
              subtitle="Total hari ini"
              color={COLORS.success}
              icon="💰"
            />
          </View>
        </View>

        {/* Menu Cepat */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>⚡ Menu Cepat</Text>

          <View style={styles.menuGrid}>
            <MenuCard
              title="Mulai Penjualan"
              icon="🏪"
              color={COLORS.success}
              onPress={() => navigation.navigate('Cashier')}
            />

            <MenuCard
              title="Riwayat Transaksi"
              icon="📈"
              color={COLORS.secondary}
              onPress={() => navigation.navigate('Transaction')}
            />
          </View>
        </View>

        {/* Tips / Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Informasi</Text>
          <Text style={styles.infoText}>
            Anda hanya dapat melihat dan mengelola transaksi yang Anda lakukan sendiri.
            Semangat berjualan hari ini! 🚀
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  headerName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: -10,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  statSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: (width - 50) / 2,
    backgroundColor: COLORS.cardBg,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  menuArrow: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: COLORS.secondary + '15',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
});

export default CashierDashboard;