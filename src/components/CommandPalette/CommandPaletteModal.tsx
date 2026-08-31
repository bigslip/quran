/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import Fuse from 'fuse.js';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import CategoryTabs from './CategoryTabs';
import styles from './CommandPalette.module.scss';
import DirectJumpCard from './DirectJumpCard';
import FooterShortcuts from './FooterShortcuts';
import JuzItem from './JuzItem';
import PageItem from './PageItem';
import SurahItem from './SurahItem';
import { CommandPaletteTab, DirectAyahJumpResult, NavigationOption } from './types';
import { parseDirectAyahJump } from './utils/directJumpParser';

import VoiceSearch from '@/components/Search/VoiceSearch';
import { useToast } from '@/dls/Toast/Toast';
import useDebounce from '@/hooks/useDebounce';
import useFocus from '@/hooks/useFocusElement';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import useSearchWithVoice from '@/hooks/useSearchWithVoice';
import SearchIcon from '@/icons/search.svg';
import {
  selectNavbar,
  selectCommandPaletteTab,
  setCommandPaletteTab,
  setIsSearchDrawerOpen,
  setLockVisibilityState,
} from '@/redux/slices/navbar';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick, logEvent, logTextSearchQuery } from '@/utils/eventLogger';
import { getJuzIds } from '@/utils/juz';
import {
  getJuzNavigationUrl,
  getPageNavigationUrl,
  getSearchQueryNavigationUrl,
  getSurahNavigationUrl,
} from '@/utils/navigation';
import { addToSearchHistory } from '@/utils/search';
import { useHandleMicError } from '@/utils/voice-search-errors';
import DataContext from 'src/contexts/DataContext';
import Chapter from 'types/Chapter';

const DEBOUNCING_PERIOD_MS = 300;
const TOTAL_PAGES = 604;

const TAB_ORDER = [
  CommandPaletteTab.All,
  CommandPaletteTab.Surahs,
  CommandPaletteTab.Juz,
  CommandPaletteTab.Pages,
];

const CommandPaletteModal: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  const chaptersData = useContext(DataContext);

  const { isSearchDrawerOpen: isOpen } = useSelector(selectNavbar, shallowEqual);
  const reduxActiveTab = useSelector(selectCommandPaletteTab);
  const [activeTab, setActiveTab] = useState<CommandPaletteTab>(reduxActiveTab || CommandPaletteTab.All);

  const [focusInput, searchInputRef] = useFocus<HTMLInputElement>();
  const { searchQuery, setSearchQuery } = useSearchWithVoice('', true);
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeItemRef = useRef<HTMLLIElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  usePreventBodyScrolling(isOpen);

  // Sync Redux active tab when opened
  useEffect(() => {
    if (isOpen && reduxActiveTab) {
      setActiveTab(reduxActiveTab);
    }
  }, [isOpen, reduxActiveTab]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(setLockVisibilityState(true));
      const timeout = setTimeout(() => {
        focusInput();
      }, 50);
      return () => {
        clearTimeout(timeout);
        dispatch(setLockVisibilityState(false));
      };
    }
    return undefined;
  }, [isOpen, focusInput, dispatch]);

  // Log debounced search query
  useEffect(() => {
    if (debouncedSearchQuery && isOpen) {
      addToSearchHistory(dispatch, debouncedSearchQuery, SearchQuerySource.SearchDrawer);
      logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.SearchDrawer);
    }
  }, [debouncedSearchQuery, dispatch, isOpen]);

  // Handle mic errors
  const handleMicError = useHandleMicError(toast, t);

  // Close modal helper
  const closeModal = useCallback(() => {
    logEvent('command_palette_close');
    dispatch(setIsSearchDrawerOpen(false));
  }, [dispatch]);

  // Navigate and close modal helper
  const navigateTo = useCallback(
    (url: string) => {
      closeModal();
      router.push(url);
    },
    [closeModal, router],
  );

  // Chapters list array
  const chaptersList = useMemo(() => {
    if (!chaptersData) return [];
    return Object.keys(chaptersData).map((id) => ({
      ...chaptersData[id],
      id: Number(id),
    })) as Chapter[];
  }, [chaptersData]);

  // Direct Ayah jump calculation
  const directAyahJump: DirectAyahJumpResult | null = useMemo(() => {
    return parseDirectAyahJump(searchQuery, chaptersData);
  }, [searchQuery, chaptersData]);

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) {
      return chaptersList;
    }
    const query = searchQuery.trim();
    const fuse = new Fuse(chaptersList, {
      threshold: 0.3,
      keys: ['id', 'transliteratedName', 'translatedName', 'nameArabic', 'nameSimple'],
    });
    return fuse.search(query).map(({ item }) => item);
  }, [chaptersList, searchQuery]);

  // Juz list
  const juzList = useMemo(() => {
    const allJuz = getJuzIds(lang);
    if (!searchQuery.trim()) return allJuz;
    const query = searchQuery.trim().toLowerCase();
    return allJuz.filter(
      (juz) =>
        String(juz.value).includes(query) ||
        juz.label.toLowerCase().includes(query) ||
        `juz ${juz.value}`.includes(query),
    );
  }, [lang, searchQuery]);

  // Pages list
  const pagesList = useMemo(() => {
    const allPages = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);
    if (!searchQuery.trim()) return allPages;
    const query = searchQuery.trim().toLowerCase();
    return allPages.filter(
      (pageNum) =>
        String(pageNum).includes(query) ||
        `page ${pageNum}`.includes(query) ||
        `p ${pageNum}`.includes(query),
    );
  }, [searchQuery]);

  // Build unified navigation items for keyboard selection
  const currentNavigationItems: NavigationOption[] = useMemo(() => {
    const items: NavigationOption[] = [];

    // 1. Direct Ayah Jump takes top priority in any matching scenario
    if (directAyahJump) {
      items.push({
        id: `direct-jump-${directAyahJump.surahNumber}-${directAyahJump.verseNumber}`,
        type: 'direct_jump',
        title: `Surah ${directAyahJump.chapter.transliteratedName}, Ayah ${directAyahJump.verseNumber}`,
        subtitle: directAyahJump.famousName || directAyahJump.chapter.translatedName,
        url: directAyahJump.url,
        onSelect: () => navigateTo(directAyahJump.url),
      });
    }

    if (activeTab === CommandPaletteTab.All) {
      // Add matching Surahs
      filteredSurahs.slice(0, 8).forEach((chapter) => {
        const url = getSurahNavigationUrl(chapter.id);
        items.push({
          id: `surah-${chapter.id}`,
          type: 'surah',
          title: chapter.transliteratedName,
          subtitle: chapter.translatedName,
          chapterId: String(chapter.id),
          badge: chapter.id,
          url,
          onSelect: () => navigateTo(url),
        });
      });

      // If text query exists, add full search page jump
      if (searchQuery.trim()) {
        const searchUrl = getSearchQueryNavigationUrl(searchQuery.trim());
        items.push({
          id: `search-page-${searchQuery.trim()}`,
          type: 'search_page',
          title: `${t('search.title') || 'Search Quran for'}: "${searchQuery.trim()}"`,
          url: searchUrl,
          onSelect: () => navigateTo(searchUrl),
        });
      }
    } else if (activeTab === CommandPaletteTab.Surahs) {
      filteredSurahs.forEach((chapter) => {
        const url = getSurahNavigationUrl(chapter.id);
        items.push({
          id: `surah-${chapter.id}`,
          type: 'surah',
          title: chapter.transliteratedName,
          subtitle: chapter.translatedName,
          chapterId: String(chapter.id),
          badge: chapter.id,
          url,
          onSelect: () => navigateTo(url),
        });
      });
    } else if (activeTab === CommandPaletteTab.Juz) {
      juzList.forEach((juz) => {
        const url = getJuzNavigationUrl(juz.value);
        items.push({
          id: `juz-${juz.value}`,
          type: 'juz',
          title: `${t('juz') || 'Juz'} ${juz.label}`,
          badge: juz.value,
          url,
          onSelect: () => navigateTo(url),
        });
      });
    } else if (activeTab === CommandPaletteTab.Pages) {
      pagesList.slice(0, 100).forEach((pageNum) => {
        const url = getPageNavigationUrl(pageNum);
        items.push({
          id: `page-${pageNum}`,
          type: 'page',
          title: `${t('page') || 'Page'} ${pageNum}`,
          badge: pageNum,
          url,
          onSelect: () => navigateTo(url),
        });
      });
    }

    return items;
  }, [
    directAyahJump,
    activeTab,
    filteredSurahs,
    searchQuery,
    juzList,
    pagesList,
    navigateTo,
    t,
  ]);

  // Reset active index when tab, query, or item list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab, searchQuery]);

  // Scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  // Handle keyboard navigation
  const onArrowDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < currentNavigationItems.length - 1 ? prev + 1 : 0,
      );
    },
    [currentNavigationItems.length],
  );

  const onArrowUp = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : currentNavigationItems.length - 1,
      );
    },
    [currentNavigationItems.length],
  );

  const onEnter = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (currentNavigationItems[activeIndex]) {
        currentNavigationItems[activeIndex].onSelect();
      } else if (searchQuery.trim()) {
        navigateTo(getSearchQueryNavigationUrl(searchQuery.trim()));
      }
    },
    [currentNavigationItems, activeIndex, searchQuery, navigateTo],
  );

  const onTabKey = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      const currentIndex = TAB_ORDER.indexOf(activeTab);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length
        : (currentIndex + 1) % TAB_ORDER.length;
      const nextTab = TAB_ORDER[nextIndex];
      setActiveTab(nextTab);
      dispatch(setCommandPaletteTab(nextTab));
    },
    [activeTab, dispatch],
  );

  useHotkeys('down', onArrowDown, { enabled: isOpen, enableOnFormTags: ['INPUT'] }, [onArrowDown]);
  useHotkeys('up', onArrowUp, { enabled: isOpen, enableOnFormTags: ['INPUT'] }, [onArrowUp]);
  useHotkeys('enter', onEnter, { enabled: isOpen, enableOnFormTags: ['INPUT'] }, [onEnter]);
  useHotkeys('tab', onTabKey, { enabled: isOpen, enableOnFormTags: ['INPUT'] }, [onTabKey]);

  const handleTabSelect = (tab: CommandPaletteTab) => {
    setActiveTab(tab);
    dispatch(setCommandPaletteTab(tab));
  };

  const handleClearQuery = () => {
    logButtonClick('command_palette_clear_query');
    setSearchQuery('');
    focusInput();
  };

  if (!isOpen) return null;

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} onClick={closeModal} />
        <DialogPrimitive.Content
          data-testid="search-drawer-container"
          className={styles.content}
          aria-label="Unified Command Palette and Quick Navigation"
          onEscapeKeyDown={closeModal}
        >
          {/* Hidden title for accessible screen readers */}
          <DialogPrimitive.Title className="sr-only">
            Quran Command Palette and Quick Navigation
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search Quran text, jump directly to any Surah, Verse, Juz, or Page.
          </DialogPrimitive.Description>

          {/* Header */}
          <div className={styles.header} data-testid="search-drawer-header">
            <div className={styles.searchBarRow}>
              <span className={styles.searchIcon}>
                <SearchIcon />
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (currentNavigationItems[activeIndex]) {
                    currentNavigationItems[activeIndex].onSelect();
                  } else if (searchQuery.trim()) {
                    navigateTo(getSearchQueryNavigationUrl(searchQuery.trim()));
                  }
                }}
                className={styles.inputForm}
              >
                <input
                  ref={searchInputRef}
                  className={styles.searchInput}
                  type="search"
                  enterKeyHint="go"
                  dir="auto"
                  placeholder={
                    t('command-bar.search-placeholder') ||
                    'Search Quran, Surah (e.g. Kahf or 18), Verse (2:255), Juz, or Page...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  role="combobox"
                  aria-expanded="true"
                  aria-autocomplete="list"
                  aria-controls="command-palette-items-list"
                />
              </form>

              <div className={styles.actionsContainer}>
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={handleClearQuery}
                  >
                    {t('input.clear') || 'Clear'}
                  </button>
                )}
                <VoiceSearch
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  inputRef={searchInputRef}
                  isInSearchDrawer
                  onError={handleMicError}
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <CategoryTabs activeTab={activeTab} onSelectTab={handleTabSelect} />
          </div>

          {/* Body Content */}
          <div ref={listContainerRef} className={styles.bodyContainer}>
            {/* Direct Ayah Jump Banner */}
            {directAyahJump && (
              <DirectJumpCard
                result={directAyahJump}
                isActive={activeIndex === 0}
                onSelect={() => navigateTo(directAyahJump.url)}
              />
            )}

            {/* Items List */}
            {currentNavigationItems.length > 0 ? (
              <ul
                id="command-palette-items-list"
                role="listbox"
                className={styles.itemsList}
              >
                {activeTab === CommandPaletteTab.All && (
                  <>
                    <div className={styles.sectionHeader}>
                      <span>📖</span>
                      <span>{t('surahs') || 'Surahs'}</span>
                    </div>
                    {filteredSurahs.slice(0, 8).map((chapter) => {
                      const itemIndex = currentNavigationItems.findIndex(
                        (item) => item.id === `surah-${chapter.id}`,
                      );
                      const isItemActive = activeIndex === itemIndex;
                      const url = getSurahNavigationUrl(chapter.id);

                      return (
                        <SurahItem
                          key={chapter.id}
                          ref={isItemActive ? activeItemRef : null}
                          chapter={chapter}
                          isActive={isItemActive}
                          onSelect={() => navigateTo(url)}
                          onMouseEnter={() => {
                            if (itemIndex >= 0) setActiveIndex(itemIndex);
                          }}
                        />
                      );
                    })}
                  </>
                )}

                {activeTab === CommandPaletteTab.Surahs &&
                  filteredSurahs.map((chapter) => {
                    const itemIndex = currentNavigationItems.findIndex(
                      (item) => item.id === `surah-${chapter.id}`,
                    );
                    const isItemActive = activeIndex === itemIndex;
                    const url = getSurahNavigationUrl(chapter.id);

                    return (
                      <SurahItem
                        key={chapter.id}
                        ref={isItemActive ? activeItemRef : null}
                        chapter={chapter}
                        isActive={isItemActive}
                        onSelect={() => navigateTo(url)}
                        onMouseEnter={() => {
                          if (itemIndex >= 0) setActiveIndex(itemIndex);
                        }}
                      />
                    );
                  })}

                {activeTab === CommandPaletteTab.Juz &&
                  juzList.map((juz) => {
                    const itemIndex = currentNavigationItems.findIndex(
                      (item) => item.id === `juz-${juz.value}`,
                    );
                    const isItemActive = activeIndex === itemIndex;
                    const url = getJuzNavigationUrl(juz.value);

                    return (
                      <JuzItem
                        key={juz.value}
                        ref={isItemActive ? activeItemRef : null}
                        juzNumber={juz.value}
                        isActive={isItemActive}
                        onSelect={() => navigateTo(url)}
                        onMouseEnter={() => {
                          if (itemIndex >= 0) setActiveIndex(itemIndex);
                        }}
                      />
                    );
                  })}

                {activeTab === CommandPaletteTab.Pages &&
                  pagesList.slice(0, 100).map((pageNum) => {
                    const itemIndex = currentNavigationItems.findIndex(
                      (item) => item.id === `page-${pageNum}`,
                    );
                    const isItemActive = activeIndex === itemIndex;
                    const url = getPageNavigationUrl(pageNum);

                    return (
                      <PageItem
                        key={pageNum}
                        ref={isItemActive ? activeItemRef : null}
                        pageNumber={pageNum}
                        isActive={isItemActive}
                        onSelect={() => navigateTo(url)}
                        onMouseEnter={() => {
                          if (itemIndex >= 0) setActiveIndex(itemIndex);
                        }}
                      />
                    );
                  })}
              </ul>
            ) : (
              <div className={styles.noResults}>
                <p>{t('command-bar.no-nav-results') || 'No results found.'}</p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Hint */}
          <FooterShortcuts />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CommandPaletteModal;
