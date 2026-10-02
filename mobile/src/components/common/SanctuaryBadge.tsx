import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, borderRadius, spacing, fonts, fontSizes } from '@/theme';

interface SanctuaryBadgeProps {
  label: string;
}

export const SanctuaryBadge: React.FC<SanctuaryBadgeProps> = ({ label }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
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
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
});
