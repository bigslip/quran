import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Type, Eye, EyeOff, Play } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { Chapter, Verse } from '@/types/quran';
import { getSurahById } from '@/services/db/surahService';
import { getVersesByChapter } from '@/services/db/verseService';
import { useReadingStore } from '@/stores/useReadingStore';

export default function SurahReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapterId = Number(id) || 1;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    fontScale,
    setFontScale,
    showWordByWord,
    toggleWordByWord,
    setLastRead,
  } = useReadingStore();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const ch = await getSurahById(chapterId);
        const vs = await getVersesByChapter(chapterId, { includeWords: true });
        setChapter(ch);
        setVerses(vs);
        if (ch) {
          setLastRead(ch.id, 1, ch.name_fa);
        }
      } catch (err) {
        console.error('Failed to load Surah reader:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [chapterId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AmbientGlow height={180} />

      {/* Navigation Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarTitleBlock}>
          <Text style={styles.topBarSurahFa}>{chapter?.name_fa}</Text>
          <Text style={styles.topBarSurahMeta}>
            {chapter?.revelation_place === 'makkah' ? 'مکی' : 'مدنی'} • {chapter?.verses_count} آیه
          </Text>
        </View>

        {/* Quick Action Controls */}
        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={() => setFontScale(fontScale === 1.0 ? 1.3 : 1.0)}
            style={styles.actionIcon}
          >
            <Type size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleWordByWord} style={styles.actionIcon}>
            {showWordByWord ? (
              <Eye size={20} color={colors.primary} />
            ) : (
              <EyeOff size={20} color={colors.textFaded} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={verses}
        keyExtractor={(item) => item.verse_key}
        contentContainerStyle={styles.versesListContent}
        ListHeaderComponent={
          chapter?.bismillah_pre ? (
            <View style={styles.bismillahBanner}>
              <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.verseCard}>
            {/* Verse Header with Number */}
            <View style={styles.verseHeader}>
              <View style={styles.verseNumberBadge}>
                <Text style={styles.verseNumberText}>{item.verse_number}</Text>
              </View>
              <TouchableOpacity style={styles.playAyahBtn}>
                <Play size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Sacred Arabic Text */}
            <Text
              style={[
                styles.verseArabicText,
                { fontSize: fontSizes.quranTextDefault * fontScale },
              ]}
            >
              {item.text_uthmani}
            </Text>

            {/* Word by Word (if enabled) */}
            {showWordByWord && item.words && item.words.length > 0 && (
              <View style={styles.wbwContainer}>
                {item.words.map((w) => (
                  <View key={w.id} style={styles.wbwItem}>
                    <Text style={styles.wbwArabic}>{w.text_uthmani}</Text>
                    <Text style={styles.wbwFa}>{w.translation_fa || '—'}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Persian Translation */}
            {item.translation_fa_makarem ? (
              <Text style={styles.verseTranslationText}>
                {item.translation_fa_makarem}
              </Text>
            ) : null}
          </View>
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
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.backgroundElevated,
  },
  backButton: {
    padding: spacing.xs,
  },
  topBarTitleBlock: {
    alignItems: 'center',
  },
  topBarSurahFa: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSurahMeta: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    padding: spacing.xs,
  },
  bismillahBanner: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bismillahText: {
    fontFamily: fonts.quranHafs,
    fontSize: 24,
    color: colors.goldAccent,
    textAlign: 'center',
  },
  versesListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
    gap: spacing.md,
  },
  verseCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  verseNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderIridescent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumberText: {
    fontFamily: fonts.uiRegular,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  playAyahBtn: {
    padding: spacing.xs,
  },
  verseArabicText: {
    fontFamily: fonts.quranHafs,
    color: colors.textPrimary,
    textAlign: 'right',
    lineHeight: 52,
    marginBottom: spacing.md,
  },
  wbwContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  wbwItem: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  wbwArabic: {
    fontFamily: fonts.quranHafs,
    fontSize: 16,
    color: colors.textMuted,
  },
  wbwFa: {
    fontFamily: fonts.uiRegular,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verseTranslationText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'right',
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
    paddingTop: spacing.sm,
  },
});
