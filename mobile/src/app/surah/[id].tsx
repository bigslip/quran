import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, BookOpen, AlignLeft, SlidersHorizontal } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import {
  SurahHeaderBanner,
  BismillahBanner,
  ContinuousVerseCard,
  MushafPageView,
  AudioPlaybackDock,
  ReaderSettingsModal,
} from '@/components/reader';
import { Chapter, Verse, Word } from '@/types/quran';
import { getSurahById } from '@/services/db/surahService';
import {
  getVersesByChapter,
  getVersesByPage,
  getPageWords,
} from '@/services/db/verseService';
import { useReadingStore } from '@/stores/useReadingStore';

export default function SurahReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapterId = Number(id) || 1;

  // Local state
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageVerses, setPageVerses] = useState<Verse[]>([]);
  const [pageWords, setPageWords] = useState<Word[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(new Set());

  // Zustand reading store
  const {
    viewMode,
    setViewMode,
    quranFont,
    setQuranFont,
    fontScale,
    setFontScale,
    showWordByWord,
    toggleWordByWord,
    showTranslation,
    toggleTranslation,
    activeTranslation,
    setActiveTranslation,
    activeVerseKey,
    setActiveVerseKey,
    isPlaying,
    setIsPlaying,
    setLastRead,
  } = useReadingStore();

  // Load Chapter & full chapter verses
  useEffect(() => {
    let isMounted = true;
    async function loadChapterData() {
      setLoading(true);
      try {
        const ch = await getSurahById(chapterId);
        const vs = await getVersesByChapter(chapterId, { includeWords: true });
        if (isMounted) {
          setChapter(ch);
          setVerses(vs);
          if (ch) {
            const startPage = ch.pages_start ?? 1;
            setCurrentPage(startPage);
            setLastRead(ch.id, 1, ch.name_fa);
          }
        }
      } catch (err) {
        console.error('Failed to load Surah reader:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadChapterData();
    return () => {
      isMounted = false;
    };
  }, [chapterId, setLastRead]);

  // Load Mushaf page verses & words when currentPage changes
  useEffect(() => {
    let isMounted = true;
    async function loadPageData() {
      try {
        const [pVerses, pWords] = await Promise.all([
          getVersesByPage(currentPage),
          getPageWords(currentPage),
        ]);
        if (isMounted) {
          setPageVerses(pVerses);
          setPageWords(pWords);
        }
      } catch (err) {
        console.error('Failed to load Mushaf page data:', err);
      }
    }
    loadPageData();
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  // View mode toggle handler
  const handleToggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'continuous' ? 'mushaf' : 'continuous');
  }, [viewMode, setViewMode]);

  // Audio Playback Flow Handlers
  const handlePlayVerse = useCallback(
    (verse: Verse) => {
      if (activeVerseKey === verse.verse_key && isPlaying) {
        setIsPlaying(false);
      } else {
        setActiveVerseKey(verse.verse_key);
        setIsPlaying(true);
        if (chapter) {
          setLastRead(verse.chapter_id, verse.verse_number, chapter.name_fa);
        }
      }
    },
    [activeVerseKey, isPlaying, chapter, setActiveVerseKey, setIsPlaying, setLastRead]
  );

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleNextAyah = useCallback(() => {
    if (isRepeating && activeVerseKey) {
      setIsPlaying(true);
      return;
    }
    if (!activeVerseKey || verses.length === 0) return;
    const currentIndex = verses.findIndex((v) => v.verse_key === activeVerseKey);
    if (currentIndex >= 0 && currentIndex < verses.length - 1) {
      const nextVerse = verses[currentIndex + 1];
      setActiveVerseKey(nextVerse.verse_key);
      setIsPlaying(true);
      if (chapter) {
        setLastRead(nextVerse.chapter_id, nextVerse.verse_number, chapter.name_fa);
      }
    }
  }, [isRepeating, activeVerseKey, verses, chapter, setActiveVerseKey, setIsPlaying, setLastRead]);

  const handlePrevAyah = useCallback(() => {
    if (!activeVerseKey || verses.length === 0) return;
    const currentIndex = verses.findIndex((v) => v.verse_key === activeVerseKey);
    if (currentIndex > 0) {
      const prevVerse = verses[currentIndex - 1];
      setActiveVerseKey(prevVerse.verse_key);
      setIsPlaying(true);
      if (chapter) {
        setLastRead(prevVerse.chapter_id, prevVerse.verse_number, chapter.name_fa);
      }
    }
  }, [activeVerseKey, verses, chapter, setActiveVerseKey, setIsPlaying, setLastRead]);

  const handleToggleRepeat = useCallback(() => {
    setIsRepeating((prev) => !prev);
  }, []);

  const handleCloseDock = useCallback(() => {
    setIsPlaying(false);
    setActiveVerseKey(null);
  }, [setIsPlaying, setActiveVerseKey]);

  // Verse action handlers
  const handleBookmarkVerse = useCallback((verse: Verse) => {
    setBookmarkedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(verse.verse_key)) {
        next.delete(verse.verse_key);
      } else {
        next.add(verse.verse_key);
      }
      return next;
    });
  }, []);

  const handleShareVerse = useCallback((verse: Verse) => {
    const textToShare = `${verse.text_uthmani}\n\n${verse.translation_fa_makarem || ''}\n(سوره ${verse.chapter_id}، آیه ${verse.verse_number})`;
    Share.share({ message: textToShare }).catch(() => {});
  }, []);

  const handleVerseInsights = useCallback((_verse: Verse) => {
    // Placeholder for verse insights / tadabbur drawer
  }, []);

  // Mushaf Page Navigation Handlers
  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(604, prev + 1));
  }, []);

  const handleVersePress = useCallback(
    (verseKey: string) => {
      setActiveVerseKey(verseKey);
      setIsPlaying(true);
      if (chapter) {
        const parts = verseKey.split(':');
        const chId = parseInt(parts[0], 10);
        const vNum = parseInt(parts[1], 10);
        if (!isNaN(chId) && !isNaN(vNum)) {
          setLastRead(chId, vNum, chapter.name_fa);
        }
      }
    },
    [chapter, setActiveVerseKey, setIsPlaying, setLastRead]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری سوره...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AmbientGlow height={180} />

      {/* Top Bar Navigation (RTL) */}
      <View style={styles.topBar}>
        {/* Back Button (>= 44x44px touch target) */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="بازگشت به فهرست سوره‌ها"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowRight size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Title Block: Persian Title & Arabic Calligraphy Subtitle */}
        <View style={styles.topBarTitleBlock}>
          <Text style={styles.topBarSurahFa} numberOfLines={1}>
            {chapter?.name_fa}
          </Text>
          <Text style={styles.topBarSurahArabic} numberOfLines={1}>
            {chapter?.name_arabic}
          </Text>
        </View>

        {/* Action Controls Toolbar: View Mode Toggle & Reader Settings */}
        <View style={styles.topBarActions}>
          {/* Dual-Mode Toggle Button (>= 44x44px touch target) */}
          <TouchableOpacity
            onPress={handleToggleViewMode}
            style={styles.navButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="تغییر حالت نمایش"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {viewMode === 'continuous' ? (
              <BookOpen size={20} color={colors.textSecondary} />
            ) : (
              <AlignLeft size={20} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Reader Settings Button (>= 44x44px touch target) */}
          <TouchableOpacity
            onPress={() => setIsSettingsOpen(true)}
            style={styles.navButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="تنظیمات مطالعه قرآن"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dual-Mode Content View */}
      {viewMode === 'continuous' ? (
        <FlatList
          data={verses}
          keyExtractor={(item) => item.verse_key}
          contentContainerStyle={[
            styles.versesListContent,
            activeVerseKey ? styles.versesListWithDock : null,
          ]}
          ListHeaderComponent={
            chapter ? (
              <View style={styles.listHeaderContainer}>
                <SurahHeaderBanner chapter={chapter} />
                <BismillahBanner
                  chapterId={chapter.id}
                  bismillahPre={Boolean(chapter.bismillah_pre)}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ContinuousVerseCard
              verse={item}
              isActivePlaying={activeVerseKey === item.verse_key && isPlaying}
              quranFont={quranFont}
              fontScale={fontScale}
              showWordByWord={showWordByWord}
              showTranslation={showTranslation}
              activeTranslation={activeTranslation}
              onPlayVerse={handlePlayVerse}
              onBookmarkVerse={handleBookmarkVerse}
              onShareVerse={handleShareVerse}
              onVerseInsights={handleVerseInsights}
              isBookmarked={bookmarkedKeys.has(item.verse_key)}
            />
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={[styles.mushafContainer, activeVerseKey ? styles.mushafWithDock : null]}>
          <MushafPageView
            pageNumber={currentPage}
            verses={pageVerses}
            words={pageWords}
            quranFont={quranFont}
            surahName={chapter?.name_fa}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onVersePress={handleVersePress}
          />
        </View>
      )}

      {/* Floating Audio Playback Dock */}
      {activeVerseKey && (
        <View style={styles.floatingDockWrapper}>
          <AudioPlaybackDock
            isPlaying={isPlaying}
            activeVerseKey={activeVerseKey}
            surahName={chapter?.name_fa}
            isRepeating={isRepeating}
            onPlayPause={handlePlayPause}
            onNextAyah={handleNextAyah}
            onPrevAyah={handlePrevAyah}
            onToggleRepeat={handleToggleRepeat}
            onCloseDock={handleCloseDock}
          />
        </View>
      )}

      {/* Reader Settings Drawer Modal */}
      <ReaderSettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        quranFont={quranFont}
        onChangeQuranFont={setQuranFont}
        activeTranslation={activeTranslation}
        onChangeActiveTranslation={setActiveTranslation}
        showWordByWord={showWordByWord}
        onToggleWordByWord={toggleWordByWord}
        showTranslation={showTranslation}
        onToggleShowTranslation={toggleTranslation}
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
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
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
    zIndex: 10,
  },
  navButton: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitleBlock: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  topBarSurahFa: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSurahArabic: {
    fontFamily: fonts.quranHafs,
    fontSize: fontSizes.sm,
    color: colors.goldAccent,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  listHeaderContainer: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  versesListContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 48,
    gap: spacing.md,
  },
  versesListWithDock: {
    paddingBottom: 110,
  },
  mushafContainer: {
    flex: 1,
    padding: spacing.md,
  },
  mushafWithDock: {
    paddingBottom: 90,
  },
  floatingDockWrapper: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
});
