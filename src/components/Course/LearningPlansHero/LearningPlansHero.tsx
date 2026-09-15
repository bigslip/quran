/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable max-lines */
import React, { useCallback, useRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './LearningPlansHero.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconClose from '@/icons/close.svg';
import SearchIcon from '@/icons/search.svg';

export type LearningPlansHeroProps = {
  searchQuery: string;
  onSearchQueryChange: (newSearchQuery: string) => void;
  activeFilter?: string;
  onFilterChange?: (newFilter: string) => void;
  totalCount?: number;
  isMyCourses?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const LearningPlansHero: React.FC<LearningPlansHeroProps> = ({
  onSearchQueryChange,
  searchQuery,
  activeFilter = 'all',
  onFilterChange,
  totalCount,
  isMyCourses = false,
  className,
  ...props
}) => {
  const { t } = useTranslation('learn');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onSearchQueryChange('');
    inputRef.current?.focus();
  }, [onSearchQueryChange]);

  return (
    <div className={classNames(styles.outerContainer, className)} {...props}>
      <div className={styles.ambientGlow} />
      <div className={styles.innerContainer}>
        {/* Sanctuary Status Capsule Badge */}
        <div className={styles.greetingCapsule}>
          <div className={styles.greetingBadge}>
            <span className={styles.greetingPulse} />
            <span className={styles.greetingText}>{t('learn:sanctuary-badge')}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className={styles.heroTitle}>
          {isMyCourses ? t('common:my-learning-plans') : t('learn:hero-title')}
        </h1>
        <p className={styles.heroSubtitle}>
          {isMyCourses ? t('learn:my-learning-plans-subtitle') : t('learn:hero-subtitle')}
        </p>

        {/* Synced Search Command Bar with Frosted Glassmorphism */}
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
              id="courses-search-input"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleClear();
                }
              }}
              placeholder={t('learn:search-placeholder')}
              autoComplete="off"
              spellCheck="false"
              aria-label={t('learn:search-placeholder')}
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

        {/* Filter Category Pills */}
        {onFilterChange && (
          <div
            className={styles.filterPillsContainer}
            role="tablist"
            aria-label={t('learn:filter-plans-aria')}
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
              {t('learn:filter-all')}
              {totalCount !== undefined && <span className={styles.countBadge}>{totalCount}</span>}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'tajweed'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'tajweed',
              })}
              onClick={() => onFilterChange('tajweed')}
            >
              {t('learn:filter-tajweed')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'tafsir'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'tafsir',
              })}
              onClick={() => onFilterChange('tafsir')}
            >
              {t('learn:filter-tafsir')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'arabic'}
              className={classNames(styles.filterPill, {
                [styles.activeFilterPill]: activeFilter === 'arabic',
              })}
              onClick={() => onFilterChange('arabic')}
            >
              {t('learn:filter-arabic')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(LearningPlansHero);
