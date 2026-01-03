import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { ShoppingCart, Banknote } from 'lucide-react-native';
import { COLORS } from '../../../../../constants/colors';
import { 
  BaseDashboardHeader, 
  sharedHeaderStyles, 
  RenderFormatFn, 
  RenderDetailFn 
} from '../../../../../components/dashboard/header/BaseDashboardHeader';
import { getMoodConfig } from '../../../../../components/dashboard/header/headerUtils';

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

export const CashierDashboardHeader: React.FC<CashierDashboardHeaderProps> = (props) => {
  const mood = getMoodConfig(props.todayRevenue, props.todayRevenue);
  const avgSales = props.todayTransactions > 0 ? props.todayRevenue / props.todayTransactions : 0;

  return (
    <BaseDashboardHeader
      headerHeight={props.headerHeight}
      contentOpacity={props.contentOpacity}
      topPadding={props.topPadding}
      role={props.role}
      displayName={props.displayName}
      renderMainCard={(format: RenderFormatFn) => (
        <View style={sharedHeaderStyles.profitCard}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, color: '#A5FFB0', fontFamily: 'PoppinsBold' }}>{format(props.todayRevenue)}</Text>
            <Text style={{ color: '#FFF', opacity: 0.8 }}>{mood.msg}</Text>
          </View>
          <Image source={mood.img} style={{ width: 60, height: 60 }} resizeMode="contain" />
        </View>
      )}
      renderBottomStats={(format: RenderFormatFn, showDetail: RenderDetailFn) => (
        <View style={sharedHeaderStyles.bottomStats}>
          <View style={sharedHeaderStyles.bottomCardCompact}>
            <View style={[sharedHeaderStyles.iconBox, { backgroundColor: '#E9F9EF' }]}><ShoppingCart size={14} color={COLORS.secondary} /></View>
            <View style={{ marginLeft: 8 }}>
              <Text style={sharedHeaderStyles.bottomLabel}>Transaksi</Text>
              <Text style={sharedHeaderStyles.bottomValue}>{props.todayTransactions} Nota • {props.todayOut} Unit</Text>
            </View>
          </View>
          <TouchableOpacity style={sharedHeaderStyles.bottomCardCompact} onPress={() => showDetail('Avg Sales', avgSales)}>
            <View style={[sharedHeaderStyles.iconBox, { backgroundColor: '#FFF9E6' }]}><Banknote size={14} color="#B8860B" /></View>
            <View style={{ marginLeft: 8 }}>
              <Text style={sharedHeaderStyles.bottomLabel}>Avg Sales</Text>
              <Text style={sharedHeaderStyles.bottomValue}>{format(avgSales)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};