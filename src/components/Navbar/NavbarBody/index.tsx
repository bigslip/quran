import { memo, useEffect, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './NavbarBody.module.scss';
import ProfileAvatarButton from './ProfileAvatarButton';

import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import useIsMobile from '@/hooks/useIsMobile';
import useNavbarDrawerActions from '@/hooks/useNavbarDrawerActions';
import IconGlobe from '@/icons/globe.svg';
import IconMenu from '@/icons/menu.svg';
import IconSearch from '@/icons/search.svg';
import {
  selectIsLanguageDrawerOpen,
  selectIsNavigationDrawerOpen,
  selectIsSettingsDrawerOpen,
} from '@/redux/slices/navbar';
import { TestId } from '@/tests/test-ids';

interface Props {
  isBannerVisible?: boolean;
}

const NavbarBody: React.FC<Props> = () => {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  const [isMac, setIsMac] = useState(true);
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const isLanguageDrawerOpen = useSelector(selectIsLanguageDrawerOpen);

  const { openSearchDrawer, openNavigationDrawer, openLanguageDrawer } = useNavbarDrawerActions();

  useEffect(() => {
    setIsMac(
      typeof window !== 'undefined' &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    );
  }, []);

  return (
    <>
      <div
        className={classNames(styles.itemsContainer, {
          [styles.dimmed]: isNavigationDrawerOpen || isSettingsDrawerOpen || isLanguageDrawerOpen,
        })}
        inert={
          (isNavigationDrawerOpen || isSettingsDrawerOpen || isLanguageDrawerOpen
            ? ''
            : undefined) as unknown as boolean
        }
      >
        <div className={styles.centerVertically}>
          <div className={styles.startCTA}>
            <Button
              tooltip={t('menu')}
              variant={ButtonVariant.Ghost}
              shape={ButtonShape.Circle}
              onClick={openNavigationDrawer}
              ariaLabel={t('aria.nav-drawer-open')}
              data-testid={TestId.OPEN_NAVIGATION_DRAWER}
            >
              <IconMenu />
            </Button>

            <Button
              tooltip={t('languages')}
              variant={ButtonVariant.Ghost}
              onClick={openLanguageDrawer}
              shape={ButtonShape.Circle}
              shouldFlipOnRTL={false}
              ariaLabel={t('languages')}
              data-testid="open-language-drawer"
            >
              <IconGlobe />
            </Button>

            <div className={styles.mobileSearchButton}>
              <Button
                tooltip={t('search.title')}
                variant={ButtonVariant.Ghost}
                onClick={openSearchDrawer}
                shape={ButtonShape.Circle}
                shouldFlipOnRTL={false}
                ariaLabel={t('search.title')}
                data-testid={isMobile ? TestId.OPEN_SEARCH_DRAWER : 'open-search-drawer-mobile'}
              >
                <IconSearch />
              </Button>
            </div>

            <ProfileAvatarButton />
          </div>
        </div>

        <div className={styles.commandBarContainer}>
          <button
            type="button"
            className={styles.commandBarPill}
            onClick={openSearchDrawer}
            aria-label={t('search.title')}
            data-testid={!isMobile ? TestId.OPEN_SEARCH_DRAWER : 'navbar-command-bar-search'}
          >
            <span className={styles.searchIconWrapper}>
              <IconSearch />
            </span>
            <span className={styles.commandBarPlaceholder}>
              {t('command-bar.spotlight-placeholder')}
            </span>
            <kbd className={styles.commandBarKbd} aria-hidden="true" dir="ltr">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>
        </div>

        <div className={styles.centerVertically}>
          <div className={styles.endCTA}>
            <NavbarLogoWrapper />
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(NavbarBody);
