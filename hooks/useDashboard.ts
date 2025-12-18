import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { DashboardStats } from '../types/dashboard.types';
import { DashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // Inisialisasi state harus lengkap sesuai interface DashboardStats
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalExpense: 0,
    totalProfit: 0,
    lowStockCount: 0,
    inToday: 0,
    outToday: 0,
    weeklyData: [], // WAJIB ADA untuk memperbaiki error TS2345
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DashboardService.fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error',
        'Gagal memuat data dashboard',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    stats,
    refreshData: fetchDashboardData,
  };
};