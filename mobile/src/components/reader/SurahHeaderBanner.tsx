import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Info } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  useThemeColors,
  themePalettes,
  AppTheme,
} from '@/theme';
import { Chapter } from '@/types/quran';
import { toPersianDigits } from '@/components/catalog';
import {
  READER_COMPONENT_CONTRACTS,
  formatRevelationPlace,
  formatRevelationOrderBadge,
  formatVerseCountBadge,
  formatSurahNumberBadge,
  formatSurahHeaderAccessibilityLabel,
  formatInfoButtonAccessibilityLabel,
  formatSurahTitleFa,
} from './readerContracts';

export interface SurahHeaderBannerProps {
  chapter: Chapter;
  theme?: AppTheme;
  onPressInfo?: (chapter: Chapter) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * SurahHeaderBanner displays an ornate Sanctuary geometric frame for Quran chapter openings.
 *
 * Features:
 * - Sacred Arabic calligraphic title in `fonts.quranHafs` (size 32) in `colors.goldAccent`.
 * - Persian title (`name_fa`) in bold `fonts.uiRegular` (size 16) with high-contrast `colors.textPrimary`.
 * - Metadata badges row with Persian digits:
 *   1. Surah number badge
 *   2. Revelation place chip (`مکی` / `مدنی`) styled with theme tokens
 *   3. Revelation order chip (`ترتیب نزول: X`)
 *   4. Verse count badge (`Y آیه`)
 * - Accessible info button (`Info` icon) with guaranteed >= 44x44px touch target.
 * - RTL-first design with logical margins and borders.
 */
export const SurahHeaderBanner: React.FC<SurahHeaderBannerProps> = ({
  chapter,
  theme,
  onPressInfo,
  style,
  testID = 'surah-header-banner',
}) => {
  const activeColors = useThemeColors();
  const colors = theme ? themePalettes[theme] ?? activeColors : activeColors;
  const isMakki = chapter.revelation_place === 'makkah';
  const revelationPlaceText = formatRevelationPlace(chapter.revelation_place);
  const revelationOrderText = formatRevelationOrderBadge(chapter.revelation_order);
  const verseCountText = formatVerseCountBadge(chapter.verses_count);
  const surahNumberBadgeText = formatSurahNumberBadge(chapter.id);
  const accessibilityHeaderLabel = formatSurahHeaderAccessibilityLabel(chapter);
  const accessibilityInfoLabel = formatInfoButtonAccessibilityLabel(chapter.name_fa);

  const handleInfoPress = () => {
    onPressInfo?.(chapter);
  };

  return (
    <View
      testID={testID}
      style={[
        styles.outerCard,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.borderSubtle,
        },
        style,
      ]}
    >
      {/* Inner Sanctuary Geometric Frame */}
      <View
        style={[
          styles.innerFrame,
          {
            backgroundColor: colors.surfaceFloating,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {/* Top Control Bar: Geometric Surah Number Emblem (Right in RTL) & Info Action (Left in RTL) */}
        <View style={styles.topControlBar}>
          {/* Surah Number Emblem Medallion (Right in RTL) */}
          <View
            style={[
              styles.cornerNumberEmblem,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderIridescent,
              },
            ]}
            testID={`${testID}-number-emblem`}
            accessible={false}
          >
            <View style={[styles.cornerNumberEmblemInner, { borderColor: colors.borderSubtle }]}>
              <Text style={[styles.cornerNumberText, { color: colors.primaryLight }]}>
                {toPersianDigits(chapter.id)}
              </Text>
            </View>
          </View>

          {/* Info Button with guaranteed >= 44x44px touch target (Left in RTL) */}
          <TouchableOpacity
            testID={`${testID}-info-button`}
            activeOpacity={0.7}
            onPress={handleInfoPress}
            style={[
              styles.infoButton,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={accessibilityInfoLabel}
            accessibilityHint="برای مشاهده اطلاعات و مشخصات سوره ضربه بزنید"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Info
              size={READER_COMPONENT_CONTRACTS.surahHeader.infoIconSize}
              color={colors.primaryLight}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {/* Centerpiece: Sacred Calligraphy & Persian Title */}
        <View
          style={styles.calligraphySection}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel={accessibilityHeaderLabel}
        >
          {/* Sacred Arabic Calligraphic Title */}
          <Text
            style={[styles.arabicTitle, { color: colors.goldAccent }]}
            testID={`${testID}-arabic-title`}
            allowFontScaling={false}
          >
            {chapter.name_arabic}
          </Text>

          {/* Persian Surah Title */}
          <Text
            style={[styles.persianTitle, { color: colors.textPrimary }]}
            testID={`${testID}-persian-title`}
          >
            {formatSurahTitleFa(chapter.name_fa)}
          </Text>
        </View>

        {/* Badges Row: Surah Number, Revelation Place, Revelation Order, Verse Count */}
        <View style={styles.badgesRow} testID={`${testID}-badges-row`} accessible={false}>
          {/* 1. Surah Number Badge */}
          <View
            style={[
              styles.badgeChip,
              {
                backgroundColor: colors.primarySubtle,
                borderColor: colors.primaryGlow,
              },
            ]}
            testID={`${testID}-badge-number`}
          >
            <Text style={[styles.badgeChipText, { color: colors.textSecondary }]}>
              {surahNumberBadgeText}
            </Text>
          </View>

          {/* 2. Revelation Place Chip (Makki / Madani) */}
          <View
            style={[
              styles.badgeChip,
              isMakki
                ? [
                    styles.badgeMakkiChip,
                    { backgroundColor: colors.badgeMakki, borderColor: colors.goldGlow },
                  ]
                : [
                    styles.badgeMadaniChip,
                    { backgroundColor: colors.badgeMadani, borderColor: colors.primaryGlow },
                  ],
            ]}
            testID={`${testID}-badge-revelation-place`}
          >
            <Text
              style={[
                styles.badgeChipText,
                isMakki
                  ? [styles.badgeMakkiText, { color: colors.badgeMakkiText }]
                  : [styles.badgeMadaniText, { color: colors.badgeMadaniText }],
              ]}
            >
              {revelationPlaceText}
            </Text>
          </View>

          {/* 3. Revelation Order Chip */}
          <View
            style={[
              styles.badgeChip,
              {
                backgroundColor: colors.primarySubtle,
                borderColor: colors.primaryGlow,
              },
            ]}
            testID={`${testID}-badge-revelation-order`}
          >
            <Text style={[styles.badgeChipText, { color: colors.textSecondary }]}>
              {revelationOrderText}
            </Text>
          </View>

          {/* 4. Verse Count Badge */}
          <View
            style={[
              styles.badgeChip,
              {
                backgroundColor: colors.primarySubtle,
                borderColor: colors.primaryGlow,
              },
            ]}
            testID={`${testID}-badge-verses-count`}
          >
            <Text style={[styles.badgeChipText, { color: colors.textSecondary }]}>
              {verseCountText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    borderWidth: READER_COMPONENT_CONTRACTS.surahHeader.containerBorderWidth,
    borderColor: colors.borderIridescent,
    padding: spacing.lg,
    minHeight: READER_COMPONENT_CONTRACTS.surahHeader.minHeight,
    overflow: 'hidden',
  },
  innerFrame: {
    backgroundColor: colors.surfaceFloating,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  topControlBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  infoButton: {
    minWidth: READER_COMPONENT_CONTRACTS.surahHeader.infoButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.surahHeader.infoButtonSize,
    width: READER_COMPONENT_CONTRACTS.surahHeader.infoButtonSize,
    height: READER_COMPONENT_CONTRACTS.surahHeader.infoButtonSize,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerNumberEmblem: {
    width: READER_COMPONENT_CONTRACTS.surahHeader.emblemSize,
    height: READER_COMPONENT_CONTRACTS.surahHeader.emblemSize,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerNumberEmblemInner: {
    width: READER_COMPONENT_CONTRACTS.surahHeader.emblemInnerSize,
    height: READER_COMPONENT_CONTRACTS.surahHeader.emblemInnerSize,
    borderRadius: borderRadius.circle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerNumberText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    color: colors.primaryLight,
  },
  calligraphySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  arabicTitle: {
    fontFamily: fonts.quranHafs,
    fontSize: READER_COMPONENT_CONTRACTS.surahHeader.arabicFontSize,
    lineHeight: READER_COMPONENT_CONTRACTS.surahHeader.arabicLineHeight,
    color: colors.goldAccent,
    textAlign: 'center',
  },
  persianTitle: {
    fontFamily: fonts.uiBold,
    fontSize: READER_COMPONENT_CONTRACTS.surahHeader.persianFontSize,
    lineHeight: READER_COMPONENT_CONTRACTS.surahHeader.persianLineHeight,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  badgeChip: {
    backgroundColor: colors.primarySubtle,
    borderWidth: READER_COMPONENT_CONTRACTS.surahHeader.badgeBorderWidth,
    borderColor: colors.primaryGlow,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeChipText: {
    fontFamily: fonts.uiMedium || fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  badgeMakkiChip: {
    backgroundColor: colors.badgeMakki,
    borderColor: colors.goldGlow,
  },
  badgeMakkiText: {
    color: colors.badgeMakkiText,
  },
  badgeMadaniChip: {
    backgroundColor: colors.badgeMadani,
    borderColor: colors.primaryGlow,
  },
  badgeMadaniText: {
    color: colors.badgeMadaniText,
  },
});
