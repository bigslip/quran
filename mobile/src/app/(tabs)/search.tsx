import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SearchBar } from '@/components/common/SearchBar';
import { searchQuran } from '@/services/db/searchService';
import { SearchResult } from '@/types/quran';

export default function SearchScreen() {
  const router = useRouter();
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
    <View style={styles.container}>
      <AmbientGlow height={200} />
      <View style={styles.header}>
        <Text style={styles.title}>جستجوی هوشمند در قرآن</Text>
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
            <Text style={styles.emptyText}>موردی برای «{query}» یافت نشد.</Text>
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
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xl,
    fontWeight: '700',
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
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '700',
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
