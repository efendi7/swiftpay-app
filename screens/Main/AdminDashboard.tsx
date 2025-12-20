import React, { useRef, useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  StatusBar, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { DateRangeSelector } from '../../components/dashboard/DateRangeSelector';

const AdminDashboard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { loading, stats, selectedPreset, refreshData, setPresetRange } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_MAX_HEIGHT = 230 + insets.top;
  const HEADER_MIN_HEIGHT = 70 + insets.top;

  useFocusEffect(useCallback(() => { refreshData(); }, [refreshData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const getDateLabel = () => {
    const labels: Record<string, string> = { 
      today: 'Hari ini', 
      week: '7 Hari', 
      month: '30 Hari', 
      year: '1 Tahun' 
    };
    return labels[selectedPreset] || 'Hari ini';
  };

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
        lowStockCount={stats.lowStockCount}
        onLowStockPress={() => navigation.navigate('Product')}
      />

      <Animated.ScrollView
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
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            progressViewOffset={HEADER_MAX_HEIGHT} 
            colors={[COLORS.secondary]}
          />
        }
      >
        <DateRangeSelector 
          selectedPreset={selectedPreset} 
          onSelectPreset={setPresetRange} 
        />

        {/* Loading Indicator yang stabil di satu posisi */}
        <View style={styles.loadingWrapper}>
          {loading && !refreshing && (
            <ActivityIndicator size="small" color={COLORS.secondary} />
          )}
        </View>

        {/* Wrapper Konten: renderToHardwareTextureAndroid mencegah border kedip abu-abu */}
        <View 
          renderToHardwareTextureAndroid={true}
          style={[
            styles.contentWrapper, 
            { opacity: loading && !refreshing ? 0.7 : 1 }
          ]}
        >
          <StatsGrid
            totalProducts={stats.totalProducts}
            totalIn={stats.totalIn}
            totalOut={stats.totalOut}
            dateLabel={getDateLabel()}
          />

          <View style={styles.chartWrapper}>
            <DashboardChart data={stats.weeklyData} />
          </View>
          
          <View style={styles.demoContent}>
            <Text style={styles.demoText}>SwiftPay Analytics Engine</Text>
          </View>
        </View>

        <Text style={styles.footerBrand}>SwiftPay Ecosystem v1.0 • 2025</Text>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  loadingWrapper: { 
    height: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  contentWrapper: {
    // Memberikan minHeight mencegah layout jumping yang bikin border kedip
    minHeight: 400, 
  },
  chartWrapper: {
    marginTop: 10,
    minHeight: 220, // Sesuaikan dengan tinggi DashboardChart Anda
  },
  demoContent: {
    height: 100, 
    marginTop: 20, 
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
    fontSize: 12, 
    fontFamily: 'PoppinsRegular' 
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