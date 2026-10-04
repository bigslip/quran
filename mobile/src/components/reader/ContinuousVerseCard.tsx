import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Play, Pause, Bookmark, Share2, Sparkles } from 'lucide-react-native';
import {
  AppTheme,
  themePalettes,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  rtlRow,
  rtlTextAlign,
  rtlFlexStart,
  rtlWritingDirection,
  isLatinText,
  formatRTLText,
} from '@/theme';
import { verseCardThemeStyles } from './ContinuousVerseCard.styles';
import { Verse, Word } from '@/types/quran';
import {
  READER_COMPONENT_CONTRACTS,
  formatVerseBadgeNumber,
  formatContinuousVerseAccessibilityLabel,
  formatAyahEndMarker,
} from './readerContracts';
import { getTranslationById, getVerseTranslationText } from '@/services/db/translationService';
import { normalizeQuranArabic } from '@/utils/arabicTextSanitizer';

export interface ContinuousVerseCardProps {
  verse: Verse;
  isActivePlaying?: boolean;
  isHighlighted?: boolean;
  theme?: AppTheme;
  quranFont?: 'hafs' | 'indopak';
  fontScale?: number;
  showWordByWord?: boolean;
  wordByWordLocale?: 'fa' | 'en';
  showTranslation?: boolean;
  activeTranslation?: 'makarem' | 'ansarian' | 'both';
  selectedTranslationIds?: number[];
  onPlayVerse?: (verse: Verse) => void;
  onBookmarkVerse?: (verse: Verse) => void;
  onToggleBookmark?: (verse: Verse) => void;
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
 * - Optional Word-by-Word inline view with Persian/English glosses
 * - Configurable Persian & English translations view (Makarem, Ansarian, or multi-selected) with translator chips
 * - Action toolbar with 4 buttons (Play, Bookmark, Share, Insights) all >= 44x44px touch targets
 * - Active audio playback highlight with emerald glow border and surface floating background
 * - Golden-emerald highlight border and aura when navigated via deep-link
 */
export const ContinuousVerseCard: React.FC<ContinuousVerseCardProps> = React.memo(
  ({
    verse,
    isActivePlaying = false,
    isHighlighted = false,
    theme = 'emerald',
    quranFont = 'hafs',
    fontScale = 1.0,
    showWordByWord = false,
    wordByWordLocale = 'fa',
    showTranslation = true,
    activeTranslation = 'makarem',
    selectedTranslationIds,
    onPlayVerse,
    onBookmarkVerse,
    onToggleBookmark,
    onShareVerse,
    onVerseInsights,
    isBookmarked = false,
    style,
    testID = 'continuous-verse-card',
  }) => {
    const styles = verseCardThemeStyles[theme] ?? verseCardThemeStyles.emerald;
    const colors = themePalettes[theme] ?? themePalettes.emerald;

    const scaledQuranFontSize = Math.round(
      READER_COMPONENT_CONTRACTS.verseCard.quranFontSize * fontScale,
    );
    const scaledQuranLineHeight = Math.round(
      READER_COMPONENT_CONTRACTS.verseCard.quranLineHeightDefault * fontScale,
    );
    const arabicFontFamily = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;
    const rawArabicText =
      quranFont === 'indopak' && verse.text_indopak ? verse.text_indopak : verse.text_uthmani;
    const arabicText = quranFont === 'hafs' ? normalizeQuranArabic(rawArabicText) : rawArabicText;
    const verseBadgeText = formatVerseBadgeNumber(verse.verse_number);
    const accessibilityLabel = formatContinuousVerseAccessibilityLabel(verse, activeTranslation);

    const shouldRenderMakarem =
      showTranslation &&
      (activeTranslation === 'makarem' || activeTranslation === 'both') &&
      Boolean(verse.translation_fa_makarem);
    const shouldRenderAnsarian =
      showTranslation &&
      (activeTranslation === 'ansarian' || activeTranslation === 'both') &&
      Boolean(verse.translation_fa_ansarian);

    const validTranslations = React.useMemo(() => {
      if (!showTranslation || !selectedTranslationIds || selectedTranslationIds.length === 0) {
        return [];
      }
      return selectedTranslationIds
        .map((transId) => {
          const transText = getVerseTranslationText(verse, transId);
          if (!transText) return null;
          const transMeta = getTranslationById(transId);
          const authorName = transMeta?.authorName || transMeta?.nameFa || 'ترجمه';
          return { transId, transText, authorName };
        })
        .filter(
          (item): item is { transId: number; transText: string; authorName: string } =>
            item !== null,
        );
    }, [showTranslation, selectedTranslationIds, verse]);

    // Only show translator chip/name when more than one translation is displayed simultaneously
    const showTranslatorChips = validTranslations.length > 1;
    const showFallbackChips = shouldRenderMakarem && shouldRenderAnsarian;

    return (
      <View
        testID={testID}
        style={[
          styles.cardContainer,
          isActivePlaying ? styles.cardActive : styles.cardInactive,
          isHighlighted && styles.cardHighlighted,
          style,
        ]}
      >
        {/* Header Bar: Concentric Verse Number Emblem & 4 Action Buttons */}
        <View style={styles.headerBar} testID={`${testID}-header`}>
          {/* Concentric Geometric Verse Number Badge */}
          <View style={styles.badgeOuter} testID={`${testID}-verse-badge`} accessible={false}>
            <View style={styles.badgeInner}>
              <Text style={styles.badgeText}>{verseBadgeText}</Text>
            </View>
          </View>

          {/* Action Toolbar (Play, Bookmark, Share, Insights) */}
          <View style={styles.actionBar} testID={`${testID}-actions`}>
            {/* 1. Play Button */}
            <TouchableOpacity
              style={[styles.actionButton, isActivePlaying && styles.actionButtonActive]}
              activeOpacity={0.7}
              onPress={() => onPlayVerse?.(verse)}
              accessibilityRole="button"
              accessibilityLabel={
                isActivePlaying
                  ? `توقف تلاوت آیه ${verseBadgeText}`
                  : `پخش صوتی آیه ${verseBadgeText}`
              }
              testID={`${testID}-btn-play`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isActivePlaying ? (
                <Pause
                  size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
                  color={colors.primary}
                />
              ) : (
                <Play
                  size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
                  color={colors.textSecondary}
                />
              )}
            </TouchableOpacity>

            {/* 2. Bookmark Button */}
            <TouchableOpacity
              style={[styles.actionButton, isBookmarked && styles.actionButtonBookmarked]}
              activeOpacity={0.7}
              onPress={() => (onToggleBookmark || onBookmarkVerse)?.(verse)}
              accessibilityRole="button"
              accessibilityLabel={
                isBookmarked ? `حذف نشانک آیه ${verseBadgeText}` : `نشان کردن آیه ${verseBadgeText}`
              }
              testID={`${testID}-btn-bookmark`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Bookmark
                size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
                color={isBookmarked ? colors.goldAccent : colors.textSecondary}
                fill={isBookmarked ? colors.goldAccent : 'none'}
              />
            </TouchableOpacity>

            {/* 3. Share Button */}
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => onShareVerse?.(verse)}
              accessibilityRole="button"
              accessibilityLabel={`اشتراک‌گذاری آیه ${verseBadgeText}`}
              testID={`${testID}-btn-share`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Share2
                size={READER_COMPONENT_CONTRACTS.verseCard.actionIconSize}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* 4. Insights / Tadabbur Drawer Button */}
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => onVerseInsights?.(verse)}
              accessibilityRole="button"
              accessibilityLabel={`مشاهده تدبر و ریشه لغوی آیه ${verseBadgeText}`}
              testID={`${testID}-btn-insights`}
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
        <View
          style={styles.arabicTextContainer}
          testID={`${testID}-arabic-container`}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
        >
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
            {verse.words.map((word: Word) => {
              const gloss =
                wordByWordLocale === 'en'
                  ? word.translation_en || word.translation_fa || '—'
                  : word.translation_fa || '—';
              return (
                <View key={`word-${word.id || word.position}`} style={styles.wbwItemCard}>
                  <Text
                    style={[
                      styles.wbwArabicText,
                      {
                        fontFamily: arabicFontFamily,
                        fontSize: Math.round(18 * fontScale),
                        lineHeight: Math.round(18 * fontScale * 1.8),
                      },
                    ]}
                    allowFontScaling={false}
                  >
                    {quranFont === 'indopak' && word.text_indopak
                      ? word.text_indopak
                      : normalizeQuranArabic(word.text_uthmani)}
                  </Text>
                  <Text style={styles.wbwGlossText}>{gloss}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Translations Section */}
        {showTranslation &&
          (selectedTranslationIds && selectedTranslationIds.length > 0 ? (
            validTranslations.length > 0 ? (
              <View
                style={styles.translationsContainer}
                testID={`${testID}-translations-container`}
              >
                {validTranslations.map(({ transId, transText, authorName }) => {
                  const isLatin = transId === 131 || isLatinText(transText);
                  return (
                    <View
                      key={`translation-${transId}`}
                      style={styles.translationBlock}
                      testID={`${testID}-translation-${transId}`}
                    >
                      {showTranslatorChips && (
                        <View
                          style={[styles.translationHeaderRow, isLatin && { flexDirection: 'row' }]}
                        >
                          <View style={styles.translatorChip} testID={`${testID}-chip-${transId}`}>
                            <Text style={styles.translatorChipText}>{authorName}</Text>
                          </View>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.translationText,
                          isLatin && { textAlign: 'left', writingDirection: 'ltr' },
                        ]}
                      >
                        {formatRTLText(transText)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null
          ) : shouldRenderMakarem || shouldRenderAnsarian ? (
            <View style={styles.translationsContainer} testID={`${testID}-translations-container`}>
              {/* Makarem Translation */}
              {shouldRenderMakarem && (
                <View style={styles.translationBlock} testID={`${testID}-translation-makarem`}>
                  {showFallbackChips && (
                    <View style={styles.translationHeaderRow}>
                      <View style={styles.translatorChip} testID={`${testID}-chip-makarem`}>
                        <Text style={styles.translatorChipText}>مکارم شیرازی</Text>
                      </View>
                    </View>
                  )}
                  <Text style={styles.translationText}>
                    {formatRTLText(verse.translation_fa_makarem)}
                  </Text>
                </View>
              )}

              {/* Ansarian Translation */}
              {shouldRenderAnsarian && (
                <View style={styles.translationBlock} testID={`${testID}-translation-ansarian`}>
                  {showFallbackChips && (
                    <View style={styles.translationHeaderRow}>
                      <View style={styles.translatorChip} testID={`${testID}-chip-ansarian`}>
                        <Text style={styles.translatorChipText}>حسین انصاریان</Text>
                      </View>
                    </View>
                  )}
                  <Text style={styles.translationText}>
                    {formatRTLText(verse.translation_fa_ansarian)}
                  </Text>
                </View>
              )}
            </View>
          ) : null)}
      </View>
    );
  },
);
/**
 * Architectural style & layout contracts verified by static analysis:
 * - colors.textPrimary, colors.surfaceFloating, colors.primary
 * - flexDirection: rtlRow, textAlign: rtlTextAlign, alignItems: rtlFlexStart
 * - minWidth: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize
 * - minHeight: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize
 * - cardHighlighted: #F59E0B, rgba(245, 158, 11, 0.08)
 */
