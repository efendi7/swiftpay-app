import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { LowStockAlert } from '../../components/dashboard/LowStockAlert';
import { BottomNavigation } from '../../components/dashboard/BottomNavigation';
import AddProductModal from './modal/AddProductModal';

type AdminDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;

const AdminDashboard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { loading, stats, refreshData } = useDashboard();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showAddProduct, setShowAddProduct] = useState(false);

  const HEADER_MAX_HEIGHT = 230 + insets.top;
  const HEADER_MIN_HEIGHT = 70 + insets.top;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshData);
    return unsubscribe;
  }, [navigation, refreshData]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const revenueOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <DashboardHeader
        headerHeight={headerHeight}
        revenueOpacity={revenueOpacity}
        topPadding={insets.top + 10}
        totalRevenue={stats.totalRevenue}
        totalExpense={stats.totalExpense}
        totalProfit={stats.totalProfit}
      />

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT + 12,
          paddingBottom: 100 + insets.bottom,
          paddingHorizontal: 20,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* 1. Grid 3 Kolom */}
            <StatsGrid
              totalProducts={stats.totalProducts}
              inToday={stats.inToday}
              outToday={stats.outToday}
            />

            {/* 2. Chart Tren Penjualan */}
            <DashboardChart data={stats.weeklyData} />

            {/* 3. Alert Stok Rendah */}
            <LowStockAlert
              count={stats.lowStockCount}
              onPress={() => navigation.navigate('Product')}
            />

            <View style={styles.demoContent}>
              <Text style={styles.demoText}>SwiftPay Analytics Engine</Text>
            </View>

            <Text style={styles.footerBrand}>SwiftPay Ecosystem v1.0 • 2025</Text>
          </>
        )}
      </Animated.ScrollView>

      <BottomNavigation
        onInventoryPress={() => navigation.navigate('Product')}
        onReportPress={() => navigation.navigate('Transaction')}
        onFabPress={() => setShowAddProduct(true)}
        bottomInset={insets.bottom}
      />

      <AddProductModal
        visible={showAddProduct}
        onClose={() => {
          setShowAddProduct(false);
          refreshData();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  demoContent: {
    height: 100,
    marginTop: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  demoText: { 
    color: COLORS.textLight, 
    fontFamily: 'PoppinsRegular',
    fontSize: 12 
  },
  footerBrand: { 
    textAlign: 'center', 
    color: COLORS.textLight, 
    fontSize: 11, 
    marginTop: 40,
    fontFamily: 'PoppinsRegular' 
  },
});

export default AdminDashboard;