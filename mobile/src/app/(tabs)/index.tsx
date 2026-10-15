import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Play,
  BookOpen,
  Bookmark,
  Radio,
  Mic,
  Award,
  Compass,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';
import {
  useThemeColors,
  type ColorTheme,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  rtlRow,
  rtlTextAlign,
} from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SanctuaryBadge } from '@/components/common/SanctuaryBadge';
import { SanctuaryCard } from '@/components/common/SanctuaryCard';
import { SearchBar } from '@/components/common/SearchBar';
import { QuickJumpModal } from '@/components/navigation';
import { JumpDestination } from '@/services/db/quickJumpContracts';
import { searchQuran, searchChapters } from '@/services/db/searchService';
import { SearchResult, Chapter } from '@/types/quran';
import { useReadingStore } from '@/stores/useReadingStore';

const quickSurahs = [
  { id: 36, name: 'یس', desc: 'قلب قرآن' },
  { id: 55, name: 'الرحمن', desc: 'عروس قرآن' },
  { id: 56, name: 'واقعه', desc: 'سوره برکت' },
  { id: 67, name: 'ملک', desc: 'نجات‌بخش' },
  { id: 18, name: 'کهف', desc: 'جمعه‌ها' },
  { id: 114, name: 'ناس', desc: 'پناه‌گاه' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickResults, setQuickResults] = useState<SearchResult[]>([]);
  const [quickChapters, setQuickChapters] = useState<Chapter[]>([]);
  const [isSearchingQuick, setIsSearchingQuick] = useState(false);
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'صبح بخیر';
    if (hour >= 12 && hour < 17) return 'روز بخیر';
    if (hour >= 17 && hour < 21) return 'عصر بخیر';
    return 'شامگاه بخیر';
  }, []);

  const lastReadChapterId = useReadingStore((s) => s.lastReadChapterId);
  const lastReadVerseNumber = useReadingStore((s) => s.lastReadVerseNumber);
  const lastReadChapterNameFa = useReadingStore((s) => s.lastReadChapterNameFa);

  const handleQuickJump = useCallback(
    (destination: JumpDestination) => {
      setIsQuickJumpOpen(false);
      const targetRoute = `/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}`;
      router.push(
        (destination.autoScroll === false ? `${targetRoute}&autoScroll=false` : targetRoute) as any,
      );
    },
    [router],
  );

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) {
      router.push({
        pathname: '/(tabs)/search',
        params: { q: trimmed },
      } as any);
    } else {
      router.push('/(tabs)/search' as any);
    }
  }, [searchQuery, router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setQuickResults([]);
    setQuickChapters([]);
    setIsSearchingQuick(false);
  }, []);

  // Quick live search when typing >= 2 characters on Home screen
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setQuickResults([]);
      setQuickChapters([]);
      setIsSearchingQuick(false);
      return;
    }

    let isMounted = true;
    setIsSearchingQuick(true);
    const timer = setTimeout(async () => {
      try {
        const [verses, chapters] = await Promise.all([
          searchQuran(trimmed, 3),
          searchChapters(trimmed, 2).catch(() => []),
        ]);
        if (isMounted) {
          setQuickResults(verses);
          setQuickChapters(chapters);
          setIsSearchingQuick(false);
        }
      } catch {
        if (isMounted) {
          setQuickResults([]);
          setQuickChapters([]);
          setIsSearchingQuick(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow height={320} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Sanctuary Badge & Greeting */}
        <View style={styles.header}>
          <SanctuaryBadge label="فضای معنوی قرآن کریم" />
          <Text style={[styles.greetingText, { color: colors.textMuted }]}>
            {greeting}، همراه قرآنی
          </Text>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>قرآن من</Text>
        </View>

        {/* Search Command Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            testID="home-search-bar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            onClear={handleClearSearch}
            placeholder="جستجوی سوره، آیه، کلمه..."
          />

          {/* Quick Search Preview Panel */}
          {searchQuery.trim().length >= 2 && (
            <View style={styles.quickSearchResultsPanel} testID="home-quick-search-results">
              {quickChapters.length > 0 && (
                <View style={styles.quickChaptersRow}>
                  {quickChapters.map((chapter) => (
                    <TouchableOpacity
                      key={`home-chap-${chapter.id}`}
                      style={styles.quickChapterChip}
                      onPress={() => router.push(`/surah/${chapter.id}` as any)}
                      activeOpacity={0.75}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`سوره ${chapter.name_fa}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      testID={`home-quick-chapter-${chapter.id}`}
                    >
                      <BookOpen size={14} color={colors.primary} />
                      <Text style={styles.quickChapterText}>
                        سوره {chapter.name_fa} ({chapter.id})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {quickResults.map((verse) => (
                <TouchableOpacity
                  key={`home-verse-${verse.verse_key}`}
                  style={styles.quickVerseCard}
                  onPress={() =>
                    router.push(`/surah/${verse.chapter_id}?verse=${verse.verse_number}` as any)
                  }
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`سوره ${verse.chapter_name_fa}، آیه ${verse.verse_number}`}
                  testID={`home-quick-verse-${verse.verse_key}`}
                >
                  <View style={styles.quickVerseHeader}>
                    <Text style={styles.quickVerseSurah}>
                      {verse.chapter_name_fa} • آیه {verse.verse_number}
                    </Text>
                    <Text style={styles.quickVerseKey}>{verse.verse_key}</Text>
                  </View>
                  <Text style={styles.quickVerseTranslation} numberOfLines={2}>
                    {verse.translation_fa}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.viewAllResultsButton}
                onPress={handleSearchSubmit}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="مشاهده همه نتایج جستجو"
                testID="home-view-all-search-results"
              >
                <Text style={styles.viewAllResultsText}>
                  مشاهده همه نتایج برای «{searchQuery.trim()}»
                </Text>
                <ArrowLeft size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Continue Reading Card */}
        <SanctuaryCard
          elevated
          style={[
            styles.continueCard,
            { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.continueHeader}>
            <View style={styles.continueBadge}>
              <Bookmark size={14} color={colors.primary} />
              <Text style={[styles.continueBadgeText, { color: colors.primary }]}>ادامه تلاوت</Text>
            </View>
            <Text style={[styles.lastReadTime, { color: colors.textFaded }]}>آخرین بازدید</Text>
          </View>

          <View style={styles.continueBody}>
            <View style={styles.continueInfo}>
              <Text style={[styles.surahNameFa, { color: colors.textPrimary }]}>
                {lastReadChapterNameFa}
              </Text>
              <Text style={[styles.verseLocation, { color: colors.textSecondary }]}>
                آیه {lastReadVerseNumber}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.playButton,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push(`/surah/${lastReadChapterId}` as any)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`ادامه تلاوت سوره ${lastReadChapterNameFa}، آیه ${lastReadVerseNumber}`}
            >
              <Play size={20} color={colors.textInverse} fill={colors.textInverse} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: '45%', backgroundColor: colors.primary }]}
            />
          </View>
        </SanctuaryCard>

        {/* Quick Jump Action Card */}
        <TouchableOpacity
          style={styles.quickJumpButton}
          activeOpacity={0.8}
          onPress={() => setIsQuickJumpOpen(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="پرش سریع به متن قرآن"
          testID="home-quick-jump-button"
        >
          <SanctuaryCard
            elevated
            style={[
              styles.quickJumpCard,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderIridescent },
            ]}
          >
            <View style={styles.quickJumpRow}>
              <View style={styles.quickJumpIconContainer}>
                <Compass size={24} color={colors.goldAccent} />
              </View>
              <View style={styles.quickJumpInfo}>
                <Text style={[styles.quickJumpTitle, { color: colors.textPrimary }]}>
                  پرش سریع به متن قرآن
                </Text>
                <Text style={[styles.quickJumpSubtitle, { color: colors.textSecondary }]}>
                  انتقال مستقیم به سوره، آیه، شماره صفحه یا جزء
                </Text>
              </View>
            </View>
          </SanctuaryCard>
        </TouchableOpacity>

        {/* Quick Surah Access Pills */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>دسترسی سریع</Text>
          <Sparkles size={16} color={colors.goldAccent} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickSurahsRow}
        >
          {quickSurahs.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.quickSurahPill,
                { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
              ]}
              onPress={() => router.push(`/surah/${s.id}` as any)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`سوره ${s.name}`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.quickSurahName, { color: colors.textPrimary }]}>
                سوره {s.name}
              </Text>
              <Text style={[styles.quickSurahDesc, { color: colors.textFaded }]}>{s.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Daily Ayah Card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>آیه و تدبر روز</Text>
        </View>

        <SanctuaryCard
          style={[
            styles.dailyAyahCard,
            { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
          ]}
        >
          <Text style={[styles.dailyAyahArabic, { color: colors.textPrimary }]}>
            أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </Text>
          <Text style={[styles.dailyAyahTranslation, { color: colors.textSecondary }]}>
            «آگاه باشید که تنها با یاد خدا دل‌ها آرام می‌گیرد.»
          </Text>
          <View style={[styles.dailyAyahFooter, { borderTopColor: colors.borderSeparator }]}>
            <Text style={[styles.dailyAyahRef, { color: colors.textFaded }]}>
              سوره رعد • آیه ۲۸
            </Text>
            <TouchableOpacity
              style={styles.listenButton}
              onPress={() =>
                router.push({
                  pathname: '/surah/[id]',
                  params: { id: '13', verse: '28', autoScroll: 'true' },
                } as any)
              }
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="استماع تلاوت سوره رعد، آیه ۲۸"
            >
              <Play size={14} color={colors.primary} />
              <Text style={[styles.listenButtonText, { color: colors.primary }]}>استماع</Text>
            </TouchableOpacity>
          </View>
        </SanctuaryCard>

        {/* Quick Portal Services */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>بخش‌های منتخب</Text>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={[
              styles.gridItem,
              { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
            ]}
            activeOpacity={0.75}
            onPress={() => router.push('/surahs')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="فهرست ۱۱۴ سوره، فهرست ترتیبی و نزول"
          >
            <BookOpen size={24} color={colors.primary} />
            <Text style={[styles.gridItemTitle, { color: colors.textPrimary }]}>
              فهرست ۱۱۴ سوره
            </Text>
            <Text style={[styles.gridItemDesc, { color: colors.textFaded }]}>
              فهرست ترتیبی و نزول
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.gridItem,
              { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
            ]}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="رادیو ۲۴ ساعته، پخش زنده تلاوت قرآن"
          >
            <Radio size={24} color={colors.goldAccent} />
            <Text style={[styles.gridItemTitle, { color: colors.textPrimary }]}>
              رادیو ۲۴ ساعته
            </Text>
            <Text style={[styles.gridItemDesc, { color: colors.textFaded }]}>
              پخش زنده تلاوت قرآن
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.gridItem,
              { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
            ]}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="قاریان برگزیده، اساتید ایرانی و جهان اسلام"
          >
            <Mic size={24} color="#38bdf8" />
            <Text style={[styles.gridItemTitle, { color: colors.textPrimary }]}>
              قاریان برگزیده
            </Text>
            <Text style={[styles.gridItemDesc, { color: colors.textFaded }]}>
              اساتید ایرانی و جهان اسلام
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.gridItem,
              { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
            ]}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="برنامه‌های آموزشی، تجوید و تفسیر کاربردی"
          >
            <Award size={24} color="#ec4899" />
            <Text style={[styles.gridItemTitle, { color: colors.textPrimary }]}>
              برنامه‌های آموزشی
            </Text>
            <Text style={[styles.gridItemDesc, { color: colors.textFaded }]}>
              تجوید و تفسیر کاربردی
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QuickJumpModal
        visible={isQuickJumpOpen}
        onClose={() => setIsQuickJumpOpen(false)}
        onJump={handleQuickJump}
        initialChapterId={lastReadChapterId || 1}
        initialVerseNumber={lastReadVerseNumber || 1}
        testID="home-quick-jump-modal"
      />
    </View>
  );
}

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: 54,
      paddingBottom: 40,
      paddingHorizontal: spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    greetingText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
    heroTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.jumbo,
      color: colors.textPrimary,
      marginTop: spacing.xs,
    },
    searchSection: {
      marginBottom: spacing.lg,
    },
    quickSearchResultsPanel: {
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    quickChaptersRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    quickChapterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceFloating,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: borderRadius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      minHeight: 36,
    },
    quickChapterText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.textPrimary,
    },
    quickVerseCard: {
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      gap: 4,
    },
    quickVerseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quickVerseSurah: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.xs,
      color: colors.primary,
    },
    quickVerseKey: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
    },
    quickVerseTranslation: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      lineHeight: 18,
      textAlign: 'right',
    },
    viewAllResultsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.borderSeparator,
      minHeight: 40,
    },
    viewAllResultsText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.primary,
    },
    continueCard: {
      marginBottom: spacing.xl,
    },
    continueHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    continueBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    continueBadgeText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.primary,
    },
    lastReadTime: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
    },
    continueBody: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    continueInfo: {
      alignItems: 'flex-start',
    },
    surahNameFa: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.xl,
      color: colors.textPrimary,
    },
    verseLocation: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    playButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.circle,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    progressBarBg: {
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
    },
    quickSurahsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingBottom: spacing.lg,
    },
    quickSurahPill: {
      backgroundColor: colors.surfaceFloating,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      minWidth: 90,
    },
    quickSurahName: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.textPrimary,
    },
    quickSurahDesc: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xxs,
      color: colors.textFaded,
      marginTop: 2,
    },
    dailyAyahCard: {
      marginBottom: spacing.xl,
    },
    dailyAyahArabic: {
      fontFamily: fonts.quranHafs,
      fontSize: 22,
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 40,
      marginBottom: spacing.sm,
    },
    dailyAyahTranslation: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.md,
    },
    dailyAyahFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.borderSeparator,
      paddingTop: spacing.sm,
    },
    dailyAyahRef: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
    },
    listenButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      gap: 4,
    },
    listenButtonText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.primary,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    gridItem: {
      width: '47.5%',
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'flex-start',
      gap: spacing.xs,
    },
    gridItemTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.textPrimary,
      marginTop: spacing.xs,
    },
    gridItemDesc: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
    },
    quickJumpButton: {
      minHeight: 44,
      marginBottom: spacing.xl,
    },
    quickJumpCard: {
      padding: spacing.md,
    },
    quickJumpRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.md,
    },
    quickJumpIconContainer: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.circle,
      backgroundColor: 'rgba(212, 175, 55, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickJumpInfo: {
      flex: 1,
    },
    quickJumpTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
      textAlign: rtlTextAlign,
    },
    quickJumpSubtitle: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: rtlTextAlign,
    },
  });
