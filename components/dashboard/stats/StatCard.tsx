import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { StatIcon } from './StatIcon';

interface StatCardProps {
  icon: ReactNode;
  iconBgColor: string;
  value: number | string;
  label: string;
  width?: number;
  height?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBgColor,
  value,
  label,
  width,
  height = 70,
}) => (
  <View
  style={[
    styles.card,
    width !== undefined ? { width } : undefined,
    { height },
  ]}
>

    <StatIcon icon={icon} backgroundColor={iconBgColor} size={36} />
    <View style={styles.textContainer}>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',

    // ✅ SHADOW KONSISTEN
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 3,

    // ❌ border dihilangkan
  },

  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },

  value: {
    fontSize: 15,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.textDark,
    lineHeight: 20,
  },

  label: {
    fontSize: 10,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
    marginTop: 2,
    lineHeight: 12,
  },
});
