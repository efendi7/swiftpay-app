import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DashboardStats, ChartDataPoint, DateRange } from '../types/dashboard.types';

export class DashboardService {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(amount);
  }

  static async fetchDashboardStats(dateRange: DateRange): Promise<DashboardStats> {
    try {
      const startTimestamp = Timestamp.fromDate(dateRange.startDate);
      const endTimestamp = Timestamp.fromDate(dateRange.endDate);

      // 1. Total Produk (Static/Global)
      const productsSnap = await getDocs(collection(db, 'products'));
      let lowStockCount = 0;
      productsSnap.forEach(doc => {
        if (Number(doc.data().stock || 0) < 10) lowStockCount++;
      });

      // 2. Stock In (Filtered)
      const inQuery = query(collection(db, 'stock_purchases'), 
        where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
      const inSnap = await getDocs(inQuery);
      let totalExpense = 0, totalIn = 0;
      inSnap.forEach(doc => {
        totalExpense += Number(doc.data().totalCost || 0);
        totalIn += Number(doc.data().quantity || 0);
      });

      // 3. Transactions (Filtered)
      const outQuery = query(collection(db, 'transactions'), 
        where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
      const outSnap = await getDocs(outQuery);
      let totalRevenue = 0, totalOut = 0;
      
      // Map untuk chart (7 hari terakhir)
      const last7DaysMap = new Map();
      const daysName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7DaysMap.set(daysName[d.getDay()], 0);
      }

      outSnap.forEach(doc => {
        const data = doc.data();
        const total = Number(data.total || 0);
        totalRevenue += total;
        
        const tDate = data.date?.toDate();
        if (tDate) {
          const dayName = daysName[tDate.getDay()];
          if (last7DaysMap.has(dayName)) {
            last7DaysMap.set(dayName, (last7DaysMap.get(dayName) || 0) + total);
          }
          if (Array.isArray(data.items)) {
            data.items.forEach((item: any) => totalOut += Number(item.qty || 0));
          }
        }
      });

      return {
        totalProducts: productsSnap.size,
        totalTransactions: outSnap.size,
        totalRevenue,
        totalExpense,
        totalProfit: totalRevenue - totalExpense,
        lowStockCount,
        totalIn,
        totalOut,
        weeklyData: Array.from(last7DaysMap, ([label, value]) => ({ value, label })),
      };
    } catch (error) { throw error; }
  }

  static getPresetDateRange(preset: 'today' | 'week' | 'month' | 'year'): DateRange {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (preset === 'week') start.setDate(start.getDate() - 7);
    else if (preset === 'month') start.setMonth(start.getMonth() - 1);
    else if (preset === 'year') start.setFullYear(start.getFullYear() - 1);

    return { startDate: start, endDate: end };
  }
}