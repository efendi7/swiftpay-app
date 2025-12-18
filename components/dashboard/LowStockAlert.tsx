import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface LowStockAlertProps {
  count: number;
  onPress: () => void;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ count, onPress }) => {
  if (count === 0) return null;

  return (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={onPress}
      accessibilityLabel={`${count} produk stok rendah, tekan untuk melihat`}
      accessibilityRole="button"
    >
      <AlertTriangle color={COLORS.danger} size={24} />
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>Peringatan Stok</Text>
        <Text style={styles.alertText}>
          {count} produk hampir habis.
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFE5E5',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFDADA',
  },
  alertContent: {
    flex: 1,
    marginLeft: 10,
  },
  alertTitle: {
    color: COLORS.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertText: {
    fontSize: 12,
    color: COLORS.textDark,
    marginTop: 2,
  },
});