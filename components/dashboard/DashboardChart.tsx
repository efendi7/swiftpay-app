import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { COLORS } from '../../constants/colors';
import { TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DashboardChartProps {
  data?: any[];
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
  // Urutan: Senin -> Minggu
  const defaultData = [
    { value: 0, label: 'Sen' }, 
    { value: 0, label: 'Sel' }, 
    { value: 0, label: 'Rab' },
    { value: 0, label: 'Kam' }, 
    { value: 0, label: 'Jum' }, 
    { value: 0, label: 'Sab' },
    { value: 0, label: 'Min' }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  // Hitung total dan rata-rata untuk info tambahan
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const avgValue = totalValue / chartData.length;
  const maxValue = Math.max(...chartData.map(item => item.value));
  
  // Cek apakah semua nilai adalah 0
  const hasValidData = totalValue > 0;

  // Hitung rentang minggu ini (Senin - Minggu)
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Senin minggu ini
    
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    };
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <TrendingUp size={18} color={COLORS.primary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Tren Penjualan Minggu Ini</Text>
          <Text style={styles.subtitle}>
            Total: Rp {totalValue.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        {hasValidData ? (
          <LineChart
            areaChart
            curved
            data={chartData}
            width={width - 100}
            height={180}
            hideDataPoints={false}
            dataPointsColor={COLORS.primary}
            dataPointsRadius={4}
            dataPointsHeight={8}
            dataPointsWidth={8}
            spacing={(width - 100) / (chartData.length + 1)}
            color={COLORS.primary}
            thickness={3}
            startFillColor="rgba(20, 158, 136, 0.4)"
            endFillColor="rgba(20, 158, 136, 0.05)"
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={20}
            endSpacing={20}
            noOfSections={4}
            maxValue={maxValue > 0 ? maxValue * 1.2 : 100}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor="#E5E7EB"
            rulesType="solid"
            rulesColor="#F3F4F6"
            rulesThickness={1}
            hideYAxisText
            showVerticalLines={false}
            disableScroll
            animateOnDataChange
            animationDuration={800}
            onDataChangeAnimationDuration={300}
            pointerConfig={{
              pointerStripHeight: 180,
              pointerStripColor: COLORS.primary,
              pointerStripWidth: 2,
              strokeDashArray: [4, 4],
              pointerColor: COLORS.primary,
              radius: 6,
              pointerLabelWidth: 140,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: any) => {
                const item = items[0];
                return (
                  <View style={styles.tooltipContainer}>
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipDay}>{item.label}</Text>
                      <Text style={styles.tooltipValue}>
                        Rp {item.value.toLocaleString('id-ID')}
                      </Text>
                      {item.value > 0 && (
                        <Text style={styles.tooltipPercent}>
                          {((item.value / maxValue) * 100).toFixed(0)}% dari max
                        </Text>
                      )}
                    </View>
                    <View style={styles.tooltipArrow} />
                  </View>
                );
              },
            }}
            xAxisLabelTextStyle={styles.xAxisText}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>Belum ada data penjualan minggu ini</Text>
            <Text style={styles.emptyChartSubtext}>Mulai transaksi untuk melihat grafik</Text>
          </View>
        )}
      </View>

      {/* Stats Row */}
      {totalValue > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rata-rata</Text>
            <Text style={styles.statValue}>
              Rp {Math.round(avgValue).toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tertinggi</Text>
            <Text style={styles.statValue}>
              Rp {maxValue.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      )}

      {/* Week Range Info */}
      <View style={styles.weekRangeContainer}>
        <Text style={styles.weekRangeText}>
          Periode: {getWeekRange()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    padding: 8,
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  xAxisText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 5,
  },
  tooltipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    backgroundColor: COLORS.textDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.textDark,
    marginTop: -1,
  },
  tooltipDay: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    marginBottom: 4,
    opacity: 0.9,
  },
  tooltipValue: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    marginBottom: 2,
  },
  tooltipPercent: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: 'PoppinsMedium',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textDark,
  },
  emptyChart: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    width: width - 100,
  },
  emptyChartText: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  emptyChartSubtext: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
    opacity: 0.7,
  },
  weekRangeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  weekRangeText: {
    fontSize: 11,
    fontFamily: 'PoppinsMedium',
    color: COLORS.textLight,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});