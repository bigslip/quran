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
import { Juz } from '@/types/quran';
import {
  formatJuzBadge,
  formatJuzStartInfo,
  formatJuzPageRange,
  formatAyahCount,
  getJuzNavigationRoute,
} from './catalogFormatters';

export interface JuzCardItemProps {
  juz: Juz;
  onPress?: (juz: Juz) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const JuzCardItem: React.FC<JuzCardItemProps> = ({
  juz,
  onPress,
  style,
  testID,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(juz);
    } else {
      router.push(getJuzNavigationRoute(juz.first_chapter_id) as any);
    }
  };

  const juzBadgeText = formatJuzBadge(juz.juz_number);
  const startInfoText = formatJuzStartInfo(
    juz.first_surah_name_fa,
    juz.first_verse_key
  );
  const pageRangeText = formatJuzPageRange(juz.page_start, juz.page_end);
  const ayahCountText = formatAyahCount(juz.verses_count);

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.75}
      onPress={handlePress}
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${juzBadgeText}، ${startInfoText}، ${pageRangeText}، ${ayahCountText}`}
      accessibilityHint="برای ورود به ابتدای این جزء ضربه بزنید"
    >
      {/* Top Header Row: Geometric Juz Badge + Verse Count Pill */}
      <View style={styles.headerRow}>
        <View style={styles.juzBadge}>
          <Text style={styles.juzBadgeText}>{juzBadgeText}</Text>
        </View>

        <View style={styles.ayahPill}>
          <Text style={styles.ayahPillText}>{ayahCountText}</Text>
        </View>
      </View>

      {/* Middle Row: Starting Surah / Ayah + Page Range */}
      <View style={styles.middleRow}>
        <Text style={styles.startInfoText}>{startInfoText}</Text>
        <Text style={styles.pageRangeText}>{pageRangeText}</Text>
      </View>

      {/* Bottom Snippet: Arabic Preview in Uthmanic Hafs */}
      {Boolean(juz.preview_text) && (
        <View style={styles.previewContainer}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.previewText}
          >
            {juz.preview_text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 110,
    minWidth: 44,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  juzBadge: {
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1.5,
    borderColor: colors.borderIridescent,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  juzBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.goldAccent,
  },
  ayahPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahPillText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  startInfoText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pageRangeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
  },
  previewContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  previewText: {
    fontFamily: fonts.quranHafs,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 28,
    textAlign: 'right',
  },
});
