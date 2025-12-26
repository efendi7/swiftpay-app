// components/dashboard/cashier/CashierDashboardHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image, Alert } from 'react-native';
import { ShoppingCart, Banknote } from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebaseConfig';
import { DashboardHeader } from '../DashboardHeader'; // Import parent
import { DashboardService } from '../../../services/dashboardService';
import { COLORS } from '../../../constants/colors';

interface CashierDashboardHeaderProps {
  headerHeight: Animated.AnimatedInterpolation<number | string>;
  contentOpacity: Animated.AnimatedInterpolation<number | string>;
  topPadding: number;
  role: string;
  displayName: string;
  todayTransactions: number;
  todayOut: number;
  todayRevenue: number;
}

export const CashierDashboardHeader: React.FC<CashierDashboardHeaderProps> = ({
  headerHeight,
  contentOpacity,
  topPadding,
  role,
  displayName,
  todayTransactions,
  todayOut,
  todayRevenue,
}) => {

  // --- LOGIKA KONDISI GAMBAR (Hanya 2 Kondisi) ---
  const isNeutral = todayRevenue === 0;
  
  const getStatusImage = () => {
    return isNeutral 
      ? require('../../../assets/images/dashboard/netral.png') 
      : require('../../../assets/images/dashboard/good.png');
  };

  const getStatusMessage = () => {
    return isNeutral ? 'Belum ada transaksi masuk.' : 'Kerja bagus! Terus semangat.';
  };

  // --- HELPER FORMAT ---
  const formatValue = (amount: number) => {
    if (amount >= 1000000) {
      const jt = (amount / 1000000).toFixed(1).replace(/\.0$/, '');
      return `Rp ${jt} jt`;
    }
    return DashboardService.formatCurrency(amount);
  };

  const showDetailValue = (label: string, value: number) => {
    Alert.alert(label, DashboardService.formatCurrency(value), [{ text: 'Oke' }]);
  };

  const avgSales = todayTransactions > 0 ? todayRevenue / todayTransactions : 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DashboardHeader
      headerHeight={headerHeight}
      contentOpacity={contentOpacity}
      topPadding={topPadding}
      displayName={displayName}
      role={role}
      gradientColors={[COLORS.primary, '#2c537a']} // Custom gradient untuk Cashier
      showNotification={false}
      showLogout={true}
      onLogoutPress={handleLogout}
    >
      {/* Konten Spesifik Cashier */}
      <View style={styles.cashierContent}>
        {/* SECTION: REVENUE CARD (Klik untuk Detail) */}
        <TouchableOpacity 
          style={styles.profitCard} 
          onPress={() => showDetailValue('Total Penjualan Hari Ini', todayRevenue)}
        >
          <View style={styles.profitLeft}>
            <Text style={styles.profitValue} numberOfLines={1}>
              {formatValue(todayRevenue)}
            </Text>
            <Text style={styles.profitMessage}>{getStatusMessage()}</Text>
          </View>
          
          <View style={styles.profitImageWrapper}>
            <Image 
              source={getStatusImage()} 
              style={styles.profitImage} 
              resizeMode="contain" 
            />
          </View>
        </TouchableOpacity>

        {/* SECTION: BOTTOM STATS */}
        <View style={styles.bottomStats}>
          {/* Kolom Transaksi */}
          <View style={styles.bottomCardCompact}>
            <View style={styles.iconBoxGreen}>
              <ShoppingCart size={14} color={COLORS.secondary} />
            </View>
            <View style={styles.bottomTextWrap}>
              <Text style={styles.bottomLabel}>Transaksi</Text>
              <Text style={styles.bottomValue}>
                {todayTransactions} <Text style={styles.unitText}>Nota</Text>
                <Text style={styles.separator}> • </Text>
                {todayOut} <Text style={styles.unitText}>Unit</Text>
              </Text>
            </View>
          </View>

          {/* Kolom Avg Sales (Klik untuk Detail) */}
          <TouchableOpacity 
            style={styles.bottomCardCompact}
            onPress={() => showDetailValue('Rata-rata Penjualan (Avg Sales)', avgSales)}
          >
            <View style={styles.iconBoxYellow}>
              <Banknote size={14} color="#B8860B" />
            </View>
            <View style={styles.bottomTextWrap}>
              <Text style={styles.bottomLabel}>Avg Sales</Text>
              <Text style={styles.bottomValue} numberOfLines={1}>
                {formatValue(avgSales)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </DashboardHeader>
  );
};

const styles = StyleSheet.create({
  cashierContent: {
    marginTop: 10,
    gap: 12,
  },
  profitCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitLeft: {
    flex: 1,
  },
  profitValue: {
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    color: '#A5FFB0',
  },
  profitMessage: {
    fontSize: 11,
    fontFamily: 'PoppinsMedium',
    color: '#FFF',
    opacity: 0.8,
  },
  profitImageWrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profitImage: {
    width: 70,
    height: 70,
    position: 'absolute',
    right: -10,
  },
  bottomStats: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomCardCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  bottomTextWrap: {
    marginLeft: 8,
    flex: 1,
  },
  bottomLabel: {
    fontSize: 9,
    color: '#FFF',
    opacity: 0.8,
    fontFamily: 'PoppinsRegular',
  },
  bottomValue: {
    fontSize: 11,
    color: '#FFF',
    fontFamily: 'PoppinsBold',
  },
  unitText: {
    fontSize: 8,
    opacity: 0.8,
    fontFamily: 'PoppinsRegular',
  },
  separator: {
    fontSize: 10,
    color: '#A5FFB0',
  },
  iconBoxGreen: {
    backgroundColor: '#E9F9EF',
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxYellow: {
    backgroundColor: '#FFF9E6',
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});