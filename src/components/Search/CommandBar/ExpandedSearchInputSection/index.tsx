/* eslint-disable max-lines */
import React, { useCallback, useContext } from 'react';

import classNames from 'classnames';
import groupBy from 'lodash/groupBy';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import CommandsList, { Command, RESULTS_GROUP } from '../CommandsList';

import styles from './ExpandedSearchInputSection.module.scss';

import { getNewSearchResults } from '@/api';
import DataFetcher from '@/components/DataFetcher';
import DataContext from '@/contexts/DataContext';
import useDebounce from '@/hooks/useDebounce';
import { selectRecentNavigations } from '@/redux/slices/CommandBar/state';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import { makeNewSearchResultsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { toLocalizedNumber } from '@/utils/locale';
import { getQuickSearchQuery, getSearchNavigationResult } from '@/utils/search';
import { SearchResponse } from 'types/ApiResponses';

import Fuse from 'fuse.js';

interface Props {
  searchQuery?: string;
}

const DEBOUNCE_SEARCH_MS = 350;

const ExpandedSearchInputSection: React.FC<Props> = ({ searchQuery }) => {
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as string[];
  const { t, lang } = useTranslation('common');
  const recentNavigations = useSelector(
    selectRecentNavigations,
    areArraysEqual,
  ) as SearchNavigationResult[];
  const chaptersData = useContext(DataContext);
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCE_SEARCH_MS);

  const navigateToItems = React.useMemo(
    () => [
      {
        name: `${t('juz')} ${toLocalizedNumber(1, lang)}`,
        key: '1',
        resultType: SearchNavigationType.JUZ,
      },
      {
        name: `${t('page')} ${toLocalizedNumber(1, lang)}`,
        key: '1',
        resultType: SearchNavigationType.PAGE,
      },
      {
        name: `${t('surah')} ${chaptersData?.['36']?.transliteratedName || 'Yaseen'}`,
        key: '36',
        resultType: SearchNavigationType.SURAH,
      },
      {
        name: `${t('surah')} ${chaptersData?.['67']?.transliteratedName || 'Al-Mulk'}`,
        key: '67',
        resultType: SearchNavigationType.SURAH,
      },
      {
        name: t('quick-links:ayat-ul-kursi', { defaultValue: 'Ayatul Kursi' }),
        key: '2:255',
        resultType: SearchNavigationType.AYAH,
      },
    ],
    [t, lang, chaptersData],
  );

  // Convert chaptersData to array for Fuse
  const chaptersArray = React.useMemo(
    () => Object.entries(chaptersData || {}).map(([id, chapter]) => ({ ...chapter, id })),
    [chaptersData],
  );

  // Initialize Fuse instance
  const fuse = React.useMemo(
    () =>
      new Fuse(chaptersArray, {
        keys: ['transliteratedName', 'translatedName', 'nameArabic', 'nameSimple', 'nameComplex'],
        threshold: 0.3,
      }),
    [chaptersArray],
  );

  // Get Fuse matches based on searchQuery
  const fuseMatches = React.useMemo(() => {
    if (!searchQuery) return [];
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse]);

  /**
   * Generate an array of commands that will show in the pre-input view.
   * The function takes the original recentNavigations + navigateToItems and appends
   * to each the group name + which command is clearable and which is not. The group
   * will be used by {@see groupBy} to compose the list of commands for each group.
   *
   * @param {SearchNavigationResult[]} recentNavigations the history of the command bar navigations.
   * @returns {Command[]}
   */
  const getPreInputCommands = useCallback(
    (): Command[] =>
      recentNavigations
        .map((recentNavigation) => ({
          ...recentNavigation,
          group: t('command-bar.recent-navigations'),
          isClearable: true,
        }))
        .concat(
          navigateToItems.map((navigateToItem) => ({
            ...navigateToItem,
            group: t('command-bar.try-navigating'),
            isClearable: false,
          })),
        ),
    [recentNavigations, t, navigateToItems],
  );

  const quickSearchFetcher = useCallback(() => {
    return getNewSearchResults(
      getQuickSearchQuery(debouncedSearchQuery, 10, selectedTranslations),
    );
  }, [debouncedSearchQuery, selectedTranslations]);

  /**
   * This function will be used by DataFetcher and will run only when there is no API error
   * or the connections is offline. When we receive the response from DataFetcher,
   * the data can be:
   *
   * 1. empty: which means we are in the initial state where there is no searchQuery and
   *           in this case we want to show the recent navigations from Redux (if any) + suggestions
   *           on where to navigate to.
   * 2. not empty: and this means we called the API and we got the response. The response will
   *               either have results or not (in the case when there are no matches for
   *               the search query).
   */
  const dataFetcherRender = useCallback(
    (data: SearchResponse) => {
      let toBeGroupedCommands = [] as Command[];
      let numberOfCommands = 0;
      
      const hasFuseMatches = fuseMatches.length > 0;

      // if it's pre-input
      if (!searchQuery) {
        toBeGroupedCommands = getPreInputCommands();
        numberOfCommands = recentNavigations.length + navigateToItems.length;
      } else if (hasFuseMatches) {
        toBeGroupedCommands = fuseMatches.map((match) => ({
          key: match.id,
          resultType: SearchNavigationType.SURAH,
          name: `${t('common:surah')} ${match.transliteratedName}`,
          group: RESULTS_GROUP,
        }));
        numberOfCommands = toBeGroupedCommands.length;
      } else if (data && data.result.navigation.length) {
        toBeGroupedCommands = [
          ...data.result.navigation.map((navigationItem) => ({
            ...getSearchNavigationResult(chaptersData, navigationItem, t, lang),
            group: RESULTS_GROUP,
          })),
        ];
        numberOfCommands = data.result.navigation.length;
      } else if (data && !data.result.navigation.length) {
        // if there are no results, we will show the search page suggestion as an item
        toBeGroupedCommands = [
          {
            key: searchQuery,
            resultType: SearchNavigationType.SEARCH_PAGE,
            name: searchQuery,
            group: t('search.title'),
          },
        ];
        numberOfCommands = 1;
      }
      return (
        <CommandsList
          searchQuery={searchQuery}
          commandGroups={{
            groups: groupBy(
              toBeGroupedCommands.map((item, index) => ({ ...item, index })), // append the index so that it can be used for keyboard navigation.
              (item) => item.group, // we group by the group name that has been attached to each command.
            ),
            numberOfCommands, // this is needed so that we can know when we have reached the last command when using keyboard navigation across multiple groups
          }}
          resultItemClassName={styles.resultItem}
        />
      );
    },
    [chaptersData, getPreInputCommands, lang, recentNavigations.length, searchQuery, t, fuseMatches],
  );

  const shouldFetchApi = debouncedSearchQuery && fuseMatches.length === 0;

  return (
    <div className={styles.container}>
      <div className={classNames(styles.bodyContainer, { [styles.height]: !!searchQuery })}>
        {shouldFetchApi ? (
          <DataFetcher
            queryKey={makeNewSearchResultsUrl(
              getQuickSearchQuery(debouncedSearchQuery, 10, selectedTranslations),
            )}
            render={dataFetcherRender}
            fetcher={quickSearchFetcher}
          />
        ) : (
          dataFetcherRender(null)
        )}
      </div>
    </div>
  );
};

export default ExpandedSearchInputSection;
