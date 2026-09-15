import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from './index.module.scss';
import radioStyle from './radio.module.scss';

import { getAvailableReciters } from '@/api';
import { filterReciters } from '@/components/Navbar/SettingsDrawer/ReciterSelectionBody';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import CuratedStationList from '@/components/Radio/CuratedStationList';
import curatedStations from '@/components/Radio/curatedStations';
import RadioHero from '@/components/Radio/RadioHero';
import ReciterStationList from '@/components/Radio/ReciterStationList';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import Reciter from 'types/Reciter';

type RadioPageProps = {
  reciters: Reciter[];
};

const NAVIGATION_URL = '/radio';

const RadioPage = ({ reciters = [] }: RadioPageProps) => {
  const { t, lang } = useTranslation('radio');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const curatedStationsList = useMemo(() => Object.entries(curatedStations), []);
  const curatedCount = curatedStationsList.length;
  const totalCount = curatedCount + reciters.length;

  const availableRecitersCount = useMemo(
    () => reciters.filter((r) => Boolean(r.isAvailable ?? r.hasAudio)).length,
    [reciters],
  );
  const availableCount = curatedCount + availableRecitersCount;

  // Filter curated stations by search query
  const filteredCuratedStations = useMemo(() => {
    if (activeFilter === 'reciters') return [];
    if (!searchQuery.trim()) return curatedStationsList;

    const query = searchQuery.trim().toLowerCase();
    return curatedStationsList.filter(([, station]) => {
      const title = t(`curated-station.${station.title}`).toLowerCase();
      const desc = t(`curated-station.${station.description}`).toLowerCase();
      return title.includes(query) || desc.includes(query) || station.title.toLowerCase().includes(query);
    });
  }, [curatedStationsList, searchQuery, activeFilter, t]);

  // Filter reciters by search query and active filter
  const filteredReciters = useMemo(() => {
    if (activeFilter === 'curated') return [];

    let result = reciters;
    if (searchQuery.trim()) {
      result = filterReciters(result, searchQuery.trim());
    }

    if (activeFilter === 'available') {
      result = result.filter((r) => Boolean(r.isAvailable ?? r.hasAudio));
    }

    return result;
  }, [reciters, searchQuery, activeFilter]);

  const hasAnyResults = filteredCuratedStations.length > 0 || filteredReciters.length > 0;

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  return (
    <>
      <NextSeoWrapper
        title={t('common:quran-radio')}
        canonical={getCanonicalUrl(lang, NAVIGATION_URL)}
        languageAlternates={getLanguageAlternates(NAVIGATION_URL)}
        description={t('radio-desc')}
      />
      <div className={classNames(layoutStyle.flow, radioStyle.flow)}>
        <RadioHero
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          availableCount={availableCount}
          totalCount={totalCount}
        />

        {hasAnyResults ? (
          <>
            {/* Curated Stations Section */}
            {filteredCuratedStations.length > 0 && (
              <div className={classNames(layoutStyle.flowItem, radioStyle.curatedSectionContainer)}>
                <div className={radioStyle.sectionHeader}>
                  <h2 className={radioStyle.sectionTitle}>
                    <span>{t('curated-stations')}</span>
                    <span className={radioStyle.sectionBadge}>
                      {filteredCuratedStations.length}
                    </span>
                  </h2>
                </div>
                <div className={layoutStyle.fullWidth}>
                  <CuratedStationList stations={filteredCuratedStations} />
                </div>
              </div>
            )}

            {/* Reciter Stations Section */}
            {filteredReciters.length > 0 && (
              <div className={classNames(layoutStyle.flowItem, radioStyle.reciterSectionContainer)}>
                <div className={radioStyle.sectionHeader}>
                  <h2 className={radioStyle.sectionTitle}>
                    <span>{t('reciter-stations')}</span>
                    <span className={radioStyle.sectionBadge}>
                      {filteredReciters.length}
                    </span>
                  </h2>
                </div>
                <div className={layoutStyle.fullWidth}>
                  <ReciterStationList reciters={filteredReciters} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={classNames(layoutStyle.flowItem)}>
            <div className={radioStyle.emptyState}>
              <div className={radioStyle.emptyTitle}>
                {t('radio:no-results')}
              </div>
              <p className={radioStyle.emptySubtitle}>
                {t('common:try-different-search')}
              </p>
              <button
                type="button"
                className={radioStyle.resetButton}
                onClick={handleResetFilters}
              >
                {t('common:clear-filters')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const [chaptersData, { reciters }] = await Promise.all([
      getAllChaptersData(locale),
      getAvailableReciters(locale, ['profile_picture', 'bio', 'style']),
    ]);
    return {
      props: {
        chaptersData,
        reciters: reciters || [],
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export default RadioPage;
