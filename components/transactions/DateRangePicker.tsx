import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors'; // Sesuaikan path

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  showStartPicker: boolean;
  showEndPicker: boolean;
  onShowStartPicker: (show: boolean) => void;
  onShowEndPicker: (show: boolean) => void;
  // Ubah menjadi Date | null agar sinkron dengan types/transaction.type.ts
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

const formatDateDisplay = (date: Date | null) => 
  date ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pilih tanggal';

export const DateRangePicker: React.FC<Props> = ({
  startDate,
  endDate,
  showStartPicker,
  showEndPicker,
  onShowStartPicker,
  onShowEndPicker,
  onStartDateChange,
  onEndDateChange,
}) => {
  
  // Handler khusus Android untuk menutup picker setelah memilih
  const handleStartChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      onShowStartPicker(false);
    }
    if (event.type === 'set' && date) {
      onStartDateChange(date);
    }
  };

  const handleEndChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      onShowEndPicker(false);
    }
    if (event.type === 'set' && date) {
      onEndDateChange(date);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.dateButton, startDate && styles.activeBorder]} 
          onPress={() => onShowStartPicker(true)}
        >
          <Text style={styles.dateLabel}>Dari:</Text>
          <Text style={styles.dateValue}>{formatDateDisplay(startDate)}</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity 
          style={[styles.dateButton, endDate && styles.activeBorder]} 
          onPress={() => onShowEndPicker(true)}
        >
          <Text style={styles.dateLabel}>Sampai:</Text>
          <Text style={styles.dateValue}>{formatDateDisplay(endDate)}</Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          value={startDate || new Date()}
          onChange={handleStartChange}
          maximumDate={endDate || undefined} // User tidak bisa pilih start > end
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          value={endDate || new Date()}
          onChange={handleEndChange}
          minimumDate={startDate || undefined} // User tidak bisa pilih end < start
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeBorder: {
    borderColor: COLORS.primary,
  },
  dateLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'PoppinsMedium',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    color: '#1E293B',
    fontFamily: 'PoppinsSemiBold',
  },
  separator: {
    width: 10,
    height: 1,
    backgroundColor: '#CBD5E1',
  }
});