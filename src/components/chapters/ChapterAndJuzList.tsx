/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useState, useMemo, useRef } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';
import Tabs from '../dls/Tabs/Tabs';

import styles from './ChapterAndJuzList.module.scss';
import ChapterAndJuzListSkeleton from './ChapterAndJuzListSkeleton';

import CaretDownIcon from '@/icons/caret-down.svg';
import ClearIcon from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
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

const normalizeSearchText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_']/g, ' ')
    .replace(/\s+/g, ' ')
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
  const makkiCount = useMemo(
    () => chapters.filter((c) => c.revelationPlace === 'makkah').length,
    [chapters],
  );
  const madaniCount = useMemo(
    () => chapters.filter((c) => c.revelationPlace === 'madinah').length,
    [chapters],
  );

  const onSort = () => {
    setSortBy((prevValue) => {
      const newValue = prevValue === Sort.DESC ? Sort.ASC : Sort.DESC;
      // eslint-disable-next-line i18next/no-literal-string
      logValueChange(`homepage_${view}_sorting`, prevValue, newValue);
      return newValue;
    });
  };

  const tabs = useMemo(
    () => [
      { title: t(`common:${View.Surah}`), value: View.Surah },
      { title: t(`common:${View.Juz}`), value: View.Juz, id: 'juz-tab' },
      { title: t(`common:${View.RevelationOrder}`), value: View.RevelationOrder },
    ],
    [t],
  );

  const onTabSelected = (newView) => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`homepage_${newView}_tab`);
    setView(newView as View);
  };

  const onRevelationFilterChange = (newFilter: RevelationFilter) => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`homepage_surah_filter_${newFilter}`);
    setRevelationFilter(newFilter);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRevelationFilter(RevelationFilter.All);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const filteredChapters = useMemo(() => {
    let result = chapters;

    // Filter by revelation place
    if (revelationFilter === RevelationFilter.Makki) {
      result = result.filter((chapter) => chapter.revelationPlace === 'makkah');
    } else if (revelationFilter === RevelationFilter.Madani) {
      result = result.filter((chapter) => chapter.revelationPlace === 'madinah');
    }

    // Filter by search query
    const query = searchQuery.trim();
    if (query) {
      const normalizedQuery = normalizeSearchText(query);
      const compactQuery = normalizedQuery.replace(/\s+/g, '');
      const isNumeric = /^\d+$/.test(query);

      result = result.filter((chapter) => {
        const chapterIdStr = String(chapter.id);
        if (isNumeric) {
          if (chapterIdStr === query || chapterIdStr.startsWith(query)) {
            return true;
          }
        }

        const localizedId = toLocalizedNumber(Number(chapter.id), lang);
        if (localizedId.includes(query)) {
          return true;
        }

        if (chapterIdStr.includes(query)) {
          return true;
        }

        const transliterated = normalizeSearchText(chapter.transliteratedName || '');
        const compactTransliterated = transliterated.replace(/\s+/g, '');
        if (
          transliterated.includes(normalizedQuery) ||
          compactTransliterated.includes(compactQuery)
        ) {
          return true;
        }

        const translated = normalizeSearchText(
          typeof chapter.translatedName === 'string' ? chapter.translatedName : '',
        );
        const compactTranslated = translated.replace(/\s+/g, '');
        if (
          translated.includes(normalizedQuery) ||
          compactTranslated.includes(compactQuery)
        ) {
          return true;
        }

        if (chapter.nameSimple) {
          const simple = normalizeSearchText(chapter.nameSimple);
          if (simple.includes(normalizedQuery)) return true;
        }

        if (chapter.nameComplex) {
          const complex = normalizeSearchText(chapter.nameComplex);
          if (complex.includes(normalizedQuery)) return true;
        }

        if (chapter.nameArabic && chapter.nameArabic.includes(query)) {
          return true;
        }

        if (chapter.slug && normalizeSearchText(chapter.slug).includes(normalizedQuery)) {
          return true;
        }

        return false;
      });
    }

    // Sort chapters
    return sortBy === Sort.DESC
      ? result.slice().sort((a, b) => Number(b.id) - Number(a.id))
      : result.slice().sort((a, b) => Number(a.id) - Number(b.id));
  }, [chapters, revelationFilter, searchQuery, sortBy, lang]);

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
            {searchQuery && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearSearch}
                aria-label={t('common:input.clear')}
                data-testid="clear-surah-search"
              >
                <ClearIcon />
              </button>
            )}
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
            <div data-testid="chapter-and-juz-list" className={styles.surahLayout}>
              {filteredChapters.map((chapter) => (
                <div
                  className={styles.chapterContainer}
                  key={chapter.id}
                  data-testid={`chapter-${chapter.id}-container`}
                >
                  <Link
                    href={`/${chapter.id}`}
                    shouldPrefetch={MOST_VISITED_CHAPTERS[Number(chapter.id)] === true}
                  >
                    <SurahPreviewRow
                      chapterId={Number(chapter.id)}
                      description={`${toLocalizedNumber(chapter.versesCount, lang)} ${t(
                        'common:ayahs',
                      )}`}
                      surahName={chapter.transliteratedName}
                      surahNumber={Number(chapter.id)}
                      translatedSurahName={chapter.translatedName as string}
                      revelationPlace={chapter.revelationPlace}
                      isMinimalLayout={shouldUseMinimalLayout(lang)}
                    />
                  </Link>
                </div>
              ))}
            </div>
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

export default ChapterAndJuzList;

