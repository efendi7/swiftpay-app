import React from 'react';
import { View } from 'react-native';
import { BaseRecentActivity } from '../../../../../components/dashboard/activity';
import { Activity } from '../../../../../types/activity';

interface AdminActivityProps {
  activities: Activity[];
  onSeeMore?: () => void;
  currentUserName?: string;
}

export const AdminActivity: React.FC<AdminActivityProps> = ({ 
  activities, 
  onSeeMore,
  currentUserName = "Admin" 
}) => {
  return (
    <View style={{ width: '100%' }}>
      <BaseRecentActivity
        activities={activities} // ✅ Hanya 5 aktivitas untuk preview
        currentUserName={currentUserName}
        title="Log Aktivitas Toko"
        onSeeMore={onSeeMore} 
        userRole="admin" // Kirimkan role sebagai "admin"
      />
    </View>
  );
};