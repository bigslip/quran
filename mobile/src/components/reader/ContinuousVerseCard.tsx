import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Play, Pause, Bookmark, Share2, Sparkles } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  rtlRow,
  rtlTextAlign,
  rtlFlexStart,
  rtlWritingDirection,
} from '@/theme';
import { Verse, Word } from '@/types/quran';
import {
  READER_COMPONENT_CONTRACTS,
  formatVerseBadgeNumber,
  formatContinuousVerseAccessibilityLabel,
  formatAyahEndMarker,
} from './readerContracts';

export interface ContinuousVerseCardProps {
  verse: Verse;
  isActivePlaying?: boolean;
  quranFont?: 'hafs' | 'indopak';
  fontScale?: number;
  showWordByWord?: boolean;
  showTranslation?: boolean;
  activeTranslation?: 'makarem' | 'ansarian' | 'both';
  onPlayVerse?: (verse: Verse) => void;
  onBookmarkVerse?: (verse: Verse) => void;
  onShareVerse?: (verse: Verse) => void;
  onVerseInsights?: (verse: Verse) => void;
  isBookmarked?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * ContinuousVerseCard renders a single Ayah card in continuous scroll mode.
 *
 * Features:
 * - Concentric geometric verse number badge in Persian digits
 * - Sacred Arabic text in selected font (Uthmanic Hafs or IndoPak Nastaleeq) with proportional font scaling
 * - Optional Word-by-Word inline view with Persian glosses
 * - Configurable Persian translation view (Makarem, Ansarian, or both) with translator chips
 * - Action toolbar with 4 buttons (Play, Bookmark, Share, Insights) all >= 44x44px touch targets
 * - Active audio playback highlight with emerald glow border and surface floating background
 */
export const ContinuousVerseCard: React.FC<ContinuousVerseCardProps> = React.memo(({
  verse,
  isActivePlaying = false,
  quranFont = 'hafs',
  fontScale = 1.0,
  showWordByWord = false,
  showTranslation = true,
  activeTranslation = 'makarem',
  onPlayVerse,
  onBookmarkVerse,
  onShareVerse,
  onVerseInsights,
  isBookmarked = false,
  style,
  testID = 'continuous-verse-card',
}) => {
  const scaledQuranFontSize = Math.round(READER_COMPONENT_CONTRACTS.verseCard.quranFontSize * fontScale);
  const scaledQuranLineHeight = Math.round(READER_COMPONENT_CONTRACTS.verseCard.quranLineHeightDefault * fontScale);
  const arabicFontFamily = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;
  const arabicText = (quranFont === 'indopak' && verse.text_indopak) ? verse.text_indopak : verse.text_uthmani;
  const verseBadgeText = formatVerseBadgeNumber(verse.verse_number);
  const accessibilityLabel = formatContinuousVerseAccessibilityLabel(verse, activeTranslation);

  const shouldRenderMakarem = showTranslation && (activeTranslation === 'makarem' || activeTranslation === 'both') && Boolean(verse.translation_fa_makarem);
  const shouldRenderAnsarian = showTranslation && (activeTranslation === 'ansarian' || activeTranslation === 'both') && Boolean(verse.translation_fa_ansarian);

  return (
    <View
      testID={testID}
      style={[
        styles.cardContainer,
        isActivePlaying ? styles.cardActive : styles.cardInactive,
        style,
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      {/* Header Bar: Concentric Verse Number Emblem & 4 Action Buttons */}
      <View style={styles.headerBar} testID={`${testID}-header`}>
        {/* Concentric Geometric Verse Number Badge */}
        <View
          style={styles.badgeOuter}
          testID={`${testID}-verse-badge`}
          accessible={false}
        >
          <View style={styles.badgeInner}>
            <Text style={styles.badgeText}>
              {verseBadgeText}
            </Text>
          </View>
        </View>

        {/* Action Toolbar (Play, Bookmark, Share, Insights) */}
        <View style={styles.actionBar} testID={`${testID}-actions`}>
          {/* 1. Play Button */}
          <TouchableOpacity
            testID={`${testID}-action-play`}
            activeOpacity={0.7}
            onPress={() => onPlayVerse?.(verse)}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isActivePlaying ? 'توقف پخش صوتی آیه' : 'پخش صوتی آیه'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isActivePlaying ? (
              <Pause
                size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
                color={colors.primary}
                strokeWidth={2}
              />
            ) : (
              <Play
                size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
                color={colors.primary}
                strokeWidth={2}
              />
            )}
          </TouchableOpacity>

          {/* 2. Bookmark Button */}
          <TouchableOpacity
            testID={`${testID}-action-bookmark`}
            activeOpacity={0.7}
            onPress={() => onBookmarkVerse?.(verse)}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? 'حذف نشان آیه' : 'نشان‌گذاری آیه'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bookmark
              size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
              color={isBookmarked ? colors.goldAccent : colors.textSecondary}
              fill={isBookmarked ? colors.goldAccent : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* 3. Share Button */}
          <TouchableOpacity
            testID={`${testID}-action-share`}
            activeOpacity={0.7}
            onPress={() => onShareVerse?.(verse)}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="اشتراک‌گذاری آیه"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Share2
              size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* 4. Insights Button */}
          <TouchableOpacity
            testID={`${testID}-action-insights`}
            activeOpacity={0.7}
            onPress={() => onVerseInsights?.(verse)}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="تدبر و بینش آیه"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Sparkles
              size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sacred Arabic Quranic Text */}
      <View style={styles.arabicTextContainer} testID={`${testID}-arabic-container`}>
        <Text
          style={[
            styles.arabicText,
            {
              fontFamily: arabicFontFamily,
              fontSize: scaledQuranFontSize,
              lineHeight: scaledQuranLineHeight,
            },
          ]}
          testID={`${testID}-arabic-text`}
          allowFontScaling={false}
        >
          {arabicText}
          <Text
            style={[
              styles.ayahEndMarker,
              {
                fontSize: scaledQuranFontSize,
              },
            ]}
          >
            {formatAyahEndMarker(verse.verse_number)}
          </Text>
        </Text>
      </View>

      {/* Word-by-Word Inline View (When Enabled) */}
      {showWordByWord && verse.words && verse.words.length > 0 && (
        <View style={styles.wbwFlowContainer} testID={`${testID}-wbw-container`}>
          {verse.words.map((word: Word) => (
            <View key={`word-${word.id || word.position}`} style={styles.wbwItemCard}>
              <Text
                style={[
                  styles.wbwArabicText,
                  {
                    fontFamily: arabicFontFamily,
                    fontSize: Math.round(18 * fontScale),
                  },
                ]}
                allowFontScaling={false}
              >
                {quranFont === 'indopak' && word.text_indopak ? word.text_indopak : word.text_uthmani}
              </Text>
              <Text style={styles.wbwGlossText}>
                {word.translation_fa || '—'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Persian Translations Section */}
      {showTranslation && (shouldRenderMakarem || shouldRenderAnsarian) && (
        <View style={styles.translationsContainer} testID={`${testID}-translations-container`}>
          {/* Makarem Translation */}
          {shouldRenderMakarem && (
            <View style={styles.translationBlock} testID={`${testID}-translation-makarem`}>
              <View style={styles.translationHeaderRow}>
                <View style={styles.translatorChip} testID={`${testID}-chip-makarem`}>
                  <Text style={styles.translatorChipText}>مکارم شیرازی</Text>
                </View>
              </View>
              <Text style={styles.translationText}>
                {verse.translation_fa_makarem}
              </Text>
            </View>
          )}

          {/* Ansarian Translation */}
          {shouldRenderAnsarian && (
            <View style={styles.translationBlock} testID={`${testID}-translation-ansarian`}>
              <View style={styles.translationHeaderRow}>
                <View style={styles.translatorChip} testID={`${testID}-chip-ansarian`}>
                  <Text style={styles.translatorChipText}>حسین انصاریان</Text>
                </View>
              </View>
              <Text style={styles.translationText}>
                {verse.translation_fa_ansarian}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  cardInactive: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderSubtle,
  },
  cardActive: {
    backgroundColor: colors.surfaceFloating,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  headerBar: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  badgeOuter: {
    width: READER_COMPONENT_CONTRACTS.verseCard.badgeOuterSize,
    height: READER_COMPONENT_CONTRACTS.verseCard.badgeOuterSize,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: READER_COMPONENT_CONTRACTS.verseCard.badgeInnerSize,
    height: READER_COMPONENT_CONTRACTS.verseCard.badgeInnerSize,
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
    color: colors.primary,
  },
  actionBar: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    minWidth: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
    width: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
    height: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicTextContainer: {
    width: '100%',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: rtlFlexStart,
  },
  arabicText: {
    color: colors.textPrimary,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
    width: '100%',
    flexShrink: 1,
  },
  ayahEndMarker: {
    fontFamily: fonts.quranHafs,
    color: colors.goldAccent,
  },
  wbwFlowContainer: {
    flexDirection: rtlRow,
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginVertical: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
  },
  wbwItemCard: {
    backgroundColor: colors.surfaceFloating,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  wbwArabicText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  wbwGlossText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  translationsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
    gap: spacing.md,
  },
  translationBlock: {
    gap: spacing.xs,
    width: '100%',
  },
  translationHeaderRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  translatorChip: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  translatorChipText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  translationText: {
    fontFamily: fonts.uiRegular,
    fontSize: READER_COMPONENT_CONTRACTS.verseCard.translationFontSize,
    lineHeight: READER_COMPONENT_CONTRACTS.verseCard.translationLineHeight,
    color: colors.textSecondary,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
    width: '100%',
    flexShrink: 1,
  },

});
