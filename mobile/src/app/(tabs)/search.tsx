import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BookOpen, ChevronLeft } from 'lucide-react-native';
import { useThemeColors, type ColorTheme, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SearchBar } from '@/components/common/SearchBar';
import { searchQuran, searchChapters } from '@/services/db/searchService';
import { SearchResult, Chapter } from '@/types/quran';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [matchedChapters, setMatchedChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeqRef = useRef(0);

  const executeSearch = useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (cleanText.length > 1) {
      const currentSeq = ++searchSeqRef.current;
      setIsLoading(true);
      try {
        const [verses, chapters] = await Promise.all([
          searchQuran(cleanText),
          searchChapters(cleanText, 3).catch(() => []),
        ]);
        if (searchSeqRef.current === currentSeq) {
          setResults(verses);
          setMatchedChapters(chapters);
        }
      } catch {
        if (searchSeqRef.current === currentSeq) {
          setResults([]);
          setMatchedChapters([]);
        }
      } finally {
        if (searchSeqRef.current === currentSeq) {
          setIsLoading(false);
        }
      }
    } else {
      searchSeqRef.current++;
      setResults([]);
      setMatchedChapters([]);
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (text: string, immediate = false) => {
      setQuery(text);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const cleanText = text.trim();
      if (cleanText.length <= 1) {
        searchSeqRef.current++;
        setResults([]);
        setMatchedChapters([]);
        setIsLoading(false);
        return;
      }

      if (immediate) {
        executeSearch(cleanText);
      } else {
        setIsLoading(true);
        debounceTimerRef.current = setTimeout(() => {
          executeSearch(cleanText);
        }, 250);
      }
    },
    [executeSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Synchronize route query param from Home screen or deep links
  useEffect(() => {
    if (params.q && typeof params.q === 'string' && params.q.trim().length > 0) {
      const initial = params.q.trim();
      setQuery(initial);
      handleSearch(initial, true);
    }
  }, [params.q, handleSearch]);

  const renderHeader = () => {
    if (matchedChapters.length === 0) return null;

    return (
      <View style={styles.chaptersSection}>
        <Text style={styles.sectionSubtitle}>سوره‌های منطبق ({matchedChapters.length})</Text>
        {matchedChapters.map((chapter) => (
          <TouchableOpacity
            key={`chap-${chapter.id}`}
            style={styles.chapterCard}
            onPress={() => router.push(`/surah/${chapter.id}` as any)}
            activeOpacity={0.75}
            testID={`search-chapter-${chapter.id}`}
          >
            <View style={styles.chapterIconWrapper}>
              <BookOpen size={18} color={colors.primary} />
            </View>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterNameFa}>سوره {chapter.name_fa}</Text>
              <Text style={styles.chapterDetails}>
                شماره {chapter.id} • {chapter.verses_count} آیه •{' '}
                {chapter.revelation_place === 'makkah' ? 'مکی' : 'مدنی'}
              </Text>
            </View>
            <View style={styles.chapterArabicWrapper}>
              <Text style={styles.chapterNameArabic}>{chapter.name_arabic}</Text>
              <ChevronLeft size={16} color={colors.textFaded} />
            </View>
          </TouchableOpacity>
        ))}
        {results.length > 0 && (
          <Text style={[styles.sectionSubtitle, { marginTop: spacing.md }]}>
            آیات منطبق ({results.length})
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AmbientGlow height={200} />
      <View style={styles.header}>
        <Text style={styles.title}>جستجوی هوشمند در قرآن</Text>
        <SearchBar
          testID="search-screen-search-bar"
          value={query}
          onChangeText={handleSearch}
          onSubmitEditing={() => handleSearch(query, true)}
          onClear={() => handleSearch('', true)}
          autoFocus={Boolean(params.q)}
          placeholder="جستجو در متن آیات، ترجمه فارسی یا کلمات..."
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.verse_key}
        contentContainerStyle={styles.resultsList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          query.trim().length > 1 ? (
            matchedChapters.length === 0 && !isLoading ? (
              <Text style={styles.emptyText}>موردی برای «{query}» یافت نشد.</Text>
            ) : null
          ) : (
            <Text style={styles.hintText}>عبارت مورد نظر خود را برای جستجوی فوری تایپ کنید.</Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() =>
              router.push(`/surah/${item.chapter_id}?verse=${item.verse_number}` as any)
            }
            activeOpacity={0.75}
            testID={`search-result-${item.verse_key}`}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.surahInfo}>
                {item.chapter_name_fa} • آیه {item.verse_number}
              </Text>
              <Text style={styles.verseKey}>{item.verse_key}</Text>
            </View>
            <Text style={styles.resultTranslation} numberOfLines={3}>
              {item.translation_fa}
            </Text>
          </TouchableOpacity>
        )}
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
      paddingBottom: spacing.md,
      gap: spacing.md,
    },
    title: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.xl,
      color: colors.textPrimary,
      textAlign: 'right',
    },
    resultsList: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 32,
      gap: spacing.sm,
    },
    chaptersSection: {
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.textMuted,
      textAlign: 'right',
      marginBottom: spacing.xs,
    },
    chapterCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    chapterIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.circle,
      backgroundColor: colors.primaryGlow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chapterInfo: {
      flex: 1,
      alignItems: 'flex-start',
    },
    chapterNameFa: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.textPrimary,
    },
    chapterDetails: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xxs,
      color: colors.textFaded,
      marginTop: 2,
    },
    chapterArabicWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    chapterNameArabic: {
      fontFamily: fonts.quranHafs,
      fontSize: 18,
      color: colors.goldAccent,
    },
    resultCard: {
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    surahInfo: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.xs,
      color: colors.primary,
    },
    verseKey: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
    },
    resultTranslation: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 22,
      textAlign: 'right',
    },
    emptyText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textFaded,
      textAlign: 'center',
      marginTop: 40,
    },
    hintText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textFaded,
      textAlign: 'center',
      marginTop: 40,
    },
  });
