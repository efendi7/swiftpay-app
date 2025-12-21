import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface Activity {
  id: string;
  type: string;
  message: string;
  userName: string;
  time?: string;
  createdAt?: any;
}

interface RecentActivityCardProps {
  activities: Activity[];
  onSeeMore?: () => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ 
  activities, 
  onSeeMore 
}) => {
  const getActivityTitle = (type: string, message: string) => {
    const upperType = type?.toUpperCase();
    const lowerMsg = message?.toLowerCase() || '';
    
    if (upperType === 'INFO') {
      if (lowerMsg.includes('menambah produk')) return 'Penambahan Produk';
      if (lowerMsg.includes('mengubah nama') || lowerMsg.includes('edit')) return 'Produk Telah Diedit';
      return 'Informasi';
    }
    
    if (upperType === 'IN') return 'Stok Masuk';
    if (upperType === 'OUT') return 'Kasir Checkout';
    
    return 'Aktivitas';
  };

  const formatMessage = (message: string) => {
    const parts: Array<{ text: string; styleType?: 'product' | 'qty' | 'price' | 'normal' }> = [];
    
    // RegEx Patterns
    // 1. Nama Produk (dalam kutip)
    const productRegex = /"([^"]+)"/g;
    // 2. Total QTY (total X produk)
    const totalQtyRegex = /total\s+(\d+)\s+produk/gi;
    // 3. QTY per item (X unit)
    const itemQtyRegex = /(\d+)\s+unit/gi;
    // 4. Harga & Kembalian (Rp X.XXX)
    const priceRegex = /Rp\s?[\d.,]+/g;
    // 5. Payment Method (via CASH/QRIS) - Tidak Bold, warna normal
    const methodRegex = /via\s+(CASH|QRIS)/gi;

    const allMatches: any[] = [];

    // Cari Matches
    const findMatches = (regex: RegExp, type: any) => {
      let match;
      while ((match = regex.exec(message)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type: type,
          content: match[1] || match[0] // ambil isi dalam grup jika ada
        });
      }
    };

    findMatches(productRegex, 'product');
    findMatches(totalQtyRegex, 'qty');
    findMatches(itemQtyRegex, 'qty');
    findMatches(priceRegex, 'price');
    // via method sengaja tidak dimasukkan allMatches agar masuk ke text normal

    allMatches.sort((a, b) => a.start - b.start);

    let lastEnd = 0;
    allMatches.forEach((match) => {
      if (match.start < lastEnd) return;

      if (match.start > lastEnd) {
        parts.push({ text: message.substring(lastEnd, match.start), styleType: 'normal' });
      }

      // Bersihkan tanda kutip untuk nama produk
      let displayText = match.text;
      if (match.type === 'product') {
        displayText = match.text.replace(/"/g, '');
      }

      parts.push({ text: displayText, styleType: match.type });
      lastEnd = match.end;
    });

    if (lastEnd < message.length) {
      parts.push({ text: message.substring(lastEnd), styleType: 'normal' });
    }

    return parts.length > 0 ? parts : [{ text: message, styleType: 'normal' }];
  };

  const formatTimestamp = (activity: Activity) => {
    if (activity.time) return activity.time;
    return 'Baru saja';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Clock size={20} color={COLORS.secondary} />
          <Text style={styles.title}>Aktivitas Terbaru</Text>
        </View>
        {onSeeMore && activities.length > 5 && (
          <TouchableOpacity onPress={onSeeMore}>
            <Text style={styles.seeMoreText}>Lihat Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Belum ada aktivitas</Text>
        </View>
      ) : (
        <View style={styles.activitiesList}>
          {activities.map((activity, index) => (
            <View key={activity.id || index} style={[styles.activityItem, index === activities.length - 1 && styles.lastItem]}>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{getActivityTitle(activity.type, activity.message)}</Text>
                <Text style={styles.activityMessage}>
                  {formatMessage(activity.message).map((part, idx) => {
                    let textStyle = {};
                    if (part.styleType === 'product') textStyle = styles.productText;
                    if (part.styleType === 'qty') textStyle = styles.secondaryBold;
                    if (part.styleType === 'price') textStyle = styles.secondaryBold;

                    return (
                      <Text key={idx} style={textStyle}>
                        {part.text}
                      </Text>
                    );
                  })}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(activity)} {activity.userName && ` • ${activity.userName}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 20, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontFamily: 'PoppinsSemiBold', color: COLORS.textDark },
  seeMoreText: { fontSize: 13, fontFamily: 'PoppinsMedium', color: COLORS.secondary },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: COLORS.textLight, fontFamily: 'PoppinsRegular' },
  activitiesList: { gap: 0 },
  activityItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  lastItem: { borderBottomWidth: 0 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontFamily: 'PoppinsSemiBold', color: COLORS.textDark, marginBottom: 4 },
  activityMessage: { fontSize: 13, fontFamily: 'PoppinsRegular', color: COLORS.textDark, lineHeight: 18 },
  timestamp: { fontSize: 11, fontFamily: 'PoppinsRegular', color: COLORS.textLight, marginTop: 4 },
  
  // Custom Formatting Styles
  productText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.primary,
  },
  secondaryBold: {
    fontFamily: 'PoppinsBold',
    color: COLORS.secondary,
  }
});