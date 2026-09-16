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
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SearchBar } from '@/components/common/SearchBar';
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
  const flatListRef = useRef<FlatList<CatalogItem>>(null);
  const [activeTab, setActiveTab] = useState<CatalogTabId>('surah');
  const [query, setQuery] = useState('');
  const [surahs, setSurahs] = useState<Chapter[]>([]);
  const [revelationSurahs, setRevelationSurahs] = useState<Chapter[]>([]);
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadCatalogData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [allSurahs, allJuzs] = await Promise.all([
        getAllSurahs('id'),
        getAllJuzs(),
      ]);

      const sortedRev = [...allSurahs].sort(
        (a, b) => a.revelation_order - b.revelation_order
      );

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
    [router]
  );

  const handleJuzPress = useCallback(
    (juz: Juz) => {
      router.push(`/surah/${juz.first_chapter_id}` as any);
    },
    [router]
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
    [activeTab]
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
    [activeTab, handleSurahPress, handleJuzPress]
  );

  return (
    <View style={styles.container}>
      <AmbientGlow height={220} />

      {/* Sanctuary Header */}
      <View style={styles.header}>
        {/* Title row with sanctuary title and counter badge */}
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>فهرست قرآن</Text>
            <Text style={styles.subtitle}>سوره‌ها و جزءهای کلام‌الله مجید</Text>
          </View>

          <View
            style={styles.countBadge}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`تعداد: ${countBadgeText}`}
          >
            <Text style={styles.countBadgeText}>{countBadgeText}</Text>
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
        <CatalogTabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری فهرست قرآن...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>خطا در بارگذاری اطلاعات</Text>
          <Text style={styles.errorSubtitle}>امکان بارگذاری فهرست قرآن وجود ندارد</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadCatalogData}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="تلاش مجدد"
          >
            <Text style={styles.retryButtonText}>تلاش مجدد</Text>
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
          ListEmptyComponent={
            <CatalogEmptyState
              query={query}
              onClearQuery={() => setQuery('')}
            />
          }
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  titleGroup: {
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xl,
    fontWeight: '700',
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
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '700',
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
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
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
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
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
