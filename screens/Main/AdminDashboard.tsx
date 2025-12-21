import React, { useRef, useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  StatusBar, 
  ActivityIndicator, 
  RefreshControl,
  Modal,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { X } from 'lucide-react-native'; // Tambah import X
import { COLORS } from '../../constants/colors';
import { useDashboard } from '../../hooks/useDashboard';

// Components
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatsGrid } from '../../components/dashboard/StatsGrid';
import { DashboardChart } from '../../components/dashboard/DashboardChart';
import { DateRangeSelector } from '../../components/dashboard/DateRangeSelector';
import { ProductRankingCard } from '../../components/dashboard/ProductRankingCard';
import { RecentActivityCard } from '../../components/dashboard/RecentActivityCard';

const AdminDashboard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { loading, stats, activities, selectedPreset, refreshData, setPresetRange } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // State Modal
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
          paddingTop: HEADER_MAX_HEIGHT + 4,
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

        <View style={styles.loadingWrapper}>
          {loading && !refreshing && (
            <ActivityIndicator size="small" color={COLORS.secondary} />
          )}
        </View>

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
            <DashboardChart 
              data={stats.weeklyData} 
              isLoading={loading}
              selectedPreset={selectedPreset}
            />
          </View>

          <View style={styles.rankingSection}>
            <ProductRankingCard 
              title="Top 10 Penjualan Produk"
              data={stats.salesRanking || []}
              unit="Terjual"
              color={COLORS.primary}
            />

            <ProductRankingCard 
              title="Top 10 Stok Produk"
              data={stats.stockRanking || []}
              unit="Unit"
              color="#3b82f6" 
            />

            {/* TAMPILKAN 5 AKTIVITAS TERBARU */}
            <RecentActivityCard 
              activities={activities.slice(0, 5)}
              onSeeMore={() => setModalVisible(true)}
            />
          </View>
        </View>

        <Text style={styles.footerBrand}>Swiftstock by Efendi 2025</Text>
      </Animated.ScrollView>

      {/* MODAL RIWAYAT LENGKAP */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: insets.top + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Riwayat Aktivitas</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                <RecentActivityCard 
                  activities={activities}
                  onSeeMore={() => {}} // Sembunyikan tombol di dalam modal
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingWrapper: { 
    height: 0, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginVertical: 4,
  },
  contentWrapper: {
    marginTop: 0,
    minHeight: 400, 
  },
  chartWrapper: {
    marginTop: 10,
    minHeight: 220,
  },
  rankingSection: {
    marginTop: 20,
    paddingBottom: 20,
    gap: 15, // Diperbesar sedikit agar tidak terlalu rapat
  },
  footerBrand: { 
    textAlign: 'center', 
    color: COLORS.textLight, 
    fontSize: 11, 
    marginTop: 40, 
    fontFamily: 'PoppinsRegular' 
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: COLORS.textDark,
  },
});

export default AdminDashboard;