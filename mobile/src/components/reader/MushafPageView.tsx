import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  rtlRow,
} from '@/theme';
import { Verse, Word } from '@/types/quran';
import { toPersianDigits } from '@/components/catalog';
import {
  BISMILLAH_TEXT,
  READER_COMPONENT_CONTRACTS,
  groupWordsByLine,
  formatMushafJuzTitle,
  formatMushafPageTitle,
  formatMushafSurahTitle,
  formatMushafHeaderAccessibilityLabel,
  getSurahNameFa,
  getSurahNameArabic,
  getSurahVersesCount,
  shouldRenderBismillah,
  formatAyahEndMarker,
  countArabicBaseCharacters,
  calculateMushafLineFontSize,
} from './readerContracts';

export interface MushafPageViewProps {
  pageNumber: number;
  verses: Verse[];
  words?: Word[];
  quranFont?: 'hafs' | 'indopak';
  fontScale?: number;
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
 * - In-page Surah Title Cartouche and Bismillah Calligraphy on lines reserved for Surah openings
 * - Precise verse ending marker logic: appears strictly once per verse at the true ending
 * - Interactive word/verse selection triggering `onVersePress(verseKey)`
 * - Page navigation bottom controls (Next Page / Previous Page) with >= 44x44px touch targets
 */
export const MushafPageView: React.FC<MushafPageViewProps> = React.memo(({
  pageNumber,
  verses,
  words,
  quranFont = 'hafs',
  fontScale = 1.0,
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

  // Precompute the set of last word keys for each verse on this page.
  // This guarantees verse end markers (e.g. ﴿۷۲﴾) only appear ONCE per verse,
  // strictly on the actual final word of that verse, never on intermediate line-breaks.
  const verseEndWordKeys = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of allWords) {
      const key = w.id ? String(w.id) : `${w.verse_key}:${w.position}`;
      map.set(w.verse_key, key);
    }
    return new Set(map.values());
  }, [allWords]);

  // Identify in-page chapter starts and assign lines to Surah Title Cartouche and Bismillah Calligraphy.
  // In the Medina 15-line Mushaf layout:
  // - startLine - 2: Surah Title Cartouche
  // - startLine - 1: Bismillah Calligraphy (omitted for Surah 9 At-Tawbah)
  // - startLine == 2: Line 1 is Surah Title Cartouche (Surah 9) or Bismillah
  const inPageLineRoles = useMemo(() => {
    const roles = new Map<number, { type: 'surah_title' | 'bismillah'; chapterId: number }>();
    const seenChapters = new Set<number>();

    for (const w of allWords) {
      if (w.verse_number === 1 && !seenChapters.has(w.chapter_id)) {
        seenChapters.add(w.chapter_id);
        const startLine = w.line_number ?? 1;
        if (startLine >= 3) {
          roles.set(startLine - 2, { type: 'surah_title', chapterId: w.chapter_id });
          if (shouldRenderBismillah(w.chapter_id)) {
            roles.set(startLine - 1, { type: 'bismillah', chapterId: w.chapter_id });
          }
        } else if (startLine === 2) {
          if (w.chapter_id === 9) {
            roles.set(1, { type: 'surah_title', chapterId: 9 });
          } else {
            roles.set(1, { type: 'bismillah', chapterId: w.chapter_id });
          }
        }
      }
    }

    // Special handling for opening frontispiece pages (pages 1 and 2)
    if (pageNumber === 1) {
      roles.set(8, { type: 'surah_title', chapterId: 1 });
    } else if (pageNumber === 2) {
      roles.set(8, { type: 'surah_title', chapterId: 2 });
      roles.set(9, { type: 'bismillah', chapterId: 2 });
    }

    return roles;
  }, [allWords, pageNumber]);

  const { width: windowWidth } = useWindowDimensions();
  const availableLineWidth = Math.max(260, windowWidth - 28);

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
            const wordCount = wordsOnLine.length;

            // Count base characters and markers on this line to compute safe responsive scaling
            let lineBaseChars = 0;
            let markerCount = 0;
            for (const word of wordsOnLine) {
              const wordKey = word.id ? String(word.id) : `${word.verse_key}:${word.position}`;
              if (verseEndWordKeys.has(wordKey)) {
                markerCount++;
              }
              const arabicWordText =
                quranFont === 'indopak' && word.text_indopak
                  ? word.text_indopak
                  : word.text_uthmani;
              lineBaseChars += countArabicBaseCharacters(arabicWordText);
            }

            const {
              fontSize: dynamicFontSize,
              lineHeight: scaledLineHeight,
              wordPadding: dynamicWordPadding,
              isJustified,
            } = calculateMushafLineFontSize({
              wordCount,
              totalBaseChars: lineBaseChars,
              markerCount,
              availableLineWidth,
              fontScale,
            });

            if (hasWords) {
              return (
                <View
                  key={`mushaf-line-${lineNum}`}
                  style={[
                    styles.mushafLine,
                    {
                      minHeight: scaledLineHeight,
                      justifyContent: isJustified ? 'space-between' : 'center',
                    },
                  ]}
                  testID={`${testID}-line-${lineNum}`}
                >
                  {wordsOnLine.map((word, wordIndex) => {
                    const wordKey = word.id ? String(word.id) : `${word.verse_key}:${word.position}`;
                    const isLastWordOfVerse = verseEndWordKeys.has(wordKey);

                    const arabicWordText =
                      quranFont === 'indopak' && word.text_indopak
                        ? word.text_indopak
                        : word.text_uthmani;

                    return (
                      <TouchableOpacity
                        key={`word-${word.id || `${lineNum}-${wordIndex}`}`}
                        activeOpacity={0.6}
                        onPress={() => onVersePress?.(word.verse_key)}
                        style={[
                          styles.wordTouchable,
                          {
                            paddingHorizontal: dynamicWordPadding,
                            marginHorizontal: isJustified ? 0 : 3,
                          },
                        ]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`کلمه ${arabicWordText} از آیه ${word.verse_key}`}
                      >
                        <Text
                          style={[
                            styles.wordText,
                            {
                              fontFamily: arabicFontFamily,
                              fontSize: dynamicFontSize,
                            },
                          ]}
                          allowFontScaling={false}
                          numberOfLines={1}
                        >
                          {arabicWordText}
                        </Text>
                        {isLastWordOfVerse && (
                          <Text
                            style={[
                              styles.ayahEndMarker,
                              { fontSize: Math.max(10, Math.round(dynamicFontSize * 0.75)) },
                            ]}
                            allowFontScaling={false}
                          >
                            {formatAyahEndMarker(word.verse_number)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            }

            // Check if this empty line serves as an in-page Surah Title Cartouche or Bismillah Banner
            const lineRole = inPageLineRoles.get(lineNum);

            if (lineRole?.type === 'surah_title') {
              const chapterArabic = getSurahNameArabic(lineRole.chapterId) || getSurahNameFa(lineRole.chapterId);
              const versesCount = getSurahVersesCount(lineRole.chapterId);
              return (
                <View
                  key={`mushaf-line-${lineNum}`}
                  style={[
                    styles.surahCartoucheContainer,
                    {
                      minHeight: scaledLineHeight,
                    },
                  ]}
                  testID={`${testID}-line-${lineNum}-surah-cartouche`}
                  accessible={true}
                  accessibilityRole="header"
                  accessibilityLabel={`سوره ${chapterArabic}، ${toPersianDigits(versesCount)} آیه`}
                >
                  <View style={styles.surahCartoucheFrame}>
                    <Text style={styles.surahCartoucheOrnament}>◈</Text>
                    <View style={styles.surahCartoucheContent}>
                      <Text
                        style={[
                          styles.surahCartoucheTitle,
                          {
                            fontFamily: arabicFontFamily,
                            fontSize: Math.min(20, Math.round(16 * fontScale)),
                          },
                        ]}
                        allowFontScaling={false}
                      >
                        {`سُورَةُ ${chapterArabic}`}
                      </Text>
                      {versesCount > 0 && (
                        <Text
                          style={[
                            styles.surahCartoucheBadge,
                            { fontSize: Math.max(9, Math.min(12, Math.round(fontSizes.xs * fontScale))) },
                          ]}
                        >
                          {`آيَاتُهَا ${toPersianDigits(versesCount)}`}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.surahCartoucheOrnament}>◈</Text>
                  </View>
                </View>
              );
            }

            if (lineRole?.type === 'bismillah') {
              return (
                <View
                  key={`mushaf-line-${lineNum}`}
                  style={[
                    styles.bismillahLineContainer,
                    {
                      minHeight: scaledLineHeight,
                    },
                  ]}
                  testID={`${testID}-line-${lineNum}-bismillah`}
                  accessible={true}
                  accessibilityRole="header"
                  accessibilityLabel="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                >
                  <View style={styles.bismillahLineRule} />
                  <Text style={styles.bismillahOrnamentDot}>◆</Text>
                  <Text
                    style={[
                      styles.bismillahCalligraphyText,
                      {
                        fontFamily: arabicFontFamily,
                        fontSize: Math.min(22, Math.round(18 * fontScale)),
                      },
                    ]}
                    allowFontScaling={false}
                  >
                    {BISMILLAH_TEXT}
                  </Text>
                  <Text style={styles.bismillahOrnamentDot}>◆</Text>
                  <View style={styles.bismillahLineRule} />
                </View>
              );
            }

            // Default empty line placeholder (e.g. line 15 blank spacing at end of chapter)
            return (
              <View
                key={`mushaf-line-${lineNum}`}
                style={[
                  styles.mushafLine,
                  styles.mushafLineEmpty,
                  {
                    minHeight: scaledLineHeight,
                  },
                ]}
                testID={`${testID}-line-${lineNum}`}
              >
                <View style={styles.emptyLinePlaceholder}>
                  <View style={styles.emptyLineOrnament} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Page Navigation Controls (RTL) */}
      <View style={styles.footerBar} testID={`${testID}-footer`}>
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

        {/* Center Page Indicator */}
        <View style={styles.pageIndicatorContainer} testID={`${testID}-footer-page-indicator`}>
          <Text style={styles.pageIndicatorText}>
            {formatMushafPageTitle(pageNumber)}
          </Text>
        </View>

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
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  mushafFrame: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    overflow: 'hidden',
  },
  mushafLine: {
    width: '100%',
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSeparator,
    paddingVertical: 2,
    flexWrap: 'wrap',
    rowGap: 4,
  },
  mushafLineEmpty: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  wordTouchable: {
    flexDirection: rtlRow,
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
    flexShrink: 0,
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
  surahCartoucheContainer: {
    height: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSeparator,
  },
  surahCartoucheFrame: {
    flex: 1,
    width: '96%',
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.goldAccent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  surahCartoucheContent: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  surahCartoucheTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.goldAccent,
    textAlign: 'center',
  },
  surahCartoucheBadge: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  surahCartoucheOrnament: {
    color: colors.goldGlow,
    fontSize: 10,
  },
  bismillahLineContainer: {
    height: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSeparator,
  },
  bismillahLineRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.goldGlow,
    maxWidth: 36,
  },
  bismillahOrnamentDot: {
    color: colors.goldGlow,
    fontSize: 7,
  },
  bismillahCalligraphyText: {
    fontSize: 18,
    color: colors.goldAccent,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
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
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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
