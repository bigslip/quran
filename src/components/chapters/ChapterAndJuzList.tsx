/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useState, useMemo, useRef, useCallback } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Tabs from '../dls/Tabs/Tabs';

import styles from './ChapterAndJuzList.module.scss';
import ChapterAndJuzListSkeleton from './ChapterAndJuzListSkeleton';
import IslamicSanctuaryBoard from './IslamicSanctuaryBoard/IslamicSanctuaryBoard';

import CaretDownIcon from '@/icons/caret-down.svg';
import ClearIcon from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import Chapter from 'types/Chapter';

enum View {
  Surah = 'surah',
  Juz = 'juz',
  RevelationOrder = 'revelation_order',
}

export enum RevelationFilter {
  All = 'all',
  Makki = 'makkah',
  Madani = 'madinah',
}

const JuzView = dynamic(() => import('./JuzView'), {
  ssr: false,
  loading: () => <ChapterAndJuzListSkeleton />,
});

const MobilePopover = dynamic(() => import('@/dls/Popover/HoverablePopover'), {
  ssr: false,
});

const RevelationOrderView = dynamic(() => import('./RevelationOrderView'), {
  ssr: false,
  loading: () => <ChapterAndJuzListSkeleton />,
});

type ChapterAndJuzListProps = {
  chapters: Chapter[];
};

enum Sort {
  ASC = 'ascending',
  DESC = 'descending',
}

const MOST_VISITED_CHAPTERS = {
  1: true,
  2: true,
  3: true,
  4: true,
  18: true,
  32: true,
  36: true,
  55: true,
  56: true,
  67: true,
};

const DIACRITICS_REGEX = /[\u0300-\u036f]/g;
const SEPARATORS_REGEX = /[-_']/g;
const WHITESPACE_REGEX = /\s+/g;
const NUMERIC_REGEX = /^\d+$/;

interface SearchableChapter {
  chapter: Chapter;
  idNum: number;
  idStr: string;
  transliteratedNorm: string;
  transliteratedCompact: string;
  translatedNorm: string;
  translatedCompact: string;
  simpleNorm: string;
  complexNorm: string;
  slugNorm: string;
  arabicName: string;
  revelationPlace: string;
}

const isChapterMatch = (
  item: SearchableChapter,
  query: string,
  normalizedQuery: string,
  compactQuery: string,
  isNumeric: boolean,
  lang: string,
): boolean => {
  if (isNumeric && (item.idStr === query || item.idStr.startsWith(query))) {
    return true;
  }
  const localizedId = toLocalizedNumber(item.idNum, lang);
  if (localizedId.includes(query) || item.idStr.includes(query)) {
    return true;
  }
  if (
    item.transliteratedNorm.includes(normalizedQuery) ||
    item.transliteratedCompact.includes(compactQuery) ||
    item.translatedNorm.includes(normalizedQuery) ||
    item.translatedCompact.includes(compactQuery)
  ) {
    return true;
  }
  if (item.simpleNorm?.includes(normalizedQuery) || item.complexNorm?.includes(normalizedQuery)) {
    return true;
  }
  if (item.arabicName?.includes(query) || item.slugNorm?.includes(normalizedQuery)) {
    return true;
  }
  return false;
};

const normalizeSearchText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(SEPARATORS_REGEX, ' ')
    .replace(WHITESPACE_REGEX, ' ')
    .trim();

const ChapterAndJuzList: React.FC<ChapterAndJuzListProps> = ({
  chapters,
}: ChapterAndJuzListProps) => {
  const { t, lang } = useTranslation();
  const [view, setView] = useState(View.Surah);
  const [sortBy, setSortBy] = useState(Sort.ASC);
  const [searchQuery, setSearchQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>(RevelationFilter.All);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allCount = chapters.length;

  // Single combined loop for counts (js-combine-iterations)
  const { makkiCount, madaniCount } = useMemo(() => {
    let makki = 0;
    let madani = 0;
    for (let i = 0; i < chapters.length; i += 1) {
      if (chapters[i].revelationPlace === 'makkah') {
        makki += 1;
      } else if (chapters[i].revelationPlace === 'madinah') {
        madani += 1;
      }
    }
    return { makkiCount: makki, madaniCount: madani };
  }, [chapters]);

  // Pre-index normalized fields for search (js-index-maps, js-cache-function-results)
  const searchableChapters: SearchableChapter[] = useMemo(() => {
    return chapters.map((chapter) => {
      const transliterated = normalizeSearchText(chapter.transliteratedName || '');
      const translated = normalizeSearchText(
        typeof chapter.translatedName === 'string' ? chapter.translatedName : '',
      );
      return {
        chapter,
        idNum: Number(chapter.id),
        idStr: String(chapter.id),
        transliteratedNorm: transliterated,
        transliteratedCompact: transliterated.replace(WHITESPACE_REGEX, ''),
        translatedNorm: translated,
        translatedCompact: translated.replace(WHITESPACE_REGEX, ''),
        simpleNorm: chapter.nameSimple ? normalizeSearchText(chapter.nameSimple) : '',
        complexNorm: chapter.nameComplex ? normalizeSearchText(chapter.nameComplex) : '',
        slugNorm: chapter.slug ? normalizeSearchText(chapter.slug) : '',
        arabicName: chapter.nameArabic || '',
        revelationPlace: chapter.revelationPlace,
      };
    });
  }, [chapters]);

  const onSort = useCallback(() => {
    setSortBy((prevValue) => {
      const newValue = prevValue === Sort.DESC ? Sort.ASC : Sort.DESC;
      // eslint-disable-next-line i18next/no-literal-string
      logValueChange(`homepage_${view}_sorting`, prevValue, newValue);
      return newValue;
    });
  }, [view]);

  const tabs = useMemo(
    () => [
      { title: t(`common:${View.Surah}`), value: View.Surah },
      { title: t(`common:${View.Juz}`), value: View.Juz, id: 'juz-tab' },
      { title: t(`common:${View.RevelationOrder}`), value: View.RevelationOrder },
    ],
    [t],
  );

  const onTabSelected = useCallback((newView: string) => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`homepage_${newView}_tab`);
    setView(newView as View);
  }, []);

  const onRevelationFilterChange = useCallback((newFilter: RevelationFilter) => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`homepage_surah_filter_${newFilter}`);
    setRevelationFilter(newFilter);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setRevelationFilter(RevelationFilter.All);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const filteredChapters = useMemo(() => {
    const query = searchQuery.trim();
    const hasQuery = query.length > 0;
    const normalizedQuery = hasQuery ? normalizeSearchText(query) : '';
    const compactQuery = hasQuery ? normalizedQuery.replace(WHITESPACE_REGEX, '') : '';
    const isNumeric = hasQuery && NUMERIC_REGEX.test(query);

    const matched = searchableChapters
      .filter((item) => {
        if (
          revelationFilter !== RevelationFilter.All &&
          item.revelationPlace !== revelationFilter
        ) {
          return false;
        }
        if (
          hasQuery &&
          !isChapterMatch(item, query, normalizedQuery, compactQuery, isNumeric, lang)
        ) {
          return false;
        }
        return true;
      })
      .map((item) => item.chapter);

    // Sort chapters
    if (sortBy === Sort.DESC) {
      return matched.slice().sort((a, b) => Number(b.id) - Number(a.id));
    }
    return matched;
  }, [searchableChapters, revelationFilter, searchQuery, sortBy, lang]);

  return (
    <>
      <div className={styles.tabsContainer}>
        <Tabs className={styles.tabItem} tabs={tabs} selected={view} onSelect={onTabSelected} />
        <div className={styles.sorter}>
          <div className={styles.uppercase}>{t('common:sort.by')}:</div>
          <div
            className={styles.sortByValue}
            onClick={onSort}
            role="button"
            onKeyPress={onSort}
            tabIndex={0}
          >
            <span>{t(`common:sort.${sortBy}`)}</span>
            <span className={sortBy === Sort.ASC ? styles.rotate180 : ''}>
              <CaretDownIcon />
            </span>
          </div>
        </div>
        {view === View.RevelationOrder && (
          <div className={styles.revelationOrderDisclaimer}>
            <span>
              <Trans
                i18nKey="home:revelation-order-disclaimer"
                components={{
                  link: (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                    <a
                      href="https://tanzil.net/docs/revelation_order"
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                  // @ts-ignore
                  hover: <MobilePopover isContainerSpan content={t('common:pbuh')} />,
                }}
              />
            </span>
          </div>
        )}
      </div>

      {view === View.Surah && (
        <div className={styles.filterBar}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              ref={searchInputRef}
              type="search"
              className={styles.searchInput}
              placeholder={t('home:search-surah')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('home:search-surah')}
              data-testid="surah-search-input"
            />
            {searchQuery ? (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearSearch}
                aria-label={t('common:input.clear')}
                data-testid="clear-surah-search"
              >
                <ClearIcon />
              </button>
            ) : null}
          </div>
          <div className={styles.pillsContainer} role="group" aria-label="Surah filter">
            <button
              type="button"
              className={classNames(styles.filterPill, {
                [styles.activePill]: revelationFilter === RevelationFilter.All,
              })}
              onClick={() => onRevelationFilterChange(RevelationFilter.All)}
              aria-pressed={revelationFilter === RevelationFilter.All}
              data-testid="filter-pill-all"
            >
              {t('home:all-surahs', { count: toLocalizedNumber(allCount, lang) })}
            </button>
            <button
              type="button"
              className={classNames(styles.filterPill, {
                [styles.activePill]: revelationFilter === RevelationFilter.Makki,
              })}
              onClick={() => onRevelationFilterChange(RevelationFilter.Makki)}
              aria-pressed={revelationFilter === RevelationFilter.Makki}
              data-testid="filter-pill-makki"
            >
              {t('home:makki', { count: toLocalizedNumber(makkiCount, lang) })}
            </button>
            <button
              type="button"
              className={classNames(styles.filterPill, {
                [styles.activePill]: revelationFilter === RevelationFilter.Madani,
              })}
              onClick={() => onRevelationFilterChange(RevelationFilter.Madani)}
              aria-pressed={revelationFilter === RevelationFilter.Madani}
              data-testid="filter-pill-madani"
            >
              {t('home:madani', { count: toLocalizedNumber(madaniCount, lang) })}
            </button>
          </div>
        </div>
      )}

      {view === View.Surah && (
        <>
          {filteredChapters.length > 0 ? (
            <IslamicSanctuaryBoard
              chapters={filteredChapters}
              mostVisitedChapters={MOST_VISITED_CHAPTERS}
            />
          ) : (
            <div className={styles.emptyContainer} data-testid="no-surahs-found">
              <div className={styles.emptyIcon} aria-hidden="true">
                <SearchIcon />
              </div>
              <p className={styles.emptyTitle}>{t('home:no-surahs-found')}</p>
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleResetFilters}
                data-testid="reset-surah-filters"
              >
                {t('home:clear-filters')}
              </button>
            </div>
          )}
        </>
      )}

      {view === View.Juz && (
        <div data-testid="chapter-and-juz-list" className={styles.juzLayout}>
          <JuzView isDescending={sortBy === Sort.DESC} />
        </div>
      )}
      {view === View.RevelationOrder && (
        <div data-testid="chapter-and-juz-list" className={styles.surahLayout}>
          <RevelationOrderView isDescending={sortBy === Sort.DESC} chapters={chapters} />
        </div>
      )}
    </>
  );
};

export default React.memo(ChapterAndJuzList);
