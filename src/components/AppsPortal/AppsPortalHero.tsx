import React, { useCallback, useEffect, useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './AppsPortalHero.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconClose from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';

export interface AppFilterChip {
  label: string;
  value: string;
  count?: number;
}

export type AppsPortalHeroProps = {
  searchQuery: string;
  onSearchQueryChange: (newSearchQuery: string) => void;
  activeFilter?: string;
  onFilterChange?: (newFilter: string) => void;
  filters?: AppFilterChip[];
} & React.HTMLAttributes<HTMLDivElement>;

const AppsPortalHero: React.FC<AppsPortalHeroProps> = ({
  searchQuery,
  onSearchQueryChange,
  activeFilter = 'all',
  onFilterChange,
  filters = [],
  className,
  ...props
}) => {
  const { t } = useTranslation('app-portal');
  const { t: tCommon } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onSearchQueryChange('');
    inputRef.current?.focus();
  }, [onSearchQueryChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={classNames(styles.outerContainer, className)} {...props}>
      <div className={styles.ambientGlow} />
      <div className={styles.innerContainer}>
        {/* Sanctuary Badge */}
        <div className={styles.greetingCapsule}>
          <div className={styles.greetingBadge}>
            <span className={styles.greetingPulse} />
            <span className={styles.greetingText}>{t('sanctuary-badge')}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
        <p className={styles.heroSubtitle}>{t('hero.description')}</p>

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
              id="apps-search-input"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleClear();
                }
              }}
              placeholder={t('search-placeholder')}
              autoComplete="off"
              spellCheck="false"
              aria-label={t('search-placeholder')}
            />
            {searchQuery ? (
              <Button
                shape={ButtonShape.Circle}
                variant={ButtonVariant.Ghost}
                onClick={handleClear}
                className={styles.clearButton}
                ariaLabel={tCommon('clear')}
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

        {/* Category Filter Pills */}
        {filters.length > 0 && onFilterChange && (
          <div
            className={styles.filterPillsContainer}
            role="tablist"
            aria-label={t('filter-apps-aria')}
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.value}
                className={classNames(styles.filterPill, {
                  [styles.activeFilterPill]: activeFilter === filter.value,
                })}
                onClick={() => onFilterChange(filter.value)}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span className={styles.countBadge}>{filter.count}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AppsPortalHero);
