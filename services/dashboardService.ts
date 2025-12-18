import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DashboardStats, ChartDataPoint } from '../types/dashboard.types';

export class DashboardService {
  /**
   * Fungsi untuk memformat angka ke mata uang Rupiah
   * Dipanggil di DashboardHeader
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  static async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const last7DaysMap = new Map<string, number>();
      const daysName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7DaysMap.set(daysName[d.getDay()], 0);
      }

      // Ambil Produk
      const productsSnap = await getDocs(collection(db, 'products'));
      let lowStockCount = 0;
      let inToday = 0;

      productsSnap.forEach(doc => {
        const data = doc.data();
        if (Number(data.stock || 0) < 10) lowStockCount++;
        const createdAt = data.createdAt?.toDate();
        if (createdAt && createdAt >= startOfToday) inToday++;
      });

      // Ambil Transaksi
      const transactionsSnap = await getDocs(collection(db, 'transactions'));
      let totalRevenue = 0;
      let totalExpense = 0;
      let outToday = 0;

      transactionsSnap.forEach(doc => {
        const data = doc.data();
        const tDate = data.date?.toDate();
        const total = Number(data.total || 0);

        totalRevenue += total;

        if (tDate) {
          const dayName = daysName[tDate.getDay()];
          if (last7DaysMap.has(dayName)) {
            last7DaysMap.set(dayName, (last7DaysMap.get(dayName) || 0) + total);
          }

          if (Array.isArray(data.items)) {
            data.items.forEach((item: any) => {
              const qty = Number(item.qty || 0);
              const purchasePrice = Number(item.purchasePrice || 0);
              totalExpense += (purchasePrice * qty);
              if (tDate >= startOfToday) outToday += qty;
            });
          }
        }
      });

      const weeklyData: ChartDataPoint[] = Array.from(last7DaysMap, ([label, value]) => ({
        value,
        label,
      }));

      return {
        totalProducts: productsSnap.size,
        totalTransactions: transactionsSnap.size,
        totalRevenue,
        totalExpense,
        totalProfit: totalRevenue - totalExpense,
        lowStockCount,
        inToday,
        outToday,
        weeklyData, // Data ini wajib dikembalikan
      };
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw error;
    }
  }
}