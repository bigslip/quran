import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  useThemeColors,
  type ColorTheme,
} from '../../theme';
import type { WordLinguisticInfo } from '../../types/quran';
import {
  INSIGHTS_COMPONENT_CONTRACTS,
  formatArabicRoot,
  formatPartOfSpeechFa,
} from './insightsContracts';
import { toPersianDigits } from '../catalog/catalogFormatters';

export interface WordLinguisticBreakdownCardProps {
  word: WordLinguisticInfo;
  isActive: boolean;
  onPress?: () => void;
  quranFont?: 'hafs' | 'indopak';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * WordLinguisticBreakdownCard displays morphological and semantic metadata for an individual word.
 *
 * Features:
 * - Persian position badge (e.g. "۱", "۲").
 * - Sacred Arabic calligraphy in Hafs or IndoPak font.
 * - Arabic root chip and Persian part-of-speech badge.
 * - Persian translation gloss text.
 * - Active highlight state with emerald border and floating surface.
 * - Complies with touch target contracts (minHeight: 64px, >= 44x44px target).
 */
export const WordLinguisticBreakdownCard: React.FC<WordLinguisticBreakdownCardProps> = React.memo(
  ({
    word,
    isActive,
    onPress,
    quranFont = 'hafs',
    style,
    testID = 'word-linguistic-breakdown-card',
  }) => {
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const fontName = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;
    const wordArabic =
      quranFont === 'indopak' && word.text_indopak ? word.text_indopak : word.text_uthmani;

    const a11yLabel = `واژه ${toPersianDigits(word.position)}: ${word.text_uthmani}، معنی: ${
      word.translation_fa || 'بدون ترجمه'
    }`;

    return (
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={a11yLabel}
        style={[styles.card, isActive ? styles.cardActive : styles.cardInactive, style]}
      >
        <View style={styles.contentRow}>
          {/* Right Section: Position Badge + Sacred Arabic Word */}
          <View style={styles.rightSection}>
            <View
              style={[
                styles.positionBadge,
                isActive ? styles.positionBadgeActive : styles.positionBadgeInactive,
              ]}
              testID={`${testID}-position-badge`}
            >
              <Text
                style={[
                  styles.positionBadgeText,
                  isActive ? styles.positionBadgeTextActive : styles.positionBadgeTextInactive,
                ]}
              >
                {toPersianDigits(word.position)}
              </Text>
            </View>

            <Text
              style={[
                styles.arabicWordText,
                { fontFamily: fontName },
                isActive ? styles.arabicWordTextActive : styles.arabicWordTextInactive,
              ]}
              testID={`${testID}-arabic-word`}
              allowFontScaling={false}
            >
              {wordArabic}
            </Text>
          </View>

          {/* Middle Section: Linguistic Chips (Root & POS) */}
          <View style={styles.middleSection} testID={`${testID}-chips-section`}>
            <View style={styles.rootChip} testID={`${testID}-root-chip`}>
              <Text style={styles.rootChipText}>
                {`ریشه: ${formatArabicRoot(word.root_arabic)}`}
              </Text>
            </View>

            <View
              style={[styles.posBadge, isActive ? styles.posBadgeActive : styles.posBadgeInactive]}
              testID={`${testID}-pos-badge`}
            >
              <Text style={styles.posBadgeText}>{formatPartOfSpeechFa(word.part_of_speech)}</Text>
            </View>
          </View>

          {/* Left Section: Persian Gloss Meaning */}
          <View style={styles.leftSection}>
            <Text
              style={[
                styles.glossText,
                isActive ? styles.glossTextActive : styles.glossTextInactive,
              ]}
              testID={`${testID}-gloss`}
              numberOfLines={2}
            >
              {word.translation_fa || '—'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

WordLinguisticBreakdownCard.displayName = 'WordLinguisticBreakdownCard';

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    card: {
    minHeight: INSIGHTS_COMPONENT_CONTRACTS.wordCardMinHeight,
    minWidth: INSIGHTS_COMPONENT_CONTRACTS.minTouchTarget,
    borderRadius: borderRadius.lg,
    borderWidth: INSIGHTS_COMPONENT_CONTRACTS.activeCardBorderWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceFloating,
  },
  cardInactive: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
  },
  contentRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rightSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 80,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  positionBadgeActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  positionBadgeInactive: {
    backgroundColor: colors.surfaceCardHover,
    borderColor: colors.borderSubtle,
  },
  positionBadgeText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
  },
  positionBadgeTextActive: {
    color: colors.primaryLight,
  },
  positionBadgeTextInactive: {
    color: colors.textMuted,
  },
  arabicWordText: {
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
  },
  arabicWordTextActive: {
    color: colors.goldAccent,
  },
  arabicWordTextInactive: {
    color: colors.textPrimary,
  },
  middleSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  rootChip: {
    backgroundColor: colors.surfaceCardHover,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rootChipText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  posBadge: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  posBadgeActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  posBadgeInactive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: colors.borderSubtle,
  },
  posBadgeText: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.xs,
    color: colors.primaryLight,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: spacing.xs,
  },
  glossText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    textAlign: 'left',
  },
  glossTextActive: {
    fontFamily: fonts.uiMedium,
    color: colors.textPrimary,
  },
  glossTextInactive: {
    fontFamily: fonts.uiRegular,
    color: colors.textSecondary,
  },
});
