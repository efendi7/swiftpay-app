import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { TrendingUp, TrendingDown, Siren, HeartPulse } from 'lucide-react-native';
import { COLORS } from '../../../../../constants/colors';
import { 
  BaseDashboardHeader, 
  sharedHeaderStyles, 
  RenderFormatFn, 
  RenderDetailFn 
} from '../../../../../components/dashboard/header/BaseDashboardHeader';
import { getMoodConfig } from '../../../../../components/dashboard/header/headerUtils';

interface AdminDashboardHeaderProps {
  headerHeight: Animated.AnimatedInterpolation<number | string>;
  revenueOpacity: Animated.AnimatedInterpolation<number | string>;
  topPadding: number;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  lowStockCount: number;
  onLowStockPress: () => void;
  role?: string;
  displayName: string;
}

export const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = (props) => {
  const mood = getMoodConfig(props.totalProfit, props.totalRevenue);

  const renderNotificationButton = () => (
    <TouchableOpacity
      style={[styles.bellCircle, { backgroundColor: props.lowStockCount > 0 ? '#FEE2E2' : '#D1FAE5' }]}
      onPress={props.onLowStockPress}
    >
      {props.lowStockCount > 0 ? <Siren size={18} color="#EF4444" /> : <HeartPulse size={18} color="#10B981" />}
    </TouchableOpacity>
  );

  return (
    <BaseDashboardHeader
      headerHeight={props.headerHeight}
      contentOpacity={props.revenueOpacity}
      topPadding={props.topPadding}
      role={props.role || 'Administrator'}
      displayName={props.displayName}
      renderNotificationButton={renderNotificationButton}
      renderMainCard={(format: RenderFormatFn) => (
        <View style={sharedHeaderStyles.profitCard}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, color: mood.color, fontFamily: 'PoppinsBold' }}>{format(props.totalProfit)}</Text>
            <Text style={{ color: mood.color, fontSize: 11 }}>{mood.msg}</Text>
          </View>
          <Image source={mood.img} style={{ width: 60, height: 60 }} resizeMode="contain" />
        </View>
      )}
      renderBottomStats={(format: RenderFormatFn, showDetail: RenderDetailFn) => (
        <View style={sharedHeaderStyles.bottomStats}>
          <TouchableOpacity style={sharedHeaderStyles.bottomCardCompact} onPress={() => showDetail('Total Pendapatan', props.totalRevenue)}>
            <View style={[sharedHeaderStyles.iconBox, { backgroundColor: '#E9F9EF' }]}><TrendingUp size={14} color={COLORS.secondary} /></View>
            <View style={{ marginLeft: 8 }}>
              <Text style={sharedHeaderStyles.bottomLabel}>Pendapatan</Text>
              <Text style={sharedHeaderStyles.bottomValue}>{format(props.totalRevenue)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={sharedHeaderStyles.bottomCardCompact} onPress={() => showDetail('Total Pengeluaran', props.totalExpense)}>
            <View style={[sharedHeaderStyles.iconBox, { backgroundColor: '#FDECEA' }]}><TrendingDown size={14} color="#E74C3C" /></View>
            <View style={{ marginLeft: 8 }}>
              <Text style={sharedHeaderStyles.bottomLabel}>Pengeluaran</Text>
              <Text style={sharedHeaderStyles.bottomValue}>{format(props.totalExpense)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  bellCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bottomLabel: { fontSize: 9, color: '#FFF', opacity: 0.8 },
  bottomValue: { fontSize: 11, color: '#FFF', fontFamily: 'PoppinsBold' },
});