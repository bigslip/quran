import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import SearchResultItem from './SearchResultItem';
import SearchResultsHeader from './SearchResultsHeader';

import Pagination from '@/dls/Pagination/Pagination';
import useScrollToTop from '@/hooks/useScrollToTop';
import SearchQuerySource from '@/types/SearchQuerySource';
import { toLocalizedNumber } from '@/utils/locale';
import { SearchResponse } from 'types/ApiResponses';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  searchResult: SearchResponse;
  searchQuery: string;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  source: SearchQuerySource;
}

const SearchResults: React.FC<Props> = ({
  searchResult,
  searchQuery,
  source,
  currentPage,
  onPageChange,
  pageSize,
  className,
  ...props
}) => {
  const results = searchResult.result.navigation.concat(searchResult.result.verses);
  const isSearchDrawer =
    source === SearchQuerySource.SearchDrawer || source === SearchQuerySource.SearchModal;
  const { t, lang } = useTranslation('common');
  const scrollToTop = useScrollToTop();

  const handlePageChange = (page: number) => {
    scrollToTop();
    onPageChange?.(page);
  };

  return (
    <div className={classNames(className)} {...props}>
      {isSearchDrawer ? (
        <SearchResultsHeader searchQuery={searchQuery} source={source} />
      ) : (
        <>
          {searchQuery && (
            <div role="status" aria-live="polite">
              {t('search-results', {
                count: toLocalizedNumber(searchResult.pagination.totalRecords, lang),
              })}
            </div>
          )}
        </>
      )}
      <>
        {results.map((result, index) => (
          <SearchResultItem
            key={`${result.key || index}-${index}`}
            result={result}
            source={source}
            service={searchResult.service}
          />
        ))}
      </>
      {!isSearchDrawer && !!searchQuery && (
        <Pagination
          currentPage={currentPage}
          totalCount={searchResult.pagination.totalRecords}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default SearchResults;
