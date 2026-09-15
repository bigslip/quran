import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { Chapter } from '@/types/quran';
import {
  formatSurahBadgeNumber,
  formatAyahCount,
  getRevelationPlaceLabel,
  getSurahNavigationRoute,
} from './catalogFormatters';

export interface SurahCardItemProps {
  surah: Chapter;
  isRevelationOrder?: boolean;
  onPress?: (surah: Chapter) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const SurahCardItem: React.FC<SurahCardItemProps> = ({
  surah,
  isRevelationOrder = false,
  onPress,
  style,
  testID,
}) => {
  const router = useRouter();

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

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`سوره ${surah.name_fa}، ${surah.name_arabic}، ${surah.verses_count} آیه`}
      accessibilityHint="برای مشاهده و قرائت سوره ضربه بزنید"
    >
      {/* Start Section: Geometric Number Badge + Persian Info */}
      <View style={styles.startSection}>
        {/* Geometric Surah Badge */}
        <View
          style={[
            styles.badgeOuter,
            isRevelationOrder && styles.badgeOuterRevelation,
          ]}
        >
          <View style={styles.badgeInner}>
            <Text
              style={[
                styles.badgeText,
                isRevelationOrder && styles.badgeTextRevelation,
              ]}
            >
              {badgeNumber}
            </Text>
          </View>
        </View>

        {/* Persian Title & Metadata */}
        <View style={styles.detailsCol}>
          <View style={styles.titleRow}>
            <Text style={styles.persianTitle}>{surah.name_fa}</Text>
            {/* Makki / Madani Chip Badge */}
            <View style={styles.chipBadge}>
              <Text style={styles.chipText}>{revelationLabel}</Text>
            </View>
          </View>

          <View style={styles.subtitleRow}>
            <Text style={styles.subtitleText}>{surah.name_simple}</Text>
            {isRevelationOrder && (
              <Text style={styles.revelationRankHint}>
                • نزول: {surah.revelation_order}
              </Text>
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
};

const styles = StyleSheet.create({
  container: {
    minHeight: 74,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
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
    width: 44,
    height: 44,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1.5,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.md,
  },
  badgeOuterRevelation: {
    borderColor: colors.goldAccent,
  },
  badgeInner: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.circle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
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
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    marginStart: spacing.xs,
  },
  chipText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
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
    fontSize: 21,
    color: colors.goldAccent,
    lineHeight: 32,
  },
  verseCount: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
