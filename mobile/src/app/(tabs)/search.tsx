import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  colors as defaultColors,
  useThemeColors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SearchBar } from '@/components/common/SearchBar';
import { searchQuran } from '@/services/db/searchService';
import { SearchResult } from '@/types/quran';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length > 1) {
      try {
        const res = await searchQuran(text);
        setResults(res);
      } catch {
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow height={200} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>جستجوی هوشمند در قرآن</Text>
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          placeholder="جستجو در متن آیات، ترجمه فارسی یا کلمات..."
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.verse_key}
        contentContainerStyle={styles.resultsList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          query.length > 1 ? (
            <Text style={[styles.emptyText, { color: colors.textFaded }]}>
              موردی برای «{query}» یافت نشد.
            </Text>
          ) : (
            <Text style={[styles.hintText, { color: colors.textFaded }]}>
              عبارت مورد نظر خود را برای جستجوی فوری تایپ کنید.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.resultCard,
              { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
            ]}
            onPress={() =>
              router.push(`/surah/${item.chapter_id}?verse=${item.verse_number}` as any)
            }
            activeOpacity={0.75}
          >
            <View style={styles.resultHeader}>
              <Text style={[styles.surahInfo, { color: colors.primary }]}>
                {item.chapter_name_fa} • آیه {item.verse_number}
              </Text>
              <Text style={[styles.verseKey, { color: colors.textFaded }]}>{item.verse_key}</Text>
            </View>
            <Text
              style={[styles.resultTranslation, { color: colors.textSecondary }]}
              numberOfLines={3}
            >
              {item.translation_fa}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const colors = defaultColors;

const styles = StyleSheet.create({
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
