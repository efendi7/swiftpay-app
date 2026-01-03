import React, { ReactNode } from 'react';
import { View, StyleSheet, Animated, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebaseConfig';
import { COLORS } from '../../../constants/colors';
import { DashboardService } from '../../../services/dashboardService';
import { HeaderUserInfo } from './HeaderUserInfo';
import { HeaderActions } from './HeaderActions';

// Definisi Tipe untuk Props Fungsi Render
export type RenderFormatFn = (val: number) => string;
export type RenderDetailFn = (label: string, value: number) => void;

interface BaseDashboardHeaderProps {
  headerHeight: Animated.AnimatedInterpolation<number | string>;
  contentOpacity: Animated.AnimatedInterpolation<number | string>;
  topPadding: number;
  role: string;
  displayName: string;
  renderNotificationButton?: () => ReactNode;
  renderMainCard: (format: RenderFormatFn, showDetail: RenderDetailFn) => ReactNode;
  renderBottomStats: (format: RenderFormatFn, showDetail: RenderDetailFn) => ReactNode;
}

export const sharedHeaderStyles = StyleSheet.create({
  profitCard: { 
    marginTop: 10, backgroundColor: 'rgba(255,255,255,0.15)', 
    borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14, 
    flexDirection: 'row', alignItems: 'center' 
  },
  bottomStats: { marginTop: 12, flexDirection: 'row', gap: 8 },
  bottomCardCompact: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 8, 
    paddingHorizontal: 10, borderRadius: 14 
  },
  iconBox: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  bottomLabel: { fontSize: 9, color: '#FFF', opacity: 0.8, fontFamily: 'PoppinsRegular' },
  bottomValue: { fontSize: 11, color: '#FFF', fontFamily: 'PoppinsBold' },
});

export const BaseDashboardHeader: React.FC<BaseDashboardHeaderProps> = ({
  headerHeight, contentOpacity, topPadding, role, displayName,
  renderNotificationButton, renderMainCard, renderBottomStats,
}) => {

  const formatValue = (val: number) => {
    const absVal = Math.abs(val);
    let result = absVal >= 1000000 ? `Rp ${(absVal / 1000000).toFixed(1)} jt` : DashboardService.formatCurrency(absVal);
    return val < 0 ? `-${result}` : result;
  };

  const showDetailValue = (label: string, value: number) => {
    Alert.alert(label, DashboardService.formatCurrency(value), [{ text: 'Oke' }]);
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error('Logout error:', e); }
  };

  return (
    <Animated.View style={[styles.header, { height: headerHeight, paddingTop: topPadding }]}>
      <LinearGradient colors={[COLORS.primary, '#2c537a']} style={StyleSheet.absoluteFill} />

      <View style={styles.headerTop}>
        <HeaderUserInfo role={role} displayName={displayName} />
        <HeaderActions onLogout={handleLogout} renderNotification={renderNotificationButton} />
      </View>

      <Animated.View style={{ opacity: contentOpacity }}>
        {renderMainCard(formatValue, showDetailValue)}
      </Animated.View>

      {renderBottomStats(formatValue, showDetailValue)}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: { 
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, 
    paddingHorizontal: 20, paddingBottom: 25, 
    borderBottomLeftRadius: 35, borderBottomRightRadius: 35, 
    overflow: 'hidden', elevation: 8 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50, marginBottom: 5 },
});