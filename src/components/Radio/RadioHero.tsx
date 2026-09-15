import React, { useRef } from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './RadioHero.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconClose from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';

type RadioHeroProps = {
  searchQuery: string;
  onSearchQueryChange: (newSearchQuery: string) => void;
  activeFilter?: string;
  onFilterChange?: (newFilter: string) => void;
  availableCount?: number;
  totalCount?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const RadioHero: React.FC<RadioHeroProps> = ({
  onSearchQueryChange,
  searchQuery,
  activeFilter = 'all',
  onFilterChange,
  availableCount,
  totalCount,
  className,
  ...props
}) => {
  const { t } = useTranslation('radio');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onSearchQueryChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={classNames(styles.outerContainer, className)} {...props}>
      <div className={styles.ambientGlow} />
      <div className={styles.innerContainer}>
        {/* Sanctuary Badge */}
        <div className={styles.greetingCapsule}>
          <div className={styles.greetingBadge}>
            <span className={styles.greetingPulse} />
            <span className={styles.greetingText}>{t('radio:sanctuary-badge')}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className={styles.heroTitle}>{t('radio:hero-title')}</h1>
        <p className={styles.heroSubtitle}>{t('radio:hero-subtitle')}</p>

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
              id="radio-search-input"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder={t('radio:search-placeholder')}
              autoComplete="off"
              spellCheck="false"
              aria-label={t('radio:search-placeholder')}
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
              <div className={styles.shortcutBadge}>⌘K</div>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        {onFilterChange && (
          <div className={styles.filterPillsContainer} role="tablist" aria-label="Radio Station Filters">
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'all'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'all',
              })}
              onClick={() => onFilterChange('all')}
            >
              {t('radio:filter-all')}
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
              {t('radio:filter-available')}
              {availableCount !== undefined && (
                <span className={styles.countBadge}>{availableCount}</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'curated'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'curated',
              })}
              onClick={() => onFilterChange('curated')}
            >
              {t('radio:filter-curated')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'reciters'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'reciters',
              })}
              onClick={() => onFilterChange('reciters')}
            >
              {t('radio:filter-reciters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(RadioHero);
