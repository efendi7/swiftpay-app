import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LogOut,
  TrendingUp,
  TrendingDown,
  Siren,
  HeartPulse,
} from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { COLORS } from '../../constants/colors';
import { DashboardService } from '../../services/dashboardService';

interface DashboardHeaderProps {
  headerHeight: Animated.AnimatedInterpolation<number>;
  revenueOpacity: Animated.AnimatedInterpolation<number>;
  topPadding: number;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  lowStockCount: number;
  onLowStockPress: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  headerHeight,
  revenueOpacity,
  topPadding,
  totalRevenue,
  totalExpense,
  totalProfit,
  lowStockCount,
  onLowStockPress,
}) => {
  // --- LOGIKA KONDISI PROFIT ---
  const isNeutral = totalProfit === 0;
  const isProfit = totalProfit > 0;

  const getStatusColor = () => {
    if (isNeutral) return '#FFFF00';
    return isProfit ? '#A5FFB0' : '#FFB3B3';
  };

  const getStatusMessage = () => {
    if (isNeutral) return 'masih kosong nih, yuk jualan!';
    return isProfit ? 'wah lagi untung nih!' : 'belum balik modal nih!';
  };

  const getStatusImage = () => {
    if (isNeutral) return require('../../assets/images/dashboard/netral.png');
    return isProfit 
      ? require('../../assets/images/dashboard/good.png') 
      : require('../../assets/images/dashboard/sad.png');
  };

  // --- HELPER TRUNCATE RUPIAH ---
  const formatCompact = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} rb`;
    return DashboardService.formatCurrency(val);
  };

  const showDetailValue = (label: string, value: number) => {
    Alert.alert(label, DashboardService.formatCurrency(value), [{ text: 'Oke' }]);
  };

  // --- LOGIKA BELL ALERT ---
  const hasLowStock = lowStockCount > 0;
  const bellColor = hasLowStock ? '#EF4444' : '#10B981';
  const bellBgColor = hasLowStock ? '#FEE2E2' : '#D1FAE5';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Animated.View
      style={[
        styles.header,
        { height: headerHeight, paddingTop: topPadding },
      ]}
    >
      <LinearGradient
        colors={[COLORS.primary, '#2c537a']}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER TOP */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Selamat Datang,</Text>
          <Text style={styles.adminName}>Administrator</Text>
        </View>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity
            style={[styles.bellCircle, { backgroundColor: bellBgColor }]}
            onPress={onLowStockPress}
          >
            {hasLowStock ? <Siren size={20} color={bellColor} /> : <HeartPulse size={20} color={bellColor} />}
            {hasLowStock && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{lowStockCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutCircle} onPress={handleLogout}>
            <LogOut size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PROFIT CARD */}
      <Animated.View style={[styles.profitCard, { opacity: revenueOpacity }]}>
        <TouchableOpacity 
          style={styles.profitLeft} 
          onPress={() => showDetailValue('Total Laba/Rugi', totalProfit)}
        >
          <Text
            numberOfLines={1}
            style={[styles.profitValue, { color: getStatusColor() }]}
          >
            {formatCompact(totalProfit)}
          </Text>
          <Text style={[styles.profitMessage, { color: getStatusColor() }]}>
            {getStatusMessage()}
          </Text>
        </TouchableOpacity>

        <View style={styles.profitImageWrapper}>
          <Image source={getStatusImage()} style={styles.profitImage} resizeMode="contain" />
        </View>
      </Animated.View>

      {/* BOTTOM STATS */}
      <View style={styles.bottomStats}>
        <TouchableOpacity 
          style={styles.bottomCardCompact}
          onPress={() => showDetailValue('Total Pendapatan', totalRevenue)}
        >
          <View style={styles.iconBoxGreen}>
            <TrendingUp size={16} color={COLORS.secondary} />
          </View>
          <View style={styles.bottomTextWrap}>
            <Text style={styles.bottomLabel}>Pendapatan</Text>
            <Text style={styles.bottomValue} numberOfLines={1}>
              {formatCompact(totalRevenue)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomCardCompact}
          onPress={() => showDetailValue('Total Pengeluaran', totalExpense)}
        >
          <View style={styles.iconBoxRed}>
            <TrendingDown size={16} color="#E74C3C" />
          </View>
          <View style={styles.bottomTextWrap}>
            <Text style={styles.bottomLabel}>Pengeluaran</Text>
            <Text style={styles.bottomValue} numberOfLines={1}>
              {formatCompact(totalExpense)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 5,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50 },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'PoppinsRegular' },
  adminName: { color: '#FFF', fontSize: 20, fontFamily: 'MontserratBold' },
  headerRightButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontFamily: 'PoppinsBold' },
  logoutCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  profitCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitLeft: { flex: 1 },
  profitValue: { fontSize: 22, fontFamily: 'PoppinsBold' },
  profitMessage: { fontSize: 11, marginTop: -2, fontFamily: 'PoppinsMedium' },
  profitImageWrapper: { width: 60, height: 50, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  profitImage: { width: 85, height: 85, position: 'absolute', right: -12, top: -18 },

  bottomStats: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  bottomCardCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 14,
  },
  bottomTextWrap: { marginLeft: 8, flex: 1 },
  bottomLabel: { fontSize: 10, color: '#FFF', opacity: 0.8, fontFamily: 'PoppinsRegular' },
  bottomValue: { fontSize: 13, color: '#FFF', fontFamily: 'PoppinsBold' },
  iconBoxGreen: { backgroundColor: '#E9F9EF', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  iconBoxRed: { backgroundColor: '#FDECEA', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});