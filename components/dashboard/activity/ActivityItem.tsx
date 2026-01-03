import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { Activity } from '../../../types/activity';
import { getActivityTitle, formatActivityMessage } from '../../../utils/activityHelpers';

interface ActivityItemProps {
  activity: Activity;
  isLast: boolean;
  currentUserName: string;
}

export const ActivityItem = memo(({ activity, isLast, currentUserName }: ActivityItemProps) => {
  const isMe = activity.userName === currentUserName;
  const displayName = isMe ? 'Anda' : activity.userName;
  const title = getActivityTitle(activity.type, activity.message);
  const messageParts = formatActivityMessage(activity.message);

  // Fungsi untuk mendapatkan warna background dan teks label
  const getLabelConfig = () => {
    switch (title) {
      case 'PRODUK BARU':
        return { bg: '#EBF5FF', text: '#3B82F6' }; // Biru
      case 'STOK MASUK':
        return { bg: '#ECFDF5', text: '#10B981' }; // Hijau
      case 'PENJUALAN':
      case 'STOK KELUAR':
        return { bg: '#FEF2F2', text: '#EF4444' }; // Merah
      case 'UPDATE DATA':
        return { bg: '#FFF7ED', text: '#F59E0B' }; // Oranye
      default:
        return { bg: '#F3F4F6', text: '#6B7280' }; // Abu-abu
    }
  };

  const labelConfig = getLabelConfig();

  return (
    <View style={[styles.activityItem, isLast && styles.lastItem]}>
      <View style={styles.activityContent}>
        {/* LABEL BERWARNA (BADGE) */}
        <View style={[styles.labelBadge, { backgroundColor: labelConfig.bg }]}>
          <Text style={[styles.activityTitle, { color: labelConfig.text }]}>
            {title}
          </Text>
        </View>
        
        <Text style={styles.activityMessage}>
          {messageParts.map((part, idx) => (
            <Text 
              key={idx} 
              style={[
                part.styleType === 'product' && styles.productText,
                part.styleType === 'price' && styles.priceText,
                part.styleType === 'qty' && styles.qtyText,
                part.styleType === 'normal' && styles.normalText,
              ]}
            >
              {part.text}
            </Text>
          ))}
        </Text>

        <Text style={styles.timestamp}>
          {activity.time || 'Baru saja'} • {displayName}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  activityItem: { 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  lastItem: { borderBottomWidth: 0 },
  activityContent: { flex: 1, alignItems: 'flex-start' }, // Align start agar badge tidak full width
  
  // Gaya untuk Label Badge
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  activityTitle: { 
    fontSize: 9, 
    fontFamily: 'PoppinsBold', 
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  
  activityMessage: { 
    fontSize: 13, 
    lineHeight: 20, 
    fontFamily: 'PoppinsRegular',
    color: '#444'
  },
  timestamp: { 
    fontSize: 10, 
    color: '#999', 
    marginTop: 6, 
    fontFamily: 'PoppinsRegular' 
  },
  productText: { 
    fontFamily: 'PoppinsBold', 
    color: '#000000', 
  },
  priceText: { 
    fontFamily: 'PoppinsBold', 
    color: '#16a34a', 
  },
  qtyText: { 
    fontFamily: 'PoppinsSemiBold', 
    color: '#333' 
  },
  normalText: {
    fontFamily: 'PoppinsRegular',
    color: '#444'
  }
});