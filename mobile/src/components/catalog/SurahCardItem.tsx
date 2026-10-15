import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  useThemeColors,
  type ColorTheme,
} from '@/theme';
import { Chapter } from '@/types/quran';
import {
  formatSurahBadgeNumber,
  formatAyahCount,
  formatCanonicalSurahHint,
  formatSurahAccessibilityLabel,
  getRevelationPlaceLabel,
  getSurahNavigationRoute,
  CATALOG_COMPONENT_CONTRACTS,
} from './catalogFormatters';

export interface SurahCardItemProps {
  surah: Chapter;
  isRevelationOrder?: boolean;
  onPress?: (surah: Chapter) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const stylesCache = new WeakMap<ColorTheme, ReturnType<typeof createStyles>>();
function getSurahCardStyles(themeColors: ColorTheme) {
  let cached = stylesCache.get(themeColors);
  if (!cached) {
    cached = createStyles(themeColors);
    stylesCache.set(themeColors, cached);
  }
  return cached;
}

export const SurahCardItem: React.FC<SurahCardItemProps> = React.memo(
  ({ surah, isRevelationOrder = false, onPress, style, testID }) => {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = getSurahCardStyles(colors);

    const handlePress = () => {
      if (onPress) {
        onPress(surah);
      } else {
        router.push(getSurahNavigationRoute(surah.id) as any);
      }
    };

    const badgeNumber = formatSurahBadgeNumber(surah, isRevelationOrder);
    const revelationLabel = getRevelationPlaceLabel(surah.revelation_place);
    const verseCountText = formatAyahCount(surah.verses_count);
    const isMakki = surah.revelation_place === 'makkah';
    const accessibilityLabelText = formatSurahAccessibilityLabel(surah, isRevelationOrder);
    const canonicalSurahHint = formatCanonicalSurahHint(surah.id);

    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.7}
        onPress={handlePress}
        style={[styles.container, style]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabelText}
        accessibilityHint="برای مشاهده و قرائت سوره ضربه بزنید"
      >
        {/* Start Section: Geometric Number Badge + Persian Info */}
        <View style={styles.startSection}>
          {/* Geometric Surah Badge */}
          <View style={[styles.badgeOuter, isRevelationOrder && styles.badgeOuterRevelation]}>
            <View style={styles.badgeInner}>
              <Text style={[styles.badgeText, isRevelationOrder && styles.badgeTextRevelation]}>
                {badgeNumber}
              </Text>
            </View>
          </View>

          {/* Persian Title & Metadata */}
          <View style={styles.detailsCol}>
            <View style={styles.titleRow}>
              <Text style={styles.persianTitle}>{surah.name_fa}</Text>
              {/* Makki / Madani Chip Badge */}
              <View
                style={[styles.chipBadge, isMakki ? styles.chipBadgeMakki : styles.chipBadgeMadani]}
              >
                <Text
                  style={[styles.chipText, isMakki ? styles.chipTextMakki : styles.chipTextMadani]}
                >
                  {revelationLabel}
                </Text>
              </View>
            </View>

            <View style={styles.subtitleRow}>
              <Text style={styles.subtitleText}>{surah.name_simple}</Text>
              {isRevelationOrder && (
                <Text style={styles.revelationRankHint}>{canonicalSurahHint}</Text>
              )}
            </View>
          </View>
        </View>

        {/* End Section: Arabic Calligraphy & Verse Count */}
        <View style={styles.endSection}>
          <Text style={styles.arabicCalligraphy}>{surah.name_arabic}</Text>
          <Text style={styles.verseCount}>{verseCountText}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      minHeight: CATALOG_COMPONENT_CONTRACTS.surahCard.minHeight,
      minWidth: CATALOG_COMPONENT_CONTRACTS.surahCard.minWidth,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceCard,
      borderWidth: CATALOG_COMPONENT_CONTRACTS.surahCard.containerBorderWidth,
      borderColor: colors.borderSubtle,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginVertical: spacing.xs,
    },
    startSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginEnd: spacing.md,
    },
    badgeOuter: {
      width: CATALOG_COMPONENT_CONTRACTS.surahCard.badgeOuterSize,
      height: CATALOG_COMPONENT_CONTRACTS.surahCard.badgeOuterSize,
      borderRadius: borderRadius.circle,
      backgroundColor: colors.surfaceFloating,
      borderWidth: CATALOG_COMPONENT_CONTRACTS.surahCard.badgeOuterBorderWidth,
      borderColor: colors.borderIridescent,
      alignItems: 'center',
      justifyContent: 'center',
      marginEnd: spacing.md,
    },
    badgeOuterRevelation: {
      borderColor: colors.goldAccent,
    },
    badgeInner: {
      width: CATALOG_COMPONENT_CONTRACTS.surahCard.badgeInnerSize,
      height: CATALOG_COMPONENT_CONTRACTS.surahCard.badgeInnerSize,
      borderRadius: borderRadius.circle,
      borderWidth: CATALOG_COMPONENT_CONTRACTS.surahCard.badgeInnerBorderWidth,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.primaryLight,
    },
    badgeTextRevelation: {
      color: colors.goldAccent,
    },
    detailsCol: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    persianTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
    },
    chipBadge: {
      backgroundColor: colors.primarySubtle,
      borderWidth: CATALOG_COMPONENT_CONTRACTS.surahCard.chipBorderWidth,
      borderColor: colors.primaryGlow,
      borderRadius: borderRadius.sm,
      paddingHorizontal: CATALOG_COMPONENT_CONTRACTS.surahCard.chipPaddingHorizontal,
      paddingVertical: CATALOG_COMPONENT_CONTRACTS.surahCard.chipPaddingVertical,
    },
    chipBadgeMakki: {
      backgroundColor: colors.badgeMakki,
      borderColor: colors.goldGlow,
    },
    chipBadgeMadani: {
      backgroundColor: colors.badgeMadani,
      borderColor: colors.primaryGlow,
    },
    chipText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    chipTextMakki: {
      color: colors.badgeMakkiText,
    },
    chipTextMadani: {
      color: colors.badgeMadaniText,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    subtitleText: {
      fontFamily: fonts.uiRegular,
      fontSize: 12,
      color: colors.textFaded,
    },
    revelationRankHint: {
      fontFamily: fonts.uiRegular,
      fontSize: 11,
      color: colors.textMuted,
      marginStart: spacing.xs,
    },
    endSection: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    arabicCalligraphy: {
      fontFamily: fonts.quranHafs,
      fontSize: CATALOG_COMPONENT_CONTRACTS.surahCard.arabicFontSize,
      color: colors.goldAccent,
      lineHeight: CATALOG_COMPONENT_CONTRACTS.surahCard.arabicLineHeight,
    },
    verseCount: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
