// components/dashboard/admin/AdminStats.tsx
import React from 'react';
import { Package, ArrowUpRight, ArrowDownLeft, TrendingUp, ClipboardList } from 'lucide-react-native';
import { Stats, StatItem } from '../Stats';

interface AdminStatsProps {
  totalProducts: number;
  totalIn: number;
  totalOut: number;
  dateLabel: string;
}

export const AdminStats: React.FC<AdminStatsProps> = React.memo(
  ({ totalProducts, totalIn, totalOut, dateLabel }) => {
    const stats: StatItem[] = [
      {
        value: totalProducts,
        label: 'Total Produk',
        icon: Package,
        iconColor: '#3b82f6',
        iconBgColor: '#eff6ff',
      },
      {
        value: totalIn,
        label: `Stok Masuk (${dateLabel})`,
        icon: ArrowDownLeft,
        iconColor: '#10b981',
        iconBgColor: '#f0fdf4',
      },
      {
        value: totalOut,
        label: `Stok Keluar (${dateLabel})`,
        icon: ArrowUpRight,
        iconColor: '#ef4444',
        iconBgColor: '#fef2f2',
      },
      {
        value: totalIn - totalOut,
        label: 'Net Stock Movement',
        icon: TrendingUp,
        iconColor: '#f59e0b',
        iconBgColor: '#fef3c7',
      },
    ];

    return (
      <Stats
        title="Ringkasan Inventori"
        titleIcon={ClipboardList}
        stats={stats}
        columns={2} // Bisa diubah ke 3 atau 4 sesuai kebutuhan
      />
    );
  }
);