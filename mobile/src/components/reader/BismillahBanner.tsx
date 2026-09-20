import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppTheme, colors, fonts, spacing, themePalettes, useThemeColors } from '@/theme';
import {
  BISMILLAH_TEXT,
  READER_COMPONENT_CONTRACTS,
  shouldRenderBismillah,
} from './readerContracts';

export interface BismillahBannerProps {
  chapterId: number;
  bismillahPre?: boolean;
  theme?: AppTheme;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * BismillahBanner displays the sacred calligraphic Bismillah opening in Hafs script.
 *
 * Rules:
 * - Omitted automatically for Surah 9 (At-Tawbah) or when bismillahPre is false.
 * - Rendered in `fonts.quranHafs`, size 24, dynamic `colors.goldAccent`, centered.
 * - Dynamic goldAccent ensures WCAG contrast compliance in Light (#D97706) and Sepia (#B45309) modes.
 * - Flanked by ornate Sanctuary horizontal rules and geometric divider dots in `colors.goldGlow`.
 */
export const BismillahBanner: React.FC<BismillahBannerProps> = ({
  chapterId,
  bismillahPre,
  theme,
  style,
  testID = 'bismillah-banner',
}) => {
  const activeColors = useThemeColors();
  const colors = theme ? themePalettes[theme] ?? activeColors : activeColors;

  if (!shouldRenderBismillah(chapterId, bismillahPre)) {
    return null;
  }

  return (
    <View
      testID={testID}
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
    >
      {/* Ornate Sanctuary Top Divider Rule */}
      <View style={styles.dividerRow} testID={`${testID}-divider-top`}>
        <View style={[styles.dividerLine, { backgroundColor: colors.goldGlow }]} />
        <View style={[styles.ornamentDot, { backgroundColor: colors.goldAccent }]} />
        <View style={[styles.ornamentDiamond, { backgroundColor: colors.goldAccent }]} />
        <View style={[styles.ornamentDot, { backgroundColor: colors.goldAccent }]} />
        <View style={[styles.dividerLine, { backgroundColor: colors.goldGlow }]} />
      </View>

      {/* Sacred Calligraphic Text */}
      <Text
        style={[styles.bismillahText, { color: colors.goldAccent }]}
        testID={`${testID}-text`}
        allowFontScaling={false}
      >
        {BISMILLAH_TEXT}
      </Text>

      {/* Ornate Sanctuary Bottom Divider Rule */}
      <View style={styles.dividerRow} testID={`${testID}-divider-bottom`}>
        <View style={[styles.dividerLine, { backgroundColor: colors.goldGlow }]} />
        <View style={[styles.ornamentDot, { backgroundColor: colors.goldAccent }]} />
        <View style={[styles.ornamentDiamond, { backgroundColor: colors.goldAccent }]} />
        <View style={[styles.ornamentDot, { backgroundColor: colors.goldAccent }]} />
        <View style={[styles.dividerLine, { backgroundColor: colors.goldGlow }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: READER_COMPONENT_CONTRACTS.bismillah.minHeight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: READER_COMPONENT_CONTRACTS.bismillah.dividerWidthPercent as any,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: READER_COMPONENT_CONTRACTS.bismillah.dividerHeight,
    backgroundColor: colors.goldGlow,
  },
  ornamentDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.goldAccent,
    marginHorizontal: spacing.xs,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.goldAccent,
    marginHorizontal: spacing.xs,
  },
  bismillahText: {
    fontFamily: fonts.quranHafs,
    fontSize: READER_COMPONENT_CONTRACTS.bismillah.fontSize,
    lineHeight: READER_COMPONENT_CONTRACTS.bismillah.lineHeight,
    color: colors.goldAccent,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
});
