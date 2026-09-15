import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, borderRadius, spacing } from '@/theme';

interface SanctuaryCardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export const SanctuaryCard: React.FC<SanctuaryCardProps> = ({
  children,
  elevated = false,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: colors.surfaceFloating,
    borderColor: colors.borderIridescent,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
});
