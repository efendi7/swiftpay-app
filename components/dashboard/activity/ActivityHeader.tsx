import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Trash2 } from 'lucide-react-native'; // Tambah Trash2
import { COLORS } from '../../../constants/colors';

interface ActivityHeaderProps {
  title: string;
  onClear?: () => void; // Prop baru: Fungsi untuk hapus
  showClear?: boolean;  // Prop baru: Penentu apakah tombol muncul
}

export const ActivityHeader = ({ title, onClear, showClear }: ActivityHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.titleRow}>
      <View style={styles.iconWrapper}>
        <Clock size={14} color={COLORS.secondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>

    {/* Tampilkan tombol hapus hanya jika showClear bernilai true */}
    {showClear && onClear && (
      <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
        <Trash2 size={14} color={COLORS.danger || '#ef4444'} />
        <Text style={styles.clearText}>Bersihkan</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrapper: {
    backgroundColor: `${COLORS.secondary}15`,
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textDark,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearText: {
    fontSize: 10,
    color: COLORS.danger || '#ef4444',
    fontFamily: 'PoppinsMedium',
  },
});