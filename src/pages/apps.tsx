/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines, react/no-multi-comp */

import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './apps-portal.module.scss';

import AppsPortalHero, { AppFilterChip } from '@/components/AppsPortal/AppsPortalHero';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import useDebounce from '@/hooks/useDebounce';
import GlobeIcon from '@/icons/globe.svg';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick, logTextSearchQuery } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';

export interface AppLinks {
  androidHref?: string;
  iosHref?: string;
  webHref?: string;
}

export interface FeaturedApp extends AppLinks {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
}

export interface AppTile extends AppLinks {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  categories: AppCategory[];
  tagline?: string;
}

export type AppCategory =
  | 'study-tools'
  | 'reflections'
  | 'popular'
  | 'quran-reader'
  | 'community'
  | 'hadith-sunnah';

export type FilterValue = 'all' | AppCategory;

export type AppPlatform = 'android' | 'ios' | 'web';

export interface AppCtaLabels {
  playStoreAlt: string;
  appStoreAlt: string;
  webCtaText: string;
}

const VisitBadge: FC<{ label: string }> = ({ label }) => {
  return (
    <span className={styles.visitBadge}>
      <span className={styles.visitBadgeIcon} aria-hidden="true">
        <GlobeIcon />
      </span>
      <span className={styles.visitBadgeText} dir="auto">
        {label}
      </span>
    </span>
  );
};

const DEBOUNCE_DELAY = 1000;

const getFeaturedApps = (t: (key: string) => string): FeaturedApp[] => [
  {
    id: 'qariah',
    name: t('featured.apps.qariah.name'),
    tagline: t('featured.apps.qariah.tagline'),
    description: t('featured.apps.qariah.headline'),
    iconSrc: '/images/app-portal/featured/qaariah-icon.webp',
    iconAlt: 'Qariah – women Quran reciters app',
    webHref: 'https://www.qariah.app/',
    iosHref: 'https://apps.apple.com/us/app/qariah/id1594917787',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=com.qariah.app',
  },
  {
    id: 'quran-space',
    name: t('featured.apps.quran-space.name'),
    tagline: t('featured.apps.quran-space.tagline'),
    description: t('featured.apps.quran-space.headline'),
    iconSrc: '/images/app-portal/featured/quran-space-icon.png',
    iconAlt: 'Quran Space',
    webHref: 'https://quran.space/',
  },
  {
    id: 'quranreflect',
    name: t('browse.apps.quranreflect.title'),
    tagline: t('browse.apps.quranreflect.tagline'),
    description: t('browse.apps.quranreflect.description'),
    iconSrc: '/images/app-portal/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    webHref: 'https://quranreflect.com',
    androidHref:
      'https://play.google.com/store/apps/details?id=com.quranreflect.quranreflect&hl=en',
    iosHref: 'https://apps.apple.com/us/app/quranreflect/id1444969758',
  },
];

const getFeaturedAppTiles = (t: (key: string) => string): AppTile[] => [
  {
    id: 'qariah',
    title: t('featured.apps.qariah.name'),
    description: t('featured.apps.qariah.headline'),
    tagline: t('featured.apps.qariah.tagline'),
    iconSrc: '/images/app-portal/featured/qaariah-icon.webp',
    iconAlt: 'Qariah – women Quran reciters app',
    webHref: 'https://www.qariah.app/',
    iosHref: 'https://apps.apple.com/us/app/qariah/id1594917787',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=com.qariah.app',
    categories: ['popular', 'quran-reader', 'study-tools'],
  },
  {
    id: 'quran-space',
    title: t('featured.apps.quran-space.name'),
    description: t('featured.apps.quran-space.headline'),
    tagline: t('featured.apps.quran-space.tagline'),
    iconSrc: '/images/app-portal/featured/quran-space-icon.png',
    iconAlt: 'Quran Space',
    webHref: 'https://quran.space/',
    categories: ['popular', 'quran-reader', 'study-tools'],
  },
  {
    id: 'quranreflect',
    title: t('browse.apps.quranreflect.title'),
    description: t('browse.apps.quranreflect.description'),
    tagline: t('browse.apps.quranreflect.tagline'),
    iconSrc: '/images/app-portal/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    webHref: 'https://quranreflect.com',
    androidHref:
      'https://play.google.com/store/apps/details?id=com.quranreflect.quranreflect&hl=en',
    iosHref: 'https://apps.apple.com/us/app/quranreflect/id1444969758',
    categories: ['popular', 'reflections', 'study-tools'],
  },
];

const getAppTiles = (t: (key: string) => string): AppTile[] => [
  {
    id: 'quran_android',
    title: t('browse.apps.quran_android.title'),
    description: t('browse.apps.quran_android.description'),
    tagline: t('browse.apps.quran_android.tagline'),
    iconSrc: '/images/app-portal/qdc-android-logo.webp',
    iconAlt: 'Quran for Android',
    androidHref: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
    categories: ['quran-reader', 'community', 'popular', 'study-tools'],
  },
  {
    id: 'quran_ios',
    title: t('browse.apps.quran_ios.title'),
    description: t('browse.apps.quran_ios.description'),
    tagline: t('browse.apps.quran_ios.tagline'),
    iconSrc: '/images/app-portal/qdc-ios-logo.webp',
    iconAlt: 'Quran for iOS',
    iosHref:
      'https://apps.apple.com/us/app/quran-by-quran-com-%D9%82%D8%B1%D8%A2%D9%86/id1118663303',
    categories: ['quran-reader', 'community', 'popular', 'study-tools'],
  },
  {
    id: 'quran-kareem',
    title: t('featured.apps.quran-kareem.name'),
    description: t('featured.apps.quran-kareem.headline'),
    tagline: t('featured.apps.quran-kareem.tagline'),
    iconSrc: '/images/app-portal/featured/quran_kareem-icon.png',
    iconAlt: 'Quran Kareem app',
    iosHref:
      'https://apps.apple.com/us/app/quran-kareem-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1338804415',
    categories: ['quran-reader', 'popular', 'reflections'],
  },
  {
    id: 'quran-link',
    title: t('featured.apps.quran-link.name'),
    description: t('featured.apps.quran-link.headline'),
    tagline: t('featured.apps.quran-link.tagline'),
    iconSrc: '/images/app-portal/featured/QuranLink-icon.png',
    iconAlt: 'Quran Link app',
    iosHref:
      'https://apps.apple.com/us/app/quran-link-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1425763263',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=com.qortoba.quran.link',
    webHref: 'https://quran.link/',
    categories: ['study-tools', 'quran-reader', 'popular'],
  },
  {
    id: 'sunnah',
    title: t('browse.apps.sunnah.title'),
    description: t('browse.apps.sunnah.description'),
    tagline: t('browse.apps.sunnah.tagline'),
    iconSrc: '/images/app-portal/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    webHref: 'https://sunnah.com',
    categories: ['hadith-sunnah', 'popular'],
  },
  {
    id: 'readtafsir',
    title: t('browse.apps.readtafsir.title'),
    description: t('browse.apps.readtafsir.description'),
    tagline: t('browse.apps.readtafsir.tagline'),
    iconSrc: '/images/app-portal/readtafsir_app_icon.png',
    iconAlt: 'ReadTafsir',
    webHref: 'https://read.tafsir.one/',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=one.tafsir.read',
    iosHref:
      'https://apps.apple.com/gb/app/%D8%A7%D9%84%D8%AA%D9%81%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%AA%D9%81%D8%A7%D8%B9%D9%84%D9%8A/id6503959086',
    categories: ['study-tools', 'quran-reader', 'popular'],
  },
  {
    id: 'tafsirapp',
    title: t('browse.apps.tafsirapp.title'),
    description: t('browse.apps.tafsirapp.description'),
    tagline: t('browse.apps.tafsirapp.tagline'),
    iconSrc: '/images/app-portal/tafsir_app_icon.png',
    iconAlt: 'Tafsir App',
    webHref: 'https://tafsir.app/',
    androidHref: 'https://play.google.com/store/apps/details?id=com.thedawah.furqan',
    iosHref:
      'https://apps.apple.com/sa/app/%D8%A7%D9%84%D8%A8%D8%A7%D8%AD%D8%AB-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%D9%8A/id1450111969',
    categories: ['study-tools', 'quran-reader'],
  },
  {
    id: 'muhaffidh',
    title: t('browse.apps.muhaffidh.title'),
    description: t('browse.apps.muhaffidh.description'),
    tagline: t('browse.apps.muhaffidh.tagline'),
    iconSrc: '/images/app-portal/muhaffidh_app_icon.png',
    iconAlt: 'Muhaffidh App',
    webHref: 'https://muhaffidh.app/',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=com.nuqayah.muhaffidh',
    iosHref:
      'https://apps.apple.com/us/app/%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81-%D8%A7%D9%84%D9%85%D8%AD%D9%81%D8%B8/id6642706361',
    categories: ['study-tools', 'quran-reader', 'popular'],
  },
];

const path = '/apps';
const OG_IMAGE_URL = `${getBasePath()}/images/app-portal/connected-quran-apps.png`;

interface AppCtaRowProps extends AppLinks {
  appId: string;
  ctaLabels: AppCtaLabels;
}

const AppCtaRow: FC<AppCtaRowProps> = ({ androidHref, iosHref, webHref, appId, ctaLabels }) => {
  if (!androidHref && !iosHref && !webHref) return null;

  const handleClick = (platform: AppPlatform) => {
    const normalizedAppId = appId.replaceAll('-', '_');
    logButtonClick(`app_portal_${normalizedAppId}_${platform}`);
  };

  return (
    <div className={styles.cardActions}>
      {androidHref && (
        <a
          className={styles.storeBadge}
          href={androidHref}
          target="_blank"
          rel="noreferrer"
          aria-label={ctaLabels.playStoreAlt}
          onClick={() => handleClick('android')}
        >
          <Image
            alt={ctaLabels.playStoreAlt}
            src="/images/play-store.svg"
            width={96}
            height={20}
            className={styles.storeBadgeImage}
          />
        </a>
      )}
      {iosHref && (
        <a
          className={styles.storeBadge}
          href={iosHref}
          target="_blank"
          rel="noreferrer"
          aria-label={ctaLabels.appStoreAlt}
          onClick={() => handleClick('ios')}
        >
          <Image
            alt={ctaLabels.appStoreAlt}
            src="/images/app-store.svg"
            width={96}
            height={20}
            className={styles.storeBadgeImage}
          />
        </a>
      )}
      {webHref && (
        <a
          className={styles.storeBadge}
          href={webHref}
          target="_blank"
          rel="noreferrer"
          aria-label={ctaLabels.webCtaText}
          onClick={() => handleClick('web')}
        >
          <VisitBadge label={ctaLabels.webCtaText} />
        </a>
      )}
    </div>
  );
};

const FeaturedCard: FC<{
  app: FeaturedApp;
  ctaLabels: AppCtaLabels;
}> = ({ app, ctaLabels }) => (
  <article className={styles.featuredCard}>
    <div className={styles.cardBody}>
      <div className={styles.appMeta}>
        <span className={styles.appIcon} aria-hidden="true">
          <Image
            alt={app.iconAlt}
            src={app.iconSrc}
            fill
            sizes="56px"
            className={styles.appIconImage}
          />
        </span>
        <div className={styles.appMetaText}>
          <div className={styles.appName}>{app.name}</div>
          {app.tagline && <div className={styles.appTagline}>{app.tagline}</div>}
        </div>
      </div>
      <p className={styles.appDescription}>{app.description}</p>
      <AppCtaRow
        appId={app.id}
        androidHref={app.androidHref}
        iosHref={app.iosHref}
        webHref={app.webHref}
        ctaLabels={ctaLabels}
      />
    </div>
  </article>
);

interface FeaturedAppsProps {
  title: string;
  viewAllText: string;
  apps: FeaturedApp[];
  ctaLabels: AppCtaLabels;
}

const FeaturedApps: FC<FeaturedAppsProps> = ({ title, viewAllText, apps, ctaLabels }) => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleContainer}>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <a
          className={styles.sectionLink}
          href="#browse-apps"
          onClick={() => logButtonClick('app_portal_featured_view_all')}
        >
          {viewAllText}
        </a>
      </div>
      <div className={styles.featuredGrid}>
        {apps.map((app) => (
          <FeaturedCard key={app.id} app={app} ctaLabels={ctaLabels} />
        ))}
      </div>
    </section>
  );
};

const AppTileCard: FC<{
  app: AppTile;
  ctaLabels: AppCtaLabels;
}> = ({ app, ctaLabels }) => (
  <article className={styles.appCard}>
    <div className={styles.cardBody}>
      <div className={styles.appMeta}>
        <span className={styles.appIcon} aria-hidden="true">
          <Image
            alt={app.iconAlt}
            src={app.iconSrc}
            fill
            sizes="56px"
            className={styles.appIconImage}
          />
        </span>
        <div className={styles.appMetaText}>
          <div className={styles.appName}>{app.title}</div>
          {app.tagline && <div className={styles.appTagline}>{app.tagline}</div>}
        </div>
      </div>
      <p className={styles.appDescription}>{app.description}</p>
      <AppCtaRow
        appId={app.id}
        androidHref={app.androidHref}
        iosHref={app.iosHref}
        webHref={app.webHref}
        ctaLabels={ctaLabels}
      />
    </div>
  </article>
);

interface AppGridProps {
  apps: AppTile[];
  emptyHeading: string;
  emptyDescription: string;
  clearFiltersText: string;
  onResetFilters: () => void;
  ctaLabels: AppCtaLabels;
}

const AppGrid: FC<AppGridProps> = ({
  apps,
  emptyHeading,
  emptyDescription,
  clearFiltersText,
  onResetFilters,
  ctaLabels,
}) => {
  if (!apps.length) {
    return (
      <div className={styles.emptyStateContainer}>
        <h3 className={styles.emptyStateTitle}>{emptyHeading}</h3>
        <p className={styles.emptyStateDescription}>{emptyDescription}</p>
        <Button
          type={ButtonType.Primary}
          shape={ButtonShape.Pill}
          onClick={onResetFilters}
          className={styles.clearFiltersButton}
        >
          {clearFiltersText}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.appGrid}>
      {apps.map((app) => (
        <AppTileCard key={app.id} app={app} ctaLabels={ctaLabels} />
      ))}
    </div>
  );
};

const AppPortalPage: NextPage = () => {
  const { t, lang } = useTranslation('app-portal');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  const featuredApps = useMemo(() => getFeaturedApps(t), [t]);
  const appTiles = useMemo(() => [...getAppTiles(t), ...getFeaturedAppTiles(t)], [t]);

  const ctaLabels = useMemo(
    () => ({
      playStoreAlt: t('cta.google-play'),
      appStoreAlt: t('cta.app-store'),
      webCtaText: t('cta.visit'),
    }),
    [t],
  );

  useEffect(() => {
    if (debouncedSearchQuery) {
      logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.AppPortal);
    }
  }, [debouncedSearchQuery]);

  const filterCounts = useMemo(() => {
    return {
      all: appTiles.length,
      'study-tools': appTiles.filter((a) => a.categories.includes('study-tools')).length,
      reflections: appTiles.filter((a) => a.categories.includes('reflections')).length,
      popular: appTiles.filter((a) => a.categories.includes('popular')).length,
      'quran-reader': appTiles.filter((a) => a.categories.includes('quran-reader')).length,
      community: appTiles.filter((a) => a.categories.includes('community')).length,
      'hadith-sunnah': appTiles.filter((a) => a.categories.includes('hadith-sunnah')).length,
    };
  }, [appTiles]);

  const filters: AppFilterChip[] = useMemo(
    () => [
      { label: t('filter-all'), value: 'all', count: filterCounts.all },
      {
        label: t('filter-study-tools'),
        value: 'study-tools',
        count: filterCounts['study-tools'],
      },
      {
        label: t('filter-reflections'),
        value: 'reflections',
        count: filterCounts.reflections,
      },
      { label: t('filter-popular'), value: 'popular', count: filterCounts.popular },
      {
        label: t('filter-quran-reader'),
        value: 'quran-reader',
        count: filterCounts['quran-reader'],
      },
      { label: t('filter-community'), value: 'community', count: filterCounts.community },
      {
        label: t('filter-hadith-sunnah'),
        value: 'hadith-sunnah',
        count: filterCounts['hadith-sunnah'],
      },
    ],
    [t, filterCounts],
  );

  const filteredApps = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return appTiles.filter((app) => {
      const matchesFilter = activeFilter === 'all' ? true : app.categories.includes(activeFilter);
      const matchesSearch =
        normalizedQuery.length === 0 ||
        app.title.toLowerCase().includes(normalizedQuery) ||
        app.description.toLowerCase().includes(normalizedQuery) ||
        (app.tagline && app.tagline.toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, appTiles]);

  const handleFilterChange = useCallback((filter: string) => {
    const normalizeFilter = filter?.toLowerCase().replaceAll('-', '_');
    logButtonClick(`app_portal_${normalizeFilter}_tab`);
    setActiveFilter(filter as FilterValue);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveFilter('all');
    setSearchQuery('');
  }, []);

  const isFiltered = activeFilter !== 'all' || searchQuery.trim().length > 0;

  return (
    <>
      <NextSeoWrapper
        title={t('quran-apps-portal')}
        description={t('hero.description')}
        image={OG_IMAGE_URL}
        imageAlt={t('quran-apps-portal')}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <PageContainer>
        <main className={styles.page}>
          <AppsPortalHero
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchChange}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            filters={filters}
          />

          {!isFiltered && (
            <FeaturedApps
              title={t('featured.title')}
              viewAllText={t('featured.view-all')}
              apps={featuredApps}
              ctaLabels={ctaLabels}
            />
          )}

          <section className={styles.section} id="browse-apps">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleContainer}>
                <h2 className={styles.sectionTitle}>
                  {isFiltered ? t('browse.title') : t('browse.title')}
                </h2>
                <span className={styles.sectionCount}>
                  {filteredApps.length}
                </span>
              </div>
            </div>

            <AppGrid
              apps={filteredApps}
              emptyHeading={t('no-results-heading')}
              emptyDescription={t('no-results-message')}
              clearFiltersText={t('clear-filters')}
              onResetFilters={handleResetFilters}
              ctaLabels={ctaLabels}
            />
          </section>
        </main>
      </PageContainer>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default AppPortalPage;
