import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface Props {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const MonthPicker: React.FC<Props> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const handlePrev = () => {
    if (selectedMonth === 0) {
      onMonthChange(11);
      onYearChange(selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 11) {
      onMonthChange(0);
      onYearChange(selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrev} style={styles.arrowBtn} activeOpacity={0.7}>
        <ChevronLeft size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.displayBox}>
        <Calendar size={16} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.monthText}>
          {MONTH_NAMES[selectedMonth]} {selectedYear}
        </Text>
      </View>

      <TouchableOpacity onPress={handleNext} style={styles.arrowBtn} activeOpacity={0.7}>
        <ChevronRight size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  arrowBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  displayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 12,
    minWidth: 200,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  icon: {
    marginRight: 8,
  },
  monthText: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: '#1E293B',
  },
});

// Default export untuk backward compatibility
export default MonthPicker;