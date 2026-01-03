import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { BaseRecentActivity } from '../../../../../components/dashboard/activity/BaseRecentActivity';
import { Activity } from '../../../../../types/activity';
import { useNavigation } from '@react-navigation/native';

interface CashierActivityProps {
  activities?: Activity[]; 
  currentUserName?: string;
  onSeeMore?: () => void;
}

export const CashierActivity: React.FC<CashierActivityProps> = ({ 
  activities: propsActivities = [], 
  currentUserName = "Kasir",
  onSeeMore 
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // 1. Pastikan kita punya data untuk difilter
    if (!propsActivities || propsActivities.length === 0) {
        setActivities([]);
        return;
    }

    const filtered = propsActivities.filter(item => {
      // Normalisasi teks agar tidak sensitif huruf besar/kecil
      const type = item.type?.toUpperCase() || '';
      const userName = item.userName?.toLowerCase() || '';
      const me = currentUserName.toLowerCase();

      // LOGIKA FILTER:
      // - Munculkan jika itu aktivitas SAYA
      const isMine = userName === me;
      // - Munculkan jika dilakukan ADMIN (Logika: mengandung kata 'admin')
      const isAdmin = userName.includes('admin');
      // - Munculkan jika tipenya adalah stok masuk (IN atau MASUK)
      const isStockIn = type === 'IN' || type === 'MASUK' || type === 'TAMBAH';

      return isMine || isAdmin || isStockIn;
    });

    setActivities(filtered);
  }, [propsActivities, currentUserName]);

  return (
    <View style={{ width: '100%' }}>
      <BaseRecentActivity
        activities={activities} 
        currentUserName={currentUserName} 
        title="Aktivitas Saya & Toko"
        onSeeMore={onSeeMore}
        userRole="kasir"
      />
    </View>
  );
};