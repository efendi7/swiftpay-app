// ====================================
// 4. components/DateRangeSelector.tsx
// ====================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface DateRangeSelectorProps {
  selectedPreset: string;
  onSelectPreset: (preset: 'today' | 'week' | 'month' | 'year') => void;
  onCustomPress?: () => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  onCustomPress,
}) => {
  const presets = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'week', label: 'Minggu Ini' },
    { key: 'month', label: 'Bulan Ini' },
    { key: 'year', label: 'Tahun Ini' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {presets.map(preset => (
          <TouchableOpacity
            key={preset.key}
            style={[
              styles.presetButton,
              selectedPreset === preset.key && styles.presetButtonActive,
            ]}
            onPress={() => onSelectPreset(preset.key as any)}
          >
            <Text
              style={[
                styles.presetText,
                selectedPreset === preset.key && styles.presetTextActive,
              ]}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {onCustomPress && (
        <TouchableOpacity style={styles.customButton} onPress={onCustomPress}>
          <Calendar size={16} color={COLORS.secondary} />
          <Text style={styles.customText}>Custom</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16, 
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  presetText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
  },
  presetTextActive: {
    color: '#fff',
    fontFamily: 'PoppinsSemiBold',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    gap: 6,
  },
  customText: {
    fontSize: 13,
    fontFamily: 'PoppinsMedium',
    color: COLORS.secondary,
  },
});
