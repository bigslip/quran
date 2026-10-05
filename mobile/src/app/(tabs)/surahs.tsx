import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { useThemeColors, type ColorTheme, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SearchBar } from '@/components/common/SearchBar';
import { QuickJumpModal } from '@/components/navigation';
import { JumpDestination } from '@/services/db/quickJumpContracts';
import {
  SurahCardItem,
  JuzCardItem,
  CatalogTabSwitcher,
  CatalogEmptyState,
  filterSurahs,
  filterJuzs,
  toPersianDigits,
  type CatalogTabId,
} from '@/components/catalog';
import { Chapter, Juz } from '@/types/quran';
import { getAllSurahs, getAllJuzs } from '@/services/db/surahService';

type CatalogItem = Chapter | Juz;

export default function SurahsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const flatListRef = useRef<FlatList<CatalogItem>>(null);
  const [activeTab, setActiveTab] = useState<CatalogTabId>('surah');
  const [query, setQuery] = useState('');
  const [surahs, setSurahs] = useState<Chapter[]>([]);
  const [revelationSurahs, setRevelationSurahs] = useState<Chapter[]>([]);
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);

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

  const loadCatalogData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [allSurahs, allJuzs] = await Promise.all([getAllSurahs('id'), getAllJuzs()]);

      const sortedRev = [...allSurahs].sort((a, b) => a.revelation_order - b.revelation_order);

      setSurahs(allSurahs);
      setRevelationSurahs(sortedRev);
      setJuzs(allJuzs);
    } catch (err) {
      console.error('Failed to load Quran catalog data:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  const handleTabChange = useCallback((tab: CatalogTabId) => {
    setActiveTab(tab);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const handleSurahPress = useCallback(
    (surah: Chapter) => {
      router.push(`/surah/${surah.id}` as any);
    },
    [router],
  );

  const handleJuzPress = useCallback(
    (juz: Juz) => {
      router.push(`/surah/${juz.first_chapter_id}` as any);
    },
    [router],
  );

  const filteredData = useMemo<CatalogItem[]>(() => {
    if (activeTab === 'surah') {
      return filterSurahs(surahs, query);
    }
    if (activeTab === 'revelation') {
      return filterSurahs(revelationSurahs, query);
    }
    return filterJuzs(juzs, query);
  }, [activeTab, surahs, revelationSurahs, juzs, query]);

  const countBadgeText = useMemo(() => {
    const count = filteredData.length;
    const persianCount = toPersianDigits(count);
    if (activeTab === 'juz') {
      return `${persianCount} جزء`;
    }
    return `${persianCount} سوره`;
  }, [activeTab, filteredData.length]);

  const searchPlaceholder = useMemo(() => {
    if (activeTab === 'juz') {
      return 'جستجو در جزء، سوره یا شماره...';
    }
    if (activeTab === 'revelation') {
      return 'جستجو در نام سوره، شماره یا ترتیب نزول...';
    }
    return 'جستجو در نام سوره، شماره یا ترجمه...';
  }, [activeTab]);

  const keyExtractor = useCallback(
    (item: CatalogItem) => {
      if ('juz_number' in item) {
        return `juz-${item.juz_number}`;
      }
      return `${activeTab}-${item.id}`;
    },
    [activeTab],
  );

  const renderItem = useCallback<ListRenderItem<CatalogItem>>(
    ({ item }) => {
      if (activeTab === 'juz') {
        return <JuzCardItem juz={item as Juz} onPress={handleJuzPress} />;
      }

      const isRevelation = activeTab === 'revelation';
      return (
        <SurahCardItem
          surah={item as Chapter}
          isRevelationOrder={isRevelation}
          onPress={handleSurahPress}
        />
      );
    },
    [activeTab, handleSurahPress, handleJuzPress],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow height={220} />

      {/* Sanctuary Header */}
      <View style={styles.header}>
        {/* Title row with sanctuary title and counter badge */}
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>فهرست قرآن</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              سوره‌ها و جزءهای کلام‌الله مجید
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.quickJumpButton,
                { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
              ]}
              activeOpacity={0.75}
              onPress={() => setIsQuickJumpOpen(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="پرش سریع"
              testID="catalog-quick-jump-button"
            >
              <Compass size={16} color={colors.goldAccent} />
              <Text style={[styles.quickJumpButtonText, { color: colors.goldAccent }]}>
                پرش سریع
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.countBadge,
                { backgroundColor: colors.surfaceFloating, borderColor: colors.borderIridescent },
              ]}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`تعداد: ${countBadgeText}`}
            >
              <Text style={[styles.countBadgeText, { color: colors.goldAccent }]}>
                {countBadgeText}
              </Text>
            </View>
          </View>
        </View>

        {/* Real-time search bar */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          onClear={() => setQuery('')}
        />

        {/* 3-way Segmented Catalog Tab Switcher */}
        <CatalogTabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            در حال بارگذاری فهرست قرآن...
          </Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            خطا در بارگذاری اطلاعات
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            امکان بارگذاری فهرست قرآن وجود ندارد
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: colors.primarySubtle, borderColor: colors.primaryGlow },
            ]}
            onPress={loadCatalogData}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="تلاش مجدد"
          >
            <Text style={[styles.retryButtonText, { color: colors.primary }]}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredData.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={<CatalogEmptyState query={query} onClearQuery={() => setQuery('')} />}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      <QuickJumpModal
        visible={isQuickJumpOpen}
        onClose={() => setIsQuickJumpOpen(false)}
        onJump={handleQuickJump}
        initialChapterId={1}
        initialVerseNumber={1}
        testID="catalog-quick-jump-modal"
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
    header: {
      paddingTop: 54,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      gap: spacing.md,
      zIndex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    quickJumpButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surfaceFloating,
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderRadius: borderRadius.pill,
      gap: 6,
    },
    quickJumpButtonText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.goldAccent,
    },
    titleGroup: {
      alignItems: 'flex-start',
    },
    title: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.xl,
      color: colors.textPrimary,
      textAlign: 'right',
    },
    subtitle: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'right',
    },
    countBadge: {
      backgroundColor: colors.surfaceFloating,
      borderWidth: 1,
      borderColor: colors.borderIridescent,
      borderRadius: borderRadius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      minHeight: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countBadgeText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.xs,
      color: colors.goldAccent,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    loadingText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    errorTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    errorSubtitle: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    retryButton: {
      backgroundColor: colors.primarySubtle,
      borderWidth: 1,
      borderColor: colors.primaryGlow,
      borderRadius: borderRadius.pill,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      minHeight: 44,
      minWidth: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    retryButtonText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.primary,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: 36,
    },
    listContentEmpty: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  });
