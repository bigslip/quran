import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import {
  colors,
  AppTheme,
  themePalettes,
  emeraldColors,
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
  calculateMushafLineFontSize,
  calculateMushafPageFontSize,
} from './readerContracts';

export interface MushafPageViewProps {
  pageNumber: number;
  verses: Verse[];
  words?: Word[];
  theme?: AppTheme;
  quranFont?: 'hafs' | 'indopak';
  fontScale?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onVersePress?: (verseKey: string) => void;
  surahName?: string;
  juzNumber?: number;
  activeVerseKey?: string | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
  onScrollBeginDrag?: () => void;
  onScrollEndDrag?: () => void;
  onMomentumScrollEnd?: () => void;
  onPressPage?: () => void;
}

// 15-line contract definition for physical layout compatibility
const LINES_LIST = Array.from(
  { length: READER_COMPONENT_CONTRACTS.mushafPage.totalLines },
  (_, idx) => idx + 1,
);

interface VerseGroup {
  verseKey: string;
  verseNumber: number;
  words: Word[];
}

interface ChapterSegment {
  chapterId: number;
  isChapterStart: boolean;
  verses: VerseGroup[];
}

/**
 * MushafPageView renders a continuous justified Quranic page reading experience
 * matching the authentic visual flow and reflow of Tanzil.ir.
 *
 * Features:
 * - Header bar: Juz name (جزء X), Surah name, and page number in Persian numerals
 * - Continuous Quran scripture flow with native edge-to-edge justification (textAlign: 'justify')
 * - Responsive font size scaling at every single stepper step without artificial clamps or freezes
 * - Natural Arabic inter-word spacing without awkward voids or fragmented orphan words
 * - In-page Surah Title Cartouche and Bismillah Calligraphy for chapters beginning on that page
 * - Ornate Ayah end markers ﴿۱﴾ with inward-embracing Unicode brackets and Persian numerals
 * - Active Ayah highlighting (soft emerald glow tint) synchronized with audio playback
 * - Interactive verse touches triggering `onVersePress(verseKey)`
 * - Footer bar: Previous Page / Next Page navigation controls with >= 44x44px touch targets
 */
export const MushafPageView: React.FC<MushafPageViewProps> = React.memo(
  ({
    pageNumber,
    verses,
    words,
    theme = 'emerald',
    quranFont = 'hafs',
    fontScale = 1.0,
    onPrevPage,
    onNextPage,
    onVersePress,
    surahName,
    juzNumber,
    activeVerseKey,
    style,
    testID = 'mushaf-page-view',
    onScroll,
    scrollEventThrottle,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    onPressPage,
  }) => {
    const colors = themePalettes[theme] ?? emeraldColors;

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

    // Maintain lineMap for physical line contract checks
    const lineMap = useMemo(() => {
      return groupWordsByLine(allWords);
    }, [allWords]);

    // Precompute canonical sorted words in reading order
    const sortedWords = useMemo(() => {
      return [...allWords].sort((a, b) => {
        if (a.chapter_id !== b.chapter_id) return a.chapter_id - b.chapter_id;
        if (a.verse_number !== b.verse_number) return a.verse_number - b.verse_number;
        return a.position - b.position;
      });
    }, [allWords]);

    // Precompute the set of last word keys for each verse on this page.
    const verseEndWordKeys = useMemo(() => {
      const map = new Map<string, string>();
      for (const w of sortedWords) {
        const key = w.id ? String(w.id) : `${w.verse_key}:${w.position}`;
        map.set(w.verse_key, key);
      }
      return new Set(map.values());
    }, [sortedWords]);

    // Group page content by chapter segments with chapter start identification
    const chapterSegments = useMemo(() => {
      const segments: ChapterSegment[] = [];
      let currentSegment: ChapterSegment | null = null;
      const verseMap = new Map<string, VerseGroup>();

      for (const w of sortedWords) {
        if (!currentSegment || currentSegment.chapterId !== w.chapter_id) {
          currentSegment = {
            chapterId: w.chapter_id,
            isChapterStart: false,
            verses: [],
          };
          segments.push(currentSegment);
        }

        if (w.verse_number === 1) {
          currentSegment.isChapterStart = true;
        }

        let verseEntry = verseMap.get(w.verse_key);
        if (!verseEntry) {
          verseEntry = {
            verseKey: w.verse_key,
            verseNumber: w.verse_number,
            words: [],
          };
          verseMap.set(w.verse_key, verseEntry);
          currentSegment.verses.push(verseEntry);
        }
        verseEntry.words.push(w);
      }

      // Frontispiece opening pages special cases (pages 1 and 2)
      for (const seg of segments) {
        if (seg.chapterId === 1 && pageNumber === 1) {
          seg.isChapterStart = true;
        } else if (seg.chapterId === 2 && pageNumber === 2) {
          seg.isChapterStart = true;
        }
      }

      return segments;
    }, [sortedWords, pageNumber]);

    // Dynamic font sizing: scales smoothly and monotonically at EVERY fontScale step
    const { fontSize: dynamicFontSize, lineHeight: dynamicLineHeight } = useMemo(() => {
      return calculateMushafPageFontSize(fontScale);
    }, [fontScale]);

    const arabicFontFamily = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;
    const headerAccessibilityLabel = formatMushafHeaderAccessibilityLabel(
      pageNumber,
      resolvedJuzNumber,
      resolvedSurahName,
    );

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          { backgroundColor: colors.background, borderColor: colors.borderSubtle },
          style,
        ]}
      >
        {/* Header Bar: Juz Name, Surah Name, and Page Number */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressPage}
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surfaceCard,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
          testID={`${testID}-header`}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel={headerAccessibilityLabel}
        >
          {/* Right side in RTL: Juz Title */}
          <View style={styles.headerCell} testID={`${testID}-header-juz`}>
            <Text style={[styles.headerMetaText, { color: colors.textSecondary }]}>
              {formatMushafJuzTitle(resolvedJuzNumber)}
            </Text>
          </View>

          {/* Center: Surah Title */}
          <View style={styles.headerCenterCell} testID={`${testID}-header-surah`}>
            <Text style={[styles.headerSurahText, { color: colors.goldAccent }]}>
              {formatMushafSurahTitle(resolvedSurahName)}
            </Text>
          </View>

          {/* Left side in RTL: Page Title */}
          <View style={styles.headerCell} testID={`${testID}-header-page`}>
            <Text style={[styles.headerMetaText, { color: colors.textSecondary }]}>
              {formatMushafPageTitle(pageNumber)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Continuous Quran Page Content with Natural Justification & Reflow */}
        <ScrollView
          testID={`${testID}-lines-scroll`}
          contentContainerStyle={styles.mushafContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle ?? 16}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
        >
          <TouchableOpacity
            accessible={false}
            activeOpacity={1}
            onPress={onPressPage}
            style={[
              styles.mushafFrame,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderIridescent,
              },
            ]}
            testID={`${testID}-mushaf-frame`}
          >
            {chapterSegments.map((segment, segIdx) => {
              const chapterArabic =
                getSurahNameArabic(segment.chapterId) || getSurahNameFa(segment.chapterId);
              const versesCount = getSurahVersesCount(segment.chapterId);
              const renderBismillah =
                segment.isChapterStart && shouldRenderBismillah(segment.chapterId);

              return (
                <View
                  key={`segment-${segment.chapterId}-${segIdx}`}
                  style={[
                    styles.chapterSegment,
                    segIdx > 0 && [
                      styles.chapterSegmentSpacer,
                      { borderTopColor: colors.borderSeparator },
                    ],
                  ]}
                >
                  {/* Surah Title Cartouche (When chapter starts on this page) */}
                  {segment.isChapterStart && (
                    <View
                      style={styles.surahCartoucheContainer}
                      testID={`${testID}-surah-cartouche-${segment.chapterId}`}
                      accessible={true}
                      accessibilityRole="header"
                      accessibilityLabel={`سوره ${chapterArabic}، ${toPersianDigits(
                        versesCount,
                      )} آیه`}
                    >
                      <View
                        style={[
                          styles.surahCartoucheFrame,
                          {
                            backgroundColor: colors.surfaceFloating,
                            borderColor: colors.goldAccent,
                          },
                        ]}
                      >
                        <Text style={[styles.surahCartoucheOrnament, { color: colors.goldGlow }]}>
                          ◈
                        </Text>
                        <View style={styles.surahCartoucheContent}>
                          <Text
                            style={[
                              styles.surahCartoucheTitle,
                              {
                                color: colors.goldAccent,
                                fontFamily: arabicFontFamily,
                                fontSize: Math.min(22, Math.round(17 * fontScale)),
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
                                {
                                  color: colors.textSecondary,
                                  fontSize: Math.max(
                                    10,
                                    Math.min(13, Math.round(fontSizes.xs * fontScale)),
                                  ),
                                },
                              ]}
                            >
                              {`آيَاتُهَا ${toPersianDigits(versesCount)}`}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.surahCartoucheOrnament, { color: colors.goldGlow }]}>
                          ◈
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Bismillah Banner Calligraphy (Omitted for Surah 9) */}
                  {renderBismillah && (
                    <View
                      style={styles.bismillahLineContainer}
                      testID={`${testID}-bismillah-${segment.chapterId}`}
                      accessible={true}
                      accessibilityRole="header"
                      accessibilityLabel="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                    >
                      <View
                        style={[styles.bismillahLineRule, { backgroundColor: colors.goldGlow }]}
                      />
                      <Text style={[styles.bismillahOrnamentDot, { color: colors.goldGlow }]}>
                        ◆
                      </Text>
                      <Text
                        style={[
                          styles.bismillahCalligraphyText,
                          {
                            color: colors.goldAccent,
                            fontFamily: arabicFontFamily,
                            fontSize: Math.min(24, Math.round(19 * fontScale)),
                          },
                        ]}
                        allowFontScaling={false}
                      >
                        {BISMILLAH_TEXT}
                      </Text>
                      <Text style={[styles.bismillahOrnamentDot, { color: colors.goldGlow }]}>
                        ◆
                      </Text>
                      <View
                        style={[styles.bismillahLineRule, { backgroundColor: colors.goldGlow }]}
                      />
                    </View>
                  )}

                  {/* Continuous Justified Quran Scripture Flow */}
                  <Text
                    style={[
                      styles.continuousQuranText,
                      {
                        color: colors.textPrimary,
                        fontFamily: arabicFontFamily,
                        fontSize: dynamicFontSize,
                        lineHeight: dynamicLineHeight,
                        textAlign: 'justify',
                        writingDirection: 'rtl',
                      },
                    ]}
                    allowFontScaling={false}
                  >
                    {segment.verses.map((verse) => {
                      const isVerseActive = activeVerseKey === verse.verseKey;
                      const arabicVerseText = verse.words
                        .map((w) =>
                          quranFont === 'indopak' && w.text_indopak
                            ? w.text_indopak
                            : w.text_uthmani,
                        )
                        .join(' ');

                      return (
                        <Text
                          key={verse.verseKey}
                          onPress={() => onVersePress?.(verse.verseKey)}
                          style={
                            isVerseActive
                              ? [
                                  styles.activeVerseHighlight,
                                  {
                                    backgroundColor: colors.primarySubtle,
                                  },
                                ]
                              : undefined
                          }
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`آیه ${verse.verseKey}`}
                        >
                          {arabicVerseText}
                          <Text
                            style={[
                              styles.ayahEndMarker,
                              {
                                color: colors.goldAccent,
                                fontFamily: fonts.quranHafs,
                                fontSize: dynamicFontSize,
                              },
                            ]}
                            allowFontScaling={false}
                          >
                            {formatAyahEndMarker(verse.verseNumber)}
                          </Text>
                        </Text>
                      );
                    })}
                  </Text>
                </View>
              );
            })}
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Page Navigation Controls (RTL) */}
        <View
          style={[
            styles.footerBar,
            {
              backgroundColor: colors.surfaceCard,
              borderTopColor: colors.borderSubtle,
            },
          ]}
          testID={`${testID}-footer`}
        >
          {/* Previous Page Button (Right in RTL, goes back pageNumber - 1) */}
          <TouchableOpacity
            testID={`${testID}-nav-prev`}
            activeOpacity={0.7}
            onPress={onPrevPage}
            disabled={pageNumber <= 1}
            style={[
              styles.navButton,
              {
                backgroundColor: colors.surfaceFloating,
                borderColor: colors.borderSubtle,
              },
              pageNumber <= 1 && [
                styles.navButtonDisabled,
                { borderColor: colors.borderSeparator },
              ],
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
            <Text style={[styles.pageIndicatorText, { color: colors.textSecondary }]}>
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
              {
                backgroundColor: colors.surfaceFloating,
                borderColor: colors.borderSubtle,
              },
              pageNumber >= 604 && [
                styles.navButtonDisabled,
                { borderColor: colors.borderSeparator },
              ],
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
  },
);

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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  chapterSegment: {
    width: '100%',
  },
  chapterSegmentSpacer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
  },
  continuousQuranText: {
    color: colors.textPrimary,
    textAlign: 'justify',
    writingDirection: 'rtl',
    paddingHorizontal: spacing.xs,
  },
  activeVerseHighlight: {
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.sm,
  },
  ayahEndMarker: {
    fontFamily: fonts.quranHafs,
    color: colors.goldAccent,
  },
  surahCartoucheContainer: {
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  surahCartoucheFrame: {
    width: '96%',
    minHeight: 40,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.goldAccent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: spacing.sm,
  },
  surahCartoucheContent: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  surahCartoucheTitle: {
    fontWeight: '700',
    color: colors.goldAccent,
    textAlign: 'center',
  },
  surahCartoucheBadge: {
    fontFamily: fonts.uiRegular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  surahCartoucheOrnament: {
    color: colors.goldGlow,
    fontSize: 10,
  },
  bismillahLineContainer: {
    minHeight: READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing.sm,
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
    color: colors.goldAccent,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
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
