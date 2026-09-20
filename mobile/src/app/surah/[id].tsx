import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import {
  ArrowRight,
  BookOpen,
  AlignLeft,
  SlidersHorizontal,
  Compass,
  ChevronDown,
} from 'lucide-react-native';
import { fonts, fontSizes, spacing, borderRadius, rtlRow, useAppTheme } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import {
  SurahHeaderBanner,
  BismillahBanner,
  ContinuousVerseCard,
  MushafPageView,
  AudioPlaybackDock,
  ReaderSettingsModal,
  parseVerseParam,
  formatSurahTitleFa,
} from '@/components/reader';
import { toPersianDigits } from '@/components/catalog';
import { AyahInsightsDrawer } from '../../components/insights';
import { QuickJumpModal, QuickJumpTabId } from '@/components/navigation';
import { Chapter, Verse, Word } from '@/types/quran';
import { JumpDestination } from '@/services/db/quickJumpContracts';
import { getSurahById } from '@/services/db/surahService';
import { getVersesByChapter, getVersesByPage, getPageWords } from '@/services/db/verseService';
import { useReadingStore } from '@/stores/useReadingStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { audioPlayerService } from '@/services/audio/audioPlayerService';
import { DEFAULT_RECITER_ID } from '@/services/audio/reciterService';
import { computeTopBarGeometry, createScrollDeltaAccumulator } from '@/utils/scrollAutoHide';

export default function SurahReaderScreen() {
  const router = useRouter();
  const { theme, colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { topBarPaddingTop, topBarHeight } = computeTopBarGeometry(insets.top);
  const { id, verse } = useLocalSearchParams<{ id: string; verse?: string }>();
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
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  const [selectedInsightVerse, setSelectedInsightVerse] = useState<Verse | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState<boolean>(false);
  const [quickJumpInitialTab, setQuickJumpInitialTab] = useState<QuickJumpTabId>('surah_ayah');
  const flatListRef = React.useRef<FlatList<Verse>>(null);
  const handledVerseRef = React.useRef<string | null>(null);

  // Auto-hiding top bar animation & visibility state
  const navAnim = useRef(new Animated.Value(0)).current;
  const layoutAnim = useRef(new Animated.Value(0)).current;
  const isNavBarVisibleRef = useRef(true);
  const [isNavBarInteractive, setIsNavBarInteractive] = useState(true);

  const navTranslateY = navAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -topBarHeight],
  });

  const navOpacity = navAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const mushafPaddingTop = layoutAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [topBarHeight, Math.max(insets.top, spacing.xs)],
  });

  const hideNavBar = useCallback(() => {
    if (!isNavBarVisibleRef.current) return;
    isNavBarVisibleRef.current = false;
    setIsNavBarInteractive(false);
    Animated.parallel([
      Animated.timing(navAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(layoutAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, [navAnim, layoutAnim]);

  const showNavBar = useCallback(() => {
    if (isNavBarVisibleRef.current) return;
    isNavBarVisibleRef.current = true;
    setIsNavBarInteractive(true);
    Animated.parallel([
      Animated.timing(navAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(layoutAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, [navAnim, layoutAnim]);

  const handleToggleNavBar = useCallback(() => {
    if (isNavBarVisibleRef.current) {
      hideNavBar();
    } else {
      showNavBar();
    }
  }, [hideNavBar, showNavBar]);

  // Track user drag interaction to prevent auto-scrolling from fighting manual user reading
  const isUserInteractingRef = useRef(false);
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jumpHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollAccumulatorRef = useRef(createScrollDeltaAccumulator());

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = e.nativeEvent.contentOffset.y;
      const action = scrollAccumulatorRef.current.processScroll(
        currentY,
        isUserInteractingRef.current,
        topBarHeight,
        isNavBarVisibleRef.current,
      );
      if (action === 'hide') {
        hideNavBar();
      } else if (action === 'show') {
        showNavBar();
      }
    },
    [topBarHeight, hideNavBar, showNavBar],
  );

  // Ensure top navigation bar is visible whenever an overlay/drawer/modal opens
  useEffect(() => {
    if (isSettingsOpen || isQuickJumpOpen || isInsightsOpen) {
      showNavBar();
    }
  }, [isSettingsOpen, isQuickJumpOpen, isInsightsOpen, showNavBar]);

  // Bookmark store
  const { bookmarkedKeys, toggleBookmark, loadBookmarks } = useBookmarkStore();

  // Load user bookmarks on mount
  useEffect(() => {
    if (bookmarkedKeys.size === 0) {
      loadBookmarks();
    }
  }, [bookmarkedKeys.size, loadBookmarks]);

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
    selectedReciterId,
    setSelectedReciterId,
    selectedTranslationIds,
    toggleSelectedTranslationId,
    wordByWordLocale,
    setWordByWordLocale,
    wordByWordDisplay,
    setWordByWordDisplay,
    wordByWordContentType,
    setWordByWordContentType,
  } = useReadingStore();

  // Load Chapter & full chapter verses
  useEffect(() => {
    let isMounted = true;
    async function loadChapterData() {
      setLoading(true);
      verseLayoutsRef.current.clear();
      lastScrolledVerseKeyRef.current = null;
      handledVerseRef.current = null;
      try {
        const ch = await getSurahById(chapterId);
        const vs = await getVersesByChapter(chapterId, { includeWords: true });
        if (isMounted) {
          setChapter(ch);
          setVerses(vs);
          if (ch) {
            const targetVerseNum = parseVerseParam(verse);
            const targetVerse = targetVerseNum
              ? vs.find((v) => v.verse_number === targetVerseNum)
              : null;

            if (targetVerse && targetVerse.page_number) {
              setCurrentPage(targetVerse.page_number);
              setLastRead(ch.id, targetVerse.verse_number, ch.name_fa);
            } else {
              const startPage = ch.pages_start ?? 1;
              setCurrentPage(startPage);
              setLastRead(ch.id, 1, ch.name_fa);
            }
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
  }, [chapterId, verse, setLastRead]);

  // Handle verse deep-linking auto-scroll and highlight aura in continuous mode
  useEffect(() => {
    if (!loading && verse && verses.length > 0) {
      const targetVerseNum = parseVerseParam(verse);
      if (targetVerseNum && targetVerseNum > 0) {
        const targetKey = `${chapterId}:${targetVerseNum}`;
        if (handledVerseRef.current === targetKey) {
          return;
        }
        handledVerseRef.current = targetKey;
        const targetIndex = verses.findIndex((v) => v.verse_number === targetVerseNum);

        if (targetIndex >= 0) {
          if (viewMode === 'continuous') {
            setHighlightedVerseKey(targetKey);
            const scrollTimer = setTimeout(() => {
              try {
                flatListRef.current?.scrollToIndex({
                  index: targetIndex,
                  animated: true,
                  viewPosition: 0,
                  viewOffset: topBarHeight,
                });
              } catch {}
            }, 160);

            const highlightTimer = setTimeout(() => {
              setHighlightedVerseKey(null);
            }, 2500);

            return () => {
              clearTimeout(scrollTimer);
              clearTimeout(highlightTimer);
            };
          } else {
            const targetVerse = verses[targetIndex];
            if (targetVerse?.page_number) {
              setCurrentPage(targetVerse.page_number);
            }
          }
        }
      }
    }
  }, [loading, verse, verses, viewMode, chapterId, topBarHeight]);

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

  // View mode toggle handler with active verse page synchronization
  const handleToggleViewMode = useCallback(() => {
    showNavBar();
    scrollAccumulatorRef.current.reset(0);
    if (viewMode === 'continuous' && activeVerseKey) {
      const activeVerse = verses.find((v) => v.verse_key === activeVerseKey);
      if (activeVerse && activeVerse.page_number) {
        setCurrentPage(activeVerse.page_number);
      }
    }
    setViewMode(viewMode === 'continuous' ? 'mushaf' : 'continuous');
  }, [showNavBar, viewMode, activeVerseKey, verses, setViewMode]);

  // Sync references to latest state to avoid stale closures in audio onFinish callbacks
  const versesRef = React.useRef(verses);
  versesRef.current = verses;

  const chapterRef = React.useRef(chapter);
  chapterRef.current = chapter;

  const isRepeatingRef = React.useRef(isRepeating);
  isRepeatingRef.current = isRepeating;

  const activeVerseKeyRef = React.useRef(activeVerseKey);
  activeVerseKeyRef.current = activeVerseKey;

  const isPlayingRef = React.useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const verseLayoutsRef = React.useRef<Map<string, { y: number; height: number; index: number }>>(
    new Map(),
  );
  const lastScrolledVerseKeyRef = React.useRef<string | null>(null);

  // Unload audio on unmount
  useEffect(() => {
    return () => {
      audioPlayerService.stop();
    };
  }, []);

  // Keep screen awake while audio is actively reciting
  useEffect(() => {
    if (isPlaying) {
      activateKeepAwakeAsync('quran-audio-recitation').catch(() => {});
    } else {
      deactivateKeepAwake('quran-audio-recitation').catch(() => {});
    }
    return () => {
      deactivateKeepAwake('quran-audio-recitation').catch(() => {});
    };
  }, [isPlaying]);

  // Exact cell renderer that registers layout coordinates and handles immediate scroll alignment
  const CellRenderer = useCallback(
    ({ children, index, item, style, onLayout, ...restProps }: any) => {
      return (
        <View
          {...restProps}
          style={style}
          onLayout={(e) => {
            onLayout?.(e);
            if (item?.verse_key) {
              const layout = {
                y: e.nativeEvent.layout.y,
                height: e.nativeEvent.layout.height,
                index,
              };
              verseLayoutsRef.current.set(item.verse_key, layout);

              // If this item is the currently reciting verse and hasn't been scrolled to yet
              if (
                isPlayingRef.current &&
                activeVerseKeyRef.current === item.verse_key &&
                lastScrolledVerseKeyRef.current !== item.verse_key
              ) {
                lastScrolledVerseKeyRef.current = item.verse_key;
                flatListRef.current?.scrollToOffset({
                  offset: Math.max(0, layout.y - topBarHeight - spacing.sm),
                  animated: true,
                });
              }
            }
          }}
        >
          {children}
        </View>
      );
    },
    [topBarHeight],
  );

  // Auto-scroll to currently reciting verse in continuous reading mode with exact measured offset
  useEffect(() => {
    if (viewMode === 'continuous' && activeVerseKey && isPlaying && !isUserInteractingRef.current) {
      const layout = verseLayoutsRef.current.get(activeVerseKey);
      if (layout) {
        lastScrolledVerseKeyRef.current = activeVerseKey;
        flatListRef.current?.scrollToOffset({
          offset: Math.max(0, layout.y - topBarHeight - spacing.sm),
          animated: true,
        });
      } else {
        const activeIndex = verses.findIndex((v) => v.verse_key === activeVerseKey);
        if (activeIndex >= 0 && flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({
              index: activeIndex,
              animated: true,
              viewPosition: 0,
              viewOffset: topBarHeight,
            });
          } catch {
            // Handled by onScrollToIndexFailed fallback
          }
        }
      }
    }
  }, [activeVerseKey, isPlaying, viewMode, verses, topBarHeight]);

  // Core audio playback executor
  const playAyahAudio = useCallback(
    async (verseKey: string) => {
      const parts = verseKey.split(':');
      const chId = parseInt(parts[0], 10);
      const vNum = parseInt(parts[1], 10);
      if (isNaN(chId) || isNaN(vNum)) return;

      const reciterId = selectedReciterId || DEFAULT_RECITER_ID;

      await audioPlayerService.playVerse(
        reciterId,
        chId,
        vNum,
        () => {
          // Callback when the active verse finishes reciting
          if (isRepeatingRef.current) {
            playAyahAudio(verseKey);
          } else {
            const currentVerses = versesRef.current;
            const idx = currentVerses.findIndex((v) => v.verse_key === verseKey);
            if (idx >= 0 && idx < currentVerses.length - 1) {
              const nextVerse = currentVerses[idx + 1];
              lastScrolledVerseKeyRef.current = null;
              setActiveVerseKey(nextVerse.verse_key);
              setIsPlaying(true);
              if (nextVerse.page_number) {
                setCurrentPage(nextVerse.page_number);
              }
              if (chapterRef.current) {
                setLastRead(
                  nextVerse.chapter_id,
                  nextVerse.verse_number,
                  chapterRef.current.name_fa,
                );
              }
              playAyahAudio(nextVerse.verse_key);
            } else {
              setIsPlaying(false);
              setActiveVerseKey(null);
            }
          }
        },
        (error) => {
          console.error('[SurahReader] Audio playback error:', error);
          setIsPlaying(false);
        },
      );
    },
    [selectedReciterId, setActiveVerseKey, setIsPlaying, setLastRead],
  );

  // Synchronize audio stream when reciter changes during active playback
  const currentReciterIdRef = React.useRef(selectedReciterId);
  useEffect(() => {
    if (currentReciterIdRef.current !== selectedReciterId) {
      currentReciterIdRef.current = selectedReciterId;
      if (isPlaying && activeVerseKey) {
        playAyahAudio(activeVerseKey);
      }
    }
  }, [selectedReciterId, isPlaying, activeVerseKey, playAyahAudio]);

  // Clean up user scroll and jump highlight timeouts on unmount
  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      if (jumpHighlightTimeoutRef.current) {
        clearTimeout(jumpHighlightTimeoutRef.current);
      }
    };
  }, []);

  // Invalidate cached cell layout coordinates when reading typography or translation settings change
  useEffect(() => {
    verseLayoutsRef.current.clear();
    lastScrolledVerseKeyRef.current = null;
  }, [fontScale, quranFont, showWordByWord, showTranslation, selectedTranslationIds]);

  // Audio Playback Flow Handlers with stable callback identity
  const handlePlayVerse = useCallback(
    async (verse: Verse) => {
      const currentActiveKey = activeVerseKeyRef.current;
      const currentPlaying = isPlayingRef.current;

      if (currentActiveKey === verse.verse_key && currentPlaying) {
        await audioPlayerService.pause();
        setIsPlaying(false);
      } else if (currentActiveKey === verse.verse_key && !currentPlaying) {
        await audioPlayerService.resume();
        setIsPlaying(true);
      } else {
        lastScrolledVerseKeyRef.current = null;
        setActiveVerseKey(verse.verse_key);
        setIsPlaying(true);
        if (verse.page_number) {
          setCurrentPage(verse.page_number);
        }
        if (chapterRef.current) {
          setLastRead(verse.chapter_id, verse.verse_number, chapterRef.current.name_fa);
        }
        await playAyahAudio(verse.verse_key);
      }
    },
    [setActiveVerseKey, setIsPlaying, setLastRead, playAyahAudio],
  );

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      await audioPlayerService.pause();
      setIsPlaying(false);
    } else {
      if (activeVerseKey) {
        await audioPlayerService.resume();
        setIsPlaying(true);
      } else if (verses.length > 0) {
        lastScrolledVerseKeyRef.current = null;
        const firstVerse = verses[0];
        setActiveVerseKey(firstVerse.verse_key);
        setIsPlaying(true);
        if (firstVerse.page_number) {
          setCurrentPage(firstVerse.page_number);
        }
        if (chapter) {
          setLastRead(firstVerse.chapter_id, firstVerse.verse_number, chapter.name_fa);
        }
        await playAyahAudio(firstVerse.verse_key);
      }
    }
  }, [
    isPlaying,
    activeVerseKey,
    verses,
    chapter,
    setIsPlaying,
    setActiveVerseKey,
    setLastRead,
    playAyahAudio,
  ]);

  const handleNextAyah = useCallback(async () => {
    if (isRepeating && activeVerseKey) {
      await playAyahAudio(activeVerseKey);
      return;
    }
    if (!activeVerseKey || verses.length === 0) return;
    const currentIndex = verses.findIndex((v) => v.verse_key === activeVerseKey);
    if (currentIndex >= 0 && currentIndex < verses.length - 1) {
      const nextVerse = verses[currentIndex + 1];
      lastScrolledVerseKeyRef.current = null;
      setActiveVerseKey(nextVerse.verse_key);
      setIsPlaying(true);
      if (nextVerse.page_number) {
        setCurrentPage(nextVerse.page_number);
      }
      if (chapter) {
        setLastRead(nextVerse.chapter_id, nextVerse.verse_number, chapter.name_fa);
      }
      await playAyahAudio(nextVerse.verse_key);
    }
  }, [
    isRepeating,
    activeVerseKey,
    verses,
    chapter,
    setActiveVerseKey,
    setIsPlaying,
    setLastRead,
    playAyahAudio,
  ]);

  const handlePrevAyah = useCallback(async () => {
    if (!activeVerseKey || verses.length === 0) return;
    const currentIndex = verses.findIndex((v) => v.verse_key === activeVerseKey);
    if (currentIndex > 0) {
      const prevVerse = verses[currentIndex - 1];
      lastScrolledVerseKeyRef.current = null;
      setActiveVerseKey(prevVerse.verse_key);
      setIsPlaying(true);
      if (prevVerse.page_number) {
        setCurrentPage(prevVerse.page_number);
      }
      if (chapter) {
        setLastRead(prevVerse.chapter_id, prevVerse.verse_number, chapter.name_fa);
      }
      await playAyahAudio(prevVerse.verse_key);
    }
  }, [
    activeVerseKey,
    verses,
    chapter,
    setActiveVerseKey,
    setIsPlaying,
    setLastRead,
    playAyahAudio,
  ]);

  const handleToggleRepeat = useCallback(() => {
    setIsRepeating((prev) => !prev);
  }, []);

  const handleCloseDock = useCallback(async () => {
    lastScrolledVerseKeyRef.current = null;
    await audioPlayerService.stop();
    setIsPlaying(false);
    setActiveVerseKey(null);
  }, [setIsPlaying, setActiveVerseKey]);

  // Verse action handlers
  const handleBookmarkVerse = useCallback(
    (verseItem: Verse) => {
      toggleBookmark({
        verse_key: verseItem.verse_key,
        chapter_id: verseItem.chapter_id || chapterId,
        verse_number: verseItem.verse_number,
      });
    },
    [toggleBookmark, chapterId],
  );

  const handleShareVerse = useCallback((verse: Verse) => {
    const textToShare = `${verse.text_uthmani}\n\n${verse.translation_fa_makarem || ''}\n(سوره ${
      verse.chapter_id
    }، آیه ${verse.verse_number})`;
    Share.share({ message: textToShare }).catch(() => {});
  }, []);

  const handleVerseInsights = useCallback((verse: Verse) => {
    setSelectedInsightVerse(verse);
    setIsInsightsOpen(true);
  }, []);

  const handleCloseInsights = useCallback(() => {
    setIsInsightsOpen(false);
    setSelectedInsightVerse(null);
  }, []);

  // Mushaf Page Navigation Handlers
  const handlePrevPage = useCallback(() => {
    scrollAccumulatorRef.current.reset(0);
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    scrollAccumulatorRef.current.reset(0);
    setCurrentPage((prev) => Math.min(604, prev + 1));
  }, []);

  const handleVersePress = useCallback(
    async (verseKey: string) => {
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
      await playAyahAudio(verseKey);
    },
    [chapter, setActiveVerseKey, setIsPlaying, setLastRead, playAyahAudio],
  );

  const handleJumpToDestination = useCallback(
    (destination: JumpDestination) => {
      setIsQuickJumpOpen(false);
      if (destination.chapterId === chapterId) {
        // Same Surah: in-place jump
        router.setParams({ verse: String(destination.verseNumber) });
        handledVerseRef.current = destination.verseKey;
        if (viewMode === 'continuous') {
          const targetIndex = verses.findIndex((v) => v.verse_number === destination.verseNumber);
          if (targetIndex >= 0) {
            setHighlightedVerseKey(destination.verseKey);
            try {
              flatListRef.current?.scrollToIndex({
                index: targetIndex,
                animated: true,
                viewPosition: 0,
                viewOffset: topBarHeight,
              });
            } catch {}
            if (jumpHighlightTimeoutRef.current) {
              clearTimeout(jumpHighlightTimeoutRef.current);
            }
            jumpHighlightTimeoutRef.current = setTimeout(() => {
              setHighlightedVerseKey(null);
              jumpHighlightTimeoutRef.current = null;
            }, 2500);
          }
        } else {
          setCurrentPage(destination.pageNumber);
          setActiveVerseKey(destination.verseKey);
        }
        if (chapter) {
          setLastRead(chapter.id, destination.verseNumber, chapter.name_fa);
        }
      } else {
        // Different Surah: route transition
        router.push(
          `/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}` as any,
        );
      }
    },
    [chapterId, chapter, verses, viewMode, router, setLastRead, setActiveVerseKey, topBarHeight],
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          در حال بارگذاری سوره...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow height={180} />

      {/* Top Bar Navigation (RTL) */}
      <Animated.View
        style={[
          styles.topBar,
          {
            paddingTop: topBarPaddingTop,
            backgroundColor: colors.backgroundElevated,
            borderBottomColor: colors.borderSubtle,
            transform: [{ translateY: navTranslateY }],
            opacity: navOpacity,
          },
        ]}
        pointerEvents={isNavBarInteractive ? 'auto' : 'none'}
        aria-hidden={!isNavBarInteractive}
        accessibilityElementsHidden={!isNavBarInteractive}
        importantForAccessibility={isNavBarInteractive ? 'auto' : 'no-hide-descendants'}
      >
        {/* Leading Action (RTL: Back Button) - balanced width */}
        <View style={styles.topBarLeading}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.navButton,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="بازگشت به فهرست سوره‌ها"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowRight size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Centerpiece: Interactive Sanctuary Quick Jump Navigation Pill */}
        <TouchableOpacity
          style={[
            styles.topBarTitlePill,
            {
              backgroundColor: colors.surfaceFloating,
              borderColor: colors.borderSubtle,
            },
          ]}
          onPress={() => {
            setQuickJumpInitialTab('surah_ayah');
            setIsQuickJumpOpen(true);
          }}
          activeOpacity={0.7}
          testID="reader-quick-jump-button"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="پرش سریع به سوره، آیه یا صفحه"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {/* Primary Row: Compass + Persian Surah Title + Dropdown Chevron */}
          <View style={styles.topBarTitleRow}>
            <Compass size={13} color={colors.primaryLight} style={styles.pillCompass} />
            <Text style={[styles.topBarSurahFa, { color: colors.textPrimary }]} numberOfLines={1}>
              {formatSurahTitleFa(chapter?.name_fa)}
            </Text>
            <ChevronDown size={13} color={colors.goldAccent} style={styles.pillChevron} />
          </View>

          {/* Subtitle Row: Sacred Arabic calligraphy & Revelation metadata */}
          <View style={styles.topBarSubtitleRow}>
            <Text
              style={[styles.topBarSurahArabic, { color: colors.goldAccent }]}
              numberOfLines={1}
            >
              {chapter?.name_arabic}
            </Text>
            <Text style={[styles.topBarSurahMetaDivider, { color: colors.textMuted }]}>•</Text>
            <Text
              style={[styles.topBarSurahMetaText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {toPersianDigits(chapter?.id || 1)} (
              {chapter?.revelation_place === 'makkah' ? 'مکی' : 'مدنی'})
            </Text>
          </View>
        </TouchableOpacity>

        {/* Trailing Controls Toolbar (RTL): Dual-Mode Toggle & Settings */}
        <View style={styles.topBarActions}>
          {/* Dual-Mode Toggle Button (>= 44x44px touch target) */}
          <TouchableOpacity
            onPress={handleToggleViewMode}
            style={[
              styles.navButton,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
            ]}
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
            style={[
              styles.navButton,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="تنظیمات مطالعه قرآن"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Dual-Mode Content View */}
      {viewMode === 'continuous' ? (
        <FlatList
          ref={flatListRef}
          data={verses}
          keyExtractor={(item) => item.verse_key}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.versesListContent,
            { backgroundColor: colors.background, paddingTop: topBarHeight + spacing.xs },
            activeVerseKey ? styles.versesListWithDock : null,
          ]}
          CellRendererComponent={CellRenderer}
          onScrollToIndexFailed={(info) => {
            if (flatListRef.current && info.index >= 0 && info.index < verses.length) {
              const estimatedOffset = Math.max(0, (info.averageItemLength || 120) * info.index);
              flatListRef.current.scrollToOffset({
                offset: estimatedOffset,
                animated: true,
              });
              setTimeout(() => {
                try {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                    viewPosition: 0,
                    viewOffset: topBarHeight,
                  });
                } catch {
                  // Ignore index errors if layout is not ready
                }
              }, 120);
            }
          }}
          ListHeaderComponent={
            chapter ? (
              <View style={styles.listHeaderContainer}>
                <SurahHeaderBanner chapter={chapter} theme={theme} />
                <BismillahBanner
                  chapterId={chapter.id}
                  bismillahPre={Boolean(chapter.bismillah_pre)}
                  theme={theme}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ContinuousVerseCard
              verse={item}
              theme={theme}
              isActivePlaying={activeVerseKey === item.verse_key && isPlaying}
              isHighlighted={highlightedVerseKey === item.verse_key}
              quranFont={quranFont}
              fontScale={fontScale}
              showWordByWord={showWordByWord}
              wordByWordLocale={wordByWordLocale}
              showTranslation={showTranslation}
              activeTranslation={activeTranslation}
              selectedTranslationIds={selectedTranslationIds}
              onPlayVerse={handlePlayVerse}
              onBookmarkVerse={handleBookmarkVerse}
              onToggleBookmark={handleBookmarkVerse}
              onShareVerse={handleShareVerse}
              onVerseInsights={handleVerseInsights}
              isBookmarked={bookmarkedKeys.has(item.verse_key)}
            />
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            isUserInteractingRef.current = true;
            if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
          }}
          onScrollEndDrag={() => {
            if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
            userScrollTimeoutRef.current = setTimeout(() => {
              isUserInteractingRef.current = false;
            }, 3000);
          }}
          onMomentumScrollEnd={() => {
            if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
            userScrollTimeoutRef.current = setTimeout(() => {
              isUserInteractingRef.current = false;
            }, 3000);
          }}
        />
      ) : (
        <Animated.View
          style={[
            styles.mushafContainer,
            { backgroundColor: colors.background, paddingTop: mushafPaddingTop },
            activeVerseKey ? styles.mushafWithDock : null,
          ]}
        >
          <MushafPageView
            pageNumber={currentPage}
            verses={pageVerses}
            words={pageWords}
            theme={theme}
            quranFont={quranFont}
            fontScale={fontScale}
            surahName={chapter?.name_fa}
            activeVerseKey={activeVerseKey}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onVersePress={handleVersePress}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              isUserInteractingRef.current = true;
              if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
            }}
            onScrollEndDrag={() => {
              if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
              userScrollTimeoutRef.current = setTimeout(() => {
                isUserInteractingRef.current = false;
              }, 3000);
            }}
            onMomentumScrollEnd={() => {
              if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
              userScrollTimeoutRef.current = setTimeout(() => {
                isUserInteractingRef.current = false;
              }, 3000);
            }}
            onPressPage={handleToggleNavBar}
          />
        </Animated.View>
      )}

      {/* Floating Audio Playback Dock */}
      {activeVerseKey && (
        <View style={styles.floatingDockWrapper}>
          <AudioPlaybackDock
            isPlaying={isPlaying}
            activeVerseKey={activeVerseKey}
            surahName={chapter?.name_fa}
            selectedReciterId={selectedReciterId}
            isRepeating={isRepeating}
            theme={theme}
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
        theme={theme}
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
        selectedReciterId={selectedReciterId}
        onSelectReciter={setSelectedReciterId}
        selectedTranslationIds={selectedTranslationIds}
        onToggleTranslation={toggleSelectedTranslationId}
        wordByWordLocale={wordByWordLocale}
        onChangeWordByWordLocale={setWordByWordLocale}
        wordByWordDisplay={wordByWordDisplay}
        onChangeWordByWordDisplay={setWordByWordDisplay}
        wordByWordContentType={wordByWordContentType}
        onChangeWordByWordContentType={setWordByWordContentType}
      />

      {/* Ayah Insights & Tadabbur Drawer */}
      <AyahInsightsDrawer
        visible={isInsightsOpen}
        verse={selectedInsightVerse}
        chapterNameFa={chapter?.name_fa}
        onClose={handleCloseInsights}
        onPlayVerse={handlePlayVerse}
        onBookmarkVerse={handleBookmarkVerse}
        onToggleBookmark={handleBookmarkVerse}
        isBookmarked={
          selectedInsightVerse ? bookmarkedKeys.has(selectedInsightVerse.verse_key) : false
        }
        quranFont={quranFont}
        testID="ayah-insights-drawer"
      />

      {/* Universal Go To Quick Jump Modal */}
      <QuickJumpModal
        visible={isQuickJumpOpen}
        onClose={() => setIsQuickJumpOpen(false)}
        onJump={handleJumpToDestination}
        initialChapterId={chapterId}
        initialVerseNumber={parseVerseParam(verse) || 1}
        initialPageNumber={currentPage}
        initialTab={quickJumpInitialTab}
        testID="reader-quick-jump-modal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  topBarLeading: {
    minWidth: 96,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  navButton: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: borderRadius.circle,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitlePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 44,
  },
  topBarTitleRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  pillCompass: {
    opacity: 0.9,
  },
  pillChevron: {
    opacity: 0.85,
    marginTop: 1,
  },
  topBarSurahFa: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.md - 1,
  },
  topBarSubtitleRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 1,
  },
  topBarSurahArabic: {
    fontFamily: fonts.quranHafs,
    fontSize: 16,
    lineHeight: 20,
  },
  topBarSurahMetaDivider: {
    fontSize: 10,
    marginHorizontal: 1,
  },
  topBarSurahMetaText: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.xs,
  },
  topBarActions: {
    minWidth: 96,
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  listHeaderContainer: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  versesListContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 48,
    gap: spacing.md,
  },
  versesListWithDock: {
    paddingBottom: 110,
  },
  mushafContainer: {
    flex: 1,
    padding: spacing.xs,
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
