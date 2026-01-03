import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseCard } from '../../ui/BaseCard'; // sesuaikan path

interface BaseStatsGridProps {
  dateLabel?: string;
  isLoading?: boolean;
  renderHeader: () => ReactNode;
  renderStats: () => ReactNode;
  containerStyle?: 'card' | 'flat';
}

export const BaseStatsGrid: React.FC<BaseStatsGridProps> = ({
  isLoading = false,
  renderHeader,
  renderStats,
  containerStyle = 'card',
}) => {
  const content = (
    <>
      {renderHeader()}
      {renderStats()}
    </>
  );

  // 👉 MODE FLAT (tanpa card)
  if (containerStyle === 'flat') {
    return (
      <View style={[styles.flat, { opacity: isLoading ? 0.7 : 1 }]}>
        {content}
      </View>
    );
  }

  return (
    <BaseCard
      variant="ultraSoft"
      style={[
        styles.cardSpacing,
        { opacity: isLoading ? 0.7 : 1 },
      ]}
    >
      {content}
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  cardSpacing: {
    padding: 16,
    marginVertical: 10,
  },

  flat: {
    width: '100%',
    marginVertical: 10,
  },
});
