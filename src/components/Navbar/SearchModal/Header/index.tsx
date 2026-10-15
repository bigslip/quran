import React, { RefObject, useState, useEffect } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './Header.module.scss';

import VoiceSearch from '@/components/Search/VoiceSearch';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Separator from '@/dls/Separator/Separator';
import CloseIcon from '@/icons/close.svg';
import IconSearch from '@/icons/search.svg';
import checkSpeechRecognitionSupport from '@/utils/browser';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';

interface Props {
  isSearching: boolean;
  searchQuery: string;
  onSearchQueryChange: (event: React.FormEvent<HTMLInputElement>) => void;
  resetQueryAndResults: () => void;
  inputRef: RefObject<HTMLInputElement>;
  setSearchQuery: (query: string) => void;
  onMicError?: (error: Error) => void;
  onClose: () => void;
}

const SearchModalHeader: React.FC<Props> = ({
  onSearchQueryChange,
  resetQueryAndResults,
  inputRef,
  isSearching,
  searchQuery,
  setSearchQuery,
  onMicError,
  onClose,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsSpeechRecognitionSupported(checkSpeechRecognitionSupport());
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    if (searchQuery) {
      router.push(getSearchQueryNavigationUrl(searchQuery));
    }
  };

  const handleVoiceSearchError = (error: Error) => {
    if (onMicError) {
      onMicError(error);
    }
  };

  return (
    <div className={styles.headerContainer} data-testid="search-modal-header">
      <div className={styles.searchIcon}>
        <IconSearch />
      </div>
      <form onSubmit={onSubmit} className={styles.form}>
        <input
          className={styles.searchInput}
          type="search"
          enterKeyHint="search"
          ref={inputRef}
          dir="auto"
          placeholder={t('search.title')}
          onChange={onSearchQueryChange}
          value={searchQuery}
          disabled={isSearching}
          aria-label={t('search.title')}
        />
      </form>
      <div className={styles.actionsContainer}>
        {searchQuery && (
          <>
            <button
              type="button"
              className={styles.clear}
              onClick={resetQueryAndResults}
              aria-label={t('input.clear')}
            >
              {t('input.clear')}
            </button>
            <Separator isVertical className={styles.separator} />
          </>
        )}
        {isSpeechRecognitionSupported && (
          <VoiceSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputRef={inputRef}
            isInSearchDrawer
            onError={handleVoiceSearchError}
          />
        )}
        <div className={styles.closeButton}>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Ghost}
            shape={ButtonShape.Circle}
            onClick={onClose}
            ariaLabel={t('close')}
          >
            <CloseIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchModalHeader;
