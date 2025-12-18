export interface ChartDataPoint {
  value: number;
  label: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalTransactions: number;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  lowStockCount: number;
  inToday: number;
  outToday: number;
  weeklyData: ChartDataPoint[]; // Untuk komponen DashboardChart
}