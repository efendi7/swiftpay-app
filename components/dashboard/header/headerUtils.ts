import { DashboardService } from '../../../services/dashboardService';

/**
 * Helper untuk format mata uang khusus Header (mendukung format "jt")
 */
export const formatHeaderValue = (val: number) => {
  const absVal = Math.abs(val);
  let result = absVal >= 1000000 
    ? `Rp ${(absVal / 1000000).toFixed(1).replace(/\.0$/, '')} jt` 
    : DashboardService.formatCurrency(absVal);
  return val < 0 ? `-${result}` : result;
};

/**
 * Engine Mood AI untuk menentukan warna dan gambar berdasarkan performa
 */
export const getMoodConfig = (profit: number, totalRevenue: number = 0) => {
  if (profit === 0 && totalRevenue === 0) {
    return {
      color: '#FFFF00',
      msg: 'Belum ada transaksi.',
      img: require('../../../assets/images/dashboard/netral.png'),
      insight: 'Menunggu transaksi pertama...'
    };
  }
  if (profit > 1000000) {
    return {
      color: '#00FF47',
      msg: 'Gila! Cuan parah! 🔥',
      img: require('../../../assets/images/dashboard/rich.png'),
      insight: `Profit mantap hari ini!`
    };
  }
  if (profit >= 0) {
    return {
      color: '#A5FFB0',
      msg: 'Toko sedang untung!',
      img: require('../../../assets/images/dashboard/good.png'),
      insight: 'Kerja bagus, pertahankan!'
    };
  }
  return {
    color: '#FF4C4C',
    msg: 'Waspada! Laba minus.',
    img: require('../../../assets/images/dashboard/panic.png'),
    insight: 'Cek pengeluaran Anda.'
  };
};