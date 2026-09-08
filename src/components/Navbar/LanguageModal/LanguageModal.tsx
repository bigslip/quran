import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './LanguageModal.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useLanguageChange from '@/hooks/useLanguageChange';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import CheckIcon from '@/icons/check.svg';
import CloseIcon from '@/icons/close.svg';
import IconGlobe from '@/icons/globe.svg';
import IconSearch from '@/icons/search.svg';
import {
  selectIsLanguageModalOpen,
  setIsLanguageModalOpen,
  setLockVisibilityState,
} from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';
import i18nConfig from '../../../../i18n.json';

const { locales } = i18nConfig;

const LOCALE_ENGLISH_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'Arabic',
  bn: 'Bengali',
  fa: 'Persian',
  fr: 'French',
  id: 'Indonesian',
  it: 'Italian',
  nl: 'Dutch',
  pt: 'Portuguese',
  ru: 'Russian',
  sq: 'Albanian',
  th: 'Thai',
  tr: 'Turkish',
  ur: 'Urdu',
  zh: 'Chinese',
  ms: 'Malay',
  es: 'Spanish',
  sw: 'Swahili',
  vi: 'Vietnamese',
};

const LanguageModal: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const router = useRouter();
  const isOpen = useSelector(selectIsLanguageModalOpen, shallowEqual);
  const { isChangingLanguage, changingLocale, onLanguageChange } = useLanguageChange();
  const [searchFilter, setSearchFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  usePreventBodyScrolling(isOpen);

  const onClose = useCallback(() => {
    logButtonClick('language_modal_close');
    dispatch(setIsLanguageModalOpen(false));
    setSearchFilter('');
  }, [dispatch]);

  // Lock navbar visibility while modal is open
  useEffect(() => {
    if (isOpen) {
      dispatch(setLockVisibilityState(true));
    } else {
      dispatch(setLockVisibilityState(false));
    }
  }, [isOpen, dispatch]);

  // Close modal when route changes
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

  const handleLanguageSelect = useCallback(
    async (locale: string) => {
      if (locale === lang) {
        onClose();
        return;
      }
      logButtonClick(`language_modal_select_${locale}`);
      await onLanguageChange(locale, onClose);
    },
    [lang, onLanguageChange, onClose],
  );

  const filteredLocales = useMemo(() => {
    if (!searchFilter.trim()) return locales;
    const normalizedFilter = searchFilter.trim().toLowerCase();
    return locales.filter((locale) => {
      const nativeName = getLocaleName(locale).toLowerCase();
      const englishName = (LOCALE_ENGLISH_NAMES[locale] || '').toLowerCase();
      return (
        nativeName.includes(normalizedFilter) ||
        englishName.includes(normalizedFilter) ||
        locale.toLowerCase().includes(normalizedFilter)
      );
    });
  }, [searchFilter]);

  const handleOpenAutoFocus = useCallback((event: Event) => {
    event.preventDefault();
    searchInputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
          className={styles.content}
          onEscapeKeyDown={onClose}
          onOpenAutoFocus={handleOpenAutoFocus}
          data-testid="language-modal-container"
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>{t('select-language')}</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              {t('select-language-description', {
                defaultValue: 'Select your preferred display language for Quran.ir',
              })}
            </DialogPrimitive.Description>
          </VisuallyHidden>

          {/* Modal Header */}
          <div className={styles.headerContainer}>
            <div className={styles.titleGroup}>
              <div className={styles.titleIcon}>
                <IconGlobe />
              </div>
              <h2 className={styles.title}>{t('select-language')}</h2>
            </div>
            <div className={styles.closeButton}>
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Ghost}
                shape={ButtonShape.Circle}
                onClick={onClose}
                ariaLabel={t('close')}
                isDisabled={isChangingLanguage}
              >
                <CloseIcon />
              </Button>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <div className={styles.searchIcon}>
                <IconSearch />
              </div>
              <input
                ref={searchInputRef}
                className={styles.searchInput}
                type="search"
                placeholder={t('search-languages', { defaultValue: 'Search languages...' })}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                aria-label={t('search-languages', { defaultValue: 'Search languages...' })}
              />
              {searchFilter && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setSearchFilter('')}
                  aria-label={t('input.clear')}
                >
                  {t('input.clear')}
                </button>
              )}
            </div>
          </div>

          {/* Language Cards Body */}
          <div className={styles.bodyContainer}>
            {filteredLocales.length > 0 ? (
              <div className={styles.languageGrid} role="radiogroup" aria-label={t('select-language')}>
                {filteredLocales.map((locale) => {
                  const isSelected = locale === lang;
                  const isThisChanging = isChangingLanguage && changingLocale === locale;
                  return (
                    <button
                      key={locale}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleLanguageSelect(locale)}
                      disabled={isChangingLanguage}
                      className={classNames(styles.languageCard, {
                        [styles.selected]: isSelected,
                        [styles.disabled]: isChangingLanguage,
                      })}
                      data-testid={`language-card-${locale}`}
                    >
                      <div className={styles.languageNames}>
                        <span className={styles.nativeName}>{getLocaleName(locale)}</span>
                        {LOCALE_ENGLISH_NAMES[locale] &&
                          LOCALE_ENGLISH_NAMES[locale] !== getLocaleName(locale) && (
                            <span className={styles.englishName}>
                              {LOCALE_ENGLISH_NAMES[locale]}
                            </span>
                          )}
                      </div>
                      <div className={styles.checkIndicator}>
                        {isThisChanging ? (
                          <Spinner size={SpinnerSize.Small} />
                        ) : isSelected ? (
                          <CheckIcon />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>{t('no-languages-found', { defaultValue: 'No languages found' })}</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className={styles.footerContainer}>
            <span className={styles.footerCount}>
              {t('languages-count', {
                count: filteredLocales.length,
                total: locales.length,
                defaultValue: `${filteredLocales.length} of ${locales.length} languages`,
              })}
            </span>
            <div className={styles.footerShortcuts}>
              <span className={styles.kbd}>ESC</span>
              <span>{t('close')}</span>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default LanguageModal;
