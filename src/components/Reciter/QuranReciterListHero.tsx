import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuranReciterListHero.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconClose from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';

type QuranReciterListHeroProps = {
  searchQuery: string;
  onSearchQueryChange: (newSearchQuery: string) => void;
  activeFilter?: string;
  onFilterChange?: (newFilter: string) => void;
  availableCount?: number;
  totalCount?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const QuranReciterListHero: React.FC<QuranReciterListHeroProps> = ({
  onSearchQueryChange,
  searchQuery,
  activeFilter = 'all',
  onFilterChange,
  availableCount,
  totalCount,
  className,
  ...props
}) => {
  const { t } = useTranslation('reciter');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onSearchQueryChange('');
    inputRef.current?.focus();
  }, [onSearchQueryChange]);

  return (
    <div className={classNames(styles.outerContainer, className)} {...props}>
      <div className={styles.ambientGlow} />
      <div className={styles.innerContainer}>
        {/* Sanctuary Badge */}
        <div className={styles.greetingCapsule}>
          <div className={styles.greetingBadge}>
            <span className={styles.greetingPulse} />
            <span className={styles.greetingText}>{t('reciter:sanctuary-badge')}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className={styles.heroTitle}>{t('reciter:hero-title')}</h1>
        <p className={styles.heroSubtitle}>{t('reciter:hero-subtitle')}</p>

        {/* Search Command Bar */}
        <div className={styles.commandBarContainer}>
          <div
            className={styles.commandBar}
            onClick={() => inputRef.current?.focus()}
            role="search"
          >
            <div className={styles.searchIcon}>
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="text"
              id="reciter-search-input"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleClear();
                }
              }}
              placeholder={t('reciter:search-placeholder')}
              autoComplete="off"
              spellCheck="false"
              aria-label={t('reciter:search-placeholder')}
            />
            {searchQuery ? (
              <Button
                shape={ButtonShape.Circle}
                variant={ButtonVariant.Ghost}
                onClick={handleClear}
                className={styles.clearButton}
                ariaLabel={t('common:clear')}
              >
                <IconClose />
              </Button>
            ) : (
              <div className={styles.shortcutBadge} aria-hidden="true">
                ⌘K
              </div>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        {onFilterChange && (
          <div
            className={styles.filterPillsContainer}
            role="tablist"
            aria-label={t('reciter:filter-reciters-aria')}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'all'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'all',
              })}
              onClick={() => onFilterChange('all')}
            >
              {t('reciter:filter-all')}
              {totalCount !== undefined && <span className={styles.countBadge}>{totalCount}</span>}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'available'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'available',
              })}
              onClick={() => onFilterChange('available')}
            >
              <span className={styles.availableDot} />
              {t('reciter:filter-available')}
              {availableCount !== undefined && (
                <span className={styles.countBadge}>{availableCount}</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'murattal'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'murattal',
              })}
              onClick={() => onFilterChange('murattal')}
            >
              {t('reciter:filter-murattal')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'mujawwad'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'mujawwad',
              })}
              onClick={() => onFilterChange('mujawwad')}
            >
              {t('reciter:filter-mujawwad')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(QuranReciterListHero);
