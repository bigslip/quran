import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fonts, fontSizes } from '@/theme';

interface SanctuaryBadgeProps {
  label: string;
}

export const SanctuaryBadge: React.FC<SanctuaryBadgeProps> = ({ label }) => {
  return (
    <View style={styles.container}>
      <View style={styles.pulseDot} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceFloating,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignSelf: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  text: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
