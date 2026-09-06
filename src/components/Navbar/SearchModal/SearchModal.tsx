/* eslint-disable max-lines */
import React, { RefObject, useCallback, useEffect, useMemo } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import SearchModalFooter from './Footer';
import SearchModalHeader from './Header';
import styles from './SearchModal.module.scss';

import { getNewSearchResults } from '@/api';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import { useToast } from '@/dls/Toast/Toast';
import useDebounce from '@/hooks/useDebounce';
import useFocus from '@/hooks/useFocusElement';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import useSearchWithVoice from '@/hooks/useSearchWithVoice';
import { selectMicrophoneActive } from '@/redux/slices/microphone';
import { selectNavbar, setIsSearchModalOpen, setLockVisibilityState } from '@/redux/slices/navbar';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { makeNewSearchResultsUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick, logTextSearchQuery } from '@/utils/eventLogger';
import { addToSearchHistory, getQuickSearchQuery } from '@/utils/search';
import { useHandleMicError } from '@/utils/voice-search-errors';
import { SearchResponse } from 'types/ApiResponses';

const SearchBodyContainer = dynamic(() => import('@/components/Search/SearchBodyContainer'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <Spinner />
    </div>
  ),
});

const DEBOUNCING_PERIOD_MS = 350;

const SearchModal: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch();

  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual) as string[];
  const [focusInput, searchInputRef]: [() => void, RefObject<HTMLInputElement>] = useFocus();
  const { searchQuery, setSearchQuery } = useSearchWithVoice('', true);

  const isOpen = useSelector(selectNavbar, shallowEqual).isSearchDrawerOpen;
  const isMicActive = useSelector(selectMicrophoneActive);

  // Debounce search query to avoid having to call the API on every keystroke
  const debouncedSearchQuery = useDebounce<string>(searchQuery, DEBOUNCING_PERIOD_MS);

  usePreventBodyScrolling(isOpen);

  // Handle microphone permission errors
  const handleMicError = useHandleMicError(toast, t);

  const onClose = useCallback(() => {
    dispatch(setIsSearchModalOpen(false));
  }, [dispatch]);

  // Once the modal is open, auto-focus input
  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  // Lock navbar visibility state when search modal is open
  useEffect(() => {
    if (isOpen) {
      dispatch(setLockVisibilityState(true));
    } else {
      dispatch(setLockVisibilityState(false));
    }
  }, [dispatch, isOpen]);

  // Close modal on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) {
        onClose();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, isOpen, onClose]);

  // Log search query when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      addToSearchHistory(dispatch, debouncedSearchQuery, SearchQuerySource.SearchModal);
      logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.SearchModal);
    }
  }, [debouncedSearchQuery, dispatch]);

  const resetQueryAndResults = useCallback(() => {
    logButtonClick('search_modal_clear_input');
    setSearchQuery('');
  }, [setSearchQuery]);

  const onSearchQueryChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>): void => {
      const newSearchQuery = event.currentTarget.value;
      if (!newSearchQuery) {
        resetQueryAndResults();
      } else {
        setSearchQuery(newSearchQuery);
      }
    },
    [resetQueryAndResults, setSearchQuery],
  );

  const onSearchKeywordClicked = useCallback(
    (keyword: string) => {
      const end = keyword.length;
      setSearchQuery(keyword);
      searchInputRef.current?.setSelectionRange(end, end);
      focusInput();
    },
    [setSearchQuery, searchInputRef, focusInput],
  );

  const quickSearchQuery = useMemo(() => {
    return getQuickSearchQuery(debouncedSearchQuery, 10, selectedTranslations);
  }, [debouncedSearchQuery, selectedTranslations]);

  const searchFetcher = useCallback(() => {
    if (!debouncedSearchQuery) return null;
    return getNewSearchResults(quickSearchQuery).then((response) => ({
      ...response,
      service: SearchService.KALIMAT,
    }));
  }, [debouncedSearchQuery, quickSearchQuery]);

  const renderSearchResults = useCallback(
    (searchResult: SearchResponse) => {
      return (
        <SearchBodyContainer
          onSearchKeywordClicked={onSearchKeywordClicked}
          searchQuery={searchQuery}
          searchResult={searchResult}
          isSearching={false}
          hasError={false}
          shouldSuggestFullSearchWhenNoResults
          source={SearchQuerySource.SearchModal}
        />
      );
    },
    [searchQuery, onSearchKeywordClicked],
  );

  const renderLoading = useCallback(() => {
    return (
      <SearchBodyContainer
        onSearchKeywordClicked={onSearchKeywordClicked}
        searchQuery={searchQuery}
        searchResult={null}
        isSearching
        hasError={false}
        shouldSuggestFullSearchWhenNoResults
        source={SearchQuerySource.SearchModal}
      />
    );
  }, [searchQuery, onSearchKeywordClicked]);

  const handlePointerDownOutside = useCallback(
    (event: CustomEvent<{ originalEvent: PointerEvent }>) => {
      if (isMicActive) {
        event.preventDefault();
        return;
      }
      onClose();
    },
    [isMicActive, onClose],
  );

  const handleInteractOutside = useCallback(
    (event: CustomEvent<{ originalEvent: FocusEvent | MouseEvent | TouchEvent }>) => {
      if (isMicActive) {
        event.preventDefault();
      }
    },
    [isMicActive],
  );

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      event.preventDefault();
      searchInputRef.current?.focus({ preventScroll: true });
    },
    [searchInputRef],
  );

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
          className={styles.content}
          onPointerDownOutside={handlePointerDownOutside}
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={onClose}
          onOpenAutoFocus={handleOpenAutoFocus}
          aria-describedby={undefined}
          data-testid="search-modal-container"
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>{t('search.title')}</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              {t('command-bar.spotlight-placeholder', {
                defaultValue: 'Search the Quran, Surahs, Ayahs, and Topics',
              })}
            </DialogPrimitive.Description>
          </VisuallyHidden>

          <SearchModalHeader
            onSearchQueryChange={onSearchQueryChange}
            resetQueryAndResults={resetQueryAndResults}
            inputRef={searchInputRef}
            isSearching={false}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onMicError={handleMicError}
            onClose={onClose}
          />

          <div className={styles.bodyContainer}>
            {isOpen && (
              <DataFetcher
                queryKey={debouncedSearchQuery ? makeNewSearchResultsUrl(quickSearchQuery) : null}
                render={renderSearchResults}
                fetcher={searchFetcher}
                loading={renderLoading}
              />
            )}
          </div>

          <SearchModalFooter searchQuery={searchQuery} onClose={onClose} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default SearchModal;
