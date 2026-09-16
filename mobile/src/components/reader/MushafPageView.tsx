import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { Verse, Word } from '@/types/quran';
import { toPersianDigits } from '@/components/catalog';
import {
  READER_COMPONENT_CONTRACTS,
  groupWordsByLine,
  formatMushafJuzTitle,
  formatMushafPageTitle,
  formatMushafSurahTitle,
  formatMushafHeaderAccessibilityLabel,
  getSurahNameFa,
} from './readerContracts';

export interface MushafPageViewProps {
  pageNumber: number;
  verses: Verse[];
  words?: Word[];
  quranFont?: 'hafs' | 'indopak';
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onVersePress?: (verseKey: string) => void;
  surahName?: string;
  juzNumber?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const LINES_LIST = Array.from(
  { length: READER_COMPONENT_CONTRACTS.mushafPage.totalLines },
  (_, idx) => idx + 1
);

/**
 * MushafPageView renders a high-fidelity 15-line physical Mushaf page layout.
 *
 * Features:
 * - Header bar: Juz name (جزء X), Surah name, and page number in Persian numerals
 * - 15-line physical Mushaf layout: groups words by physical line_number (1..15)
 * - Renders each line in RTL with Quranic font and clean line spacing
 * - Interactive word/verse selection triggering `onVersePress(verseKey)`
 * - Page navigation bottom controls (Next Page / Previous Page) with >= 44x44px touch targets
 */
export const MushafPageView: React.FC<MushafPageViewProps> = React.memo(({
  pageNumber,
  verses,
  words,
  quranFont = 'hafs',
  onPrevPage,
  onNextPage,
  onVersePress,
  surahName,
  juzNumber,
  style,
  testID = 'mushaf-page-view',
}) => {
  // Derive Juz number: prop > first verse juz_number > fallback 1
  const resolvedJuzNumber = juzNumber ?? verses[0]?.juz_number ?? 1;

  // Derive Surah name: prop > first verse chapter name lookup > fallback ''
  const resolvedSurahName = useMemo(() => {
    if (surahName) return surahName;
    const firstChapterId = verses[0]?.chapter_id;
    if (firstChapterId) {
      return getSurahNameFa(firstChapterId);
    }
    return '';
  }, [surahName, verses]);

  // Aggregate all words for this page
  const allWords = useMemo(() => {
    if (words && words.length > 0) {
      return words;
    }
    return verses.flatMap((v) => v.words || []);
  }, [words, verses]);

  // Group words strictly by line_number (1..15)
  const lineMap = useMemo(() => {
    return groupWordsByLine(allWords);
  }, [allWords]);

  const arabicFontFamily = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;
  const headerAccessibilityLabel = formatMushafHeaderAccessibilityLabel(
    pageNumber,
    resolvedJuzNumber,
    resolvedSurahName
  );

  return (
    <View testID={testID} style={[styles.container, style]}>
      {/* Header Bar: Juz Name, Surah Name, and Page Number */}
      <View
        style={styles.headerBar}
        testID={`${testID}-header`}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={headerAccessibilityLabel}
      >
        {/* Right side in RTL: Juz Title */}
        <View style={styles.headerCell} testID={`${testID}-header-juz`}>
          <Text style={styles.headerMetaText}>
            {formatMushafJuzTitle(resolvedJuzNumber)}
          </Text>
        </View>

        {/* Center: Surah Title */}
        <View style={styles.headerCenterCell} testID={`${testID}-header-surah`}>
          <Text style={styles.headerSurahText}>
            {formatMushafSurahTitle(resolvedSurahName)}
          </Text>
        </View>

        {/* Left side in RTL: Page Title */}
        <View style={styles.headerCell} testID={`${testID}-header-page`}>
          <Text style={styles.headerMetaText}>
            {formatMushafPageTitle(pageNumber)}
          </Text>
        </View>
      </View>

      {/* 15-Line Physical Mushaf Replica */}
      <ScrollView
        testID={`${testID}-lines-scroll`}
        contentContainerStyle={styles.mushafContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mushafFrame} testID={`${testID}-mushaf-frame`}>
          {LINES_LIST.map((lineNum) => {
            const wordsOnLine = lineMap.get(lineNum) || [];
            const hasWords = wordsOnLine.length > 0;

            return (
              <View
                key={`mushaf-line-${lineNum}`}
                style={[
                  styles.mushafLine,
                  !hasWords && styles.mushafLineEmpty,
                ]}
                testID={`${testID}-line-${lineNum}`}
              >
                {hasWords ? (
                  wordsOnLine.map((word, wordIndex) => {
                    const isLastWordOfVerse =
                      wordIndex === wordsOnLine.length - 1 ||
                      wordsOnLine[wordIndex + 1]?.verse_key !== word.verse_key;

                    const arabicWordText =
                      quranFont === 'indopak' && word.text_indopak
                        ? word.text_indopak
                        : word.text_uthmani;

                    return (
                      <TouchableOpacity
                        key={`word-${word.id || `${lineNum}-${wordIndex}`}`}
                        activeOpacity={0.6}
                        onPress={() => onVersePress?.(word.verse_key)}
                        style={styles.wordTouchable}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`کلمه ${arabicWordText} از آیه ${word.verse_key}`}
                      >
                        <Text
                          style={[
                            styles.wordText,
                            { fontFamily: arabicFontFamily },
                          ]}
                          allowFontScaling={false}
                        >
                          {arabicWordText}
                        </Text>
                        {isLastWordOfVerse && (
                          <Text
                            style={styles.ayahEndMarker}
                            allowFontScaling={false}
                          >
                            {` ﴿${toPersianDigits(word.verse_number)}﴾ `}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyLinePlaceholder}>
                    <View style={styles.emptyLineOrnament} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Page Navigation Controls */}
      <View style={styles.footerBar} testID={`${testID}-footer`}>
        {/* Next Page Button (Left in RTL, advances forward pageNumber + 1) */}
        <TouchableOpacity
          testID={`${testID}-nav-next`}
          activeOpacity={0.7}
          onPress={onNextPage}
          disabled={pageNumber >= 604}
          style={[
            styles.navButton,
            pageNumber >= 604 && styles.navButtonDisabled,
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="صفحه بعدی"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft
            size={READER_COMPONENT_CONTRACTS.mushafPage.navIconSize}
            color={pageNumber >= 604 ? colors.textFaded : colors.primary}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* Center Page Indicator */}
        <View style={styles.pageIndicatorContainer} testID={`${testID}-footer-page-indicator`}>
          <Text style={styles.pageIndicatorText}>
            {formatMushafPageTitle(pageNumber)}
          </Text>
        </View>

        {/* Previous Page Button (Right in RTL, goes back pageNumber - 1) */}
        <TouchableOpacity
          testID={`${testID}-nav-prev`}
          activeOpacity={0.7}
          onPress={onPrevPage}
          disabled={pageNumber <= 1}
          style={[
            styles.navButton,
            pageNumber <= 1 && styles.navButtonDisabled,
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="صفحه قبلی"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronRight
            size={READER_COMPONENT_CONTRACTS.mushafPage.navIconSize}
            color={pageNumber <= 1 ? colors.textFaded : colors.primary}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  headerBar: {
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.headerMinHeight,
    height: READER_COMPONENT_CONTRACTS.mushafPage.headerMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
  },
  headerCenterCell: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMetaText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  headerSurahText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.goldAccent,
    textAlign: 'center',
  },
  mushafContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  mushafFrame: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mushafLine: {
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSeparator,
    paddingVertical: 2,
  },
  mushafLineEmpty: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  wordTouchable: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  wordText: {
    fontSize: READER_COMPONENT_CONTRACTS.mushafPage.quranFontSize,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  ayahEndMarker: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.goldAccent,
    fontWeight: '700',
    marginHorizontal: 1,
  },
  emptyLinePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
  },
  emptyLineOrnament: {
    width: '60%',
    height: 1,
    backgroundColor: colors.goldGlow,
  },
  footerBar: {
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.footerMinHeight,
    height: READER_COMPONENT_CONTRACTS.mushafPage.footerMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  navButton: {
    minWidth: READER_COMPONENT_CONTRACTS.mushafPage.navButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.navButtonSize,
    width: READER_COMPONENT_CONTRACTS.mushafPage.navButtonSize,
    height: READER_COMPONENT_CONTRACTS.mushafPage.navButtonSize,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
    borderColor: colors.borderSeparator,
  },
  pageIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
