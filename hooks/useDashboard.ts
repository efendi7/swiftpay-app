import { useState, useCallback, useEffect } from 'react';
import { DashboardService } from '../services/dashboardService';
import { DashboardStats, DateRange } from '../types/dashboard.types';

export const useDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, totalTransactions: 0, totalRevenue: 0, totalExpense: 0,
    totalProfit: 0, lowStockCount: 0, totalIn: 0, totalOut: 0, weeklyData: [],
  });

  const [dateRange, setDateRange] = useState<DateRange>(DashboardService.getPresetDateRange('today'));
  const [selectedPreset, setSelectedPreset] = useState<'today' | 'week' | 'month' | 'year'>('today');

  const refreshData = useCallback(async (customRange?: DateRange) => {
    setLoading(true);
    try {
      const targetRange = customRange || dateRange;
      const data = await DashboardService.fetchDashboardStats(targetRange);
      // React 18+ otomatis melakukan batching pada setStats dan setDateRange
      setStats(data);
      if (customRange) setDateRange(customRange);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const setPresetRange = useCallback((preset: 'today' | 'week' | 'month' | 'year') => {
    setSelectedPreset(preset);
    const range = DashboardService.getPresetDateRange(preset);
    refreshData(range);
  }, [refreshData]);

  useEffect(() => { refreshData(); }, []);

  return { loading, stats, dateRange, selectedPreset, refreshData, setPresetRange };
};