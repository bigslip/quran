import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { SearchBar } from '@/components/common/SearchBar';
import { Chapter } from '@/types/quran';
import { getAllSurahs } from '@/services/db/surahService';

export default function SurahsScreen() {
  const router = useRouter();
  const [surahs, setSurahs] = useState<Chapter[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getAllSurahs().then(setSurahs).catch(() => {});
  }, []);

  const filteredSurahs = surahs.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.name_fa.toLowerCase().includes(q) ||
      s.name_arabic.includes(q) ||
      s.name_simple.toLowerCase().includes(q) ||
      String(s.id).includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <AmbientGlow height={200} />
      <View style={styles.header}>
        <Text style={styles.title}>فهرست سوره‌ها</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="جستجوی سوره بر اساس نام یا شماره..."
        />
      </View>

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.surahRow}
            activeOpacity={0.7}
            onPress={() => router.push(`/surah/${item.id}` as any)}
          >
            <View style={styles.surahArabicBlock}>
              <Text style={styles.surahArabicName}>{item.name_arabic}</Text>
              <Text style={styles.ayahCount}>{item.verses_count} آیه</Text>
            </View>

            <View style={styles.surahDetailsBlock}>
              <Text style={styles.surahFaName}>{item.name_fa}</Text>
              <Text style={styles.revelationPlace}>
                {item.revelation_place === 'makkah' ? 'مکی' : 'مدنی'} • ترتیب نزول: {item.revelation_order}
              </Text>
            </View>

            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{item.id}</Text>
            </View>
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
    gap: spacing.sm,
  },
  surahRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  surahArabicBlock: {
    alignItems: 'flex-start',
  },
  surahArabicName: {
    fontFamily: fonts.quranHafs,
    fontSize: 20,
    color: colors.goldAccent,
  },
  ayahCount: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    color: colors.textFaded,
    marginTop: 2,
  },
  surahDetailsBlock: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: spacing.md,
  },
  surahFaName: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  revelationPlace: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
  },
});
