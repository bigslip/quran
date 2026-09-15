import { useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getAvailableReciters } from '@/api';
import { filterReciters } from '@/components/Navbar/SettingsDrawer/ReciterSelectionBody';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReciterListHero from '@/components/Reciter/QuranReciterListHero';
import RecitersList from '@/components/Reciter/RecitersList';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';
import Reciter from 'types/Reciter';

const NAVIGATION_URL = '/reciters';

const RecitersListPage = ({ reciters = [] }: { reciters?: Reciter[] }) => {
  const { t, lang } = useTranslation('reciter');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const totalCount = reciters.length;
  const availableCount = useMemo(
    () => reciters.filter((r) => Boolean(r.isAvailable ?? r.hasAudio)).length,
    [reciters],
  );

  const filteredReciters = useMemo(() => {
    let result = reciters;

    if (searchQuery.trim()) {
      result = filterReciters(result, searchQuery.trim());
    }

    if (activeFilter === 'available') {
      result = result.filter((r) => Boolean(r.isAvailable ?? r.hasAudio));
    } else if (activeFilter === 'murattal') {
      result = result.filter(
        (r) =>
          r.style?.name?.toLowerCase().includes('murattal') ||
          r.style?.name?.includes('ترتیل') ||
          r.recitationStyle?.toLowerCase().includes('murattal'),
      );
    } else if (activeFilter === 'mujawwad') {
      result = result.filter(
        (r) =>
          r.style?.name?.toLowerCase().includes('mujawwad') ||
          r.style?.name?.includes('تحقیق') ||
          r.style?.name?.includes('تجوید') ||
          r.recitationStyle?.toLowerCase().includes('mujawwad'),
      );
    }

    return result;
  }, [reciters, searchQuery, activeFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  return (
    <>
      <NextSeoWrapper
        title={t('quran-reciters')}
        description={t('reciters-desc')}
        canonical={getCanonicalUrl(lang, NAVIGATION_URL)}
        languageAlternates={getLanguageAlternates(NAVIGATION_URL)}
      />
      <div className={classNames(layoutStyle.flow, pageStyle.flow)}>
        <QuranReciterListHero
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          availableCount={availableCount}
          totalCount={totalCount}
        />
        <div className={classNames(layoutStyle.flowItem, pageStyle.recitersListContainer)}>
          {filteredReciters.length > 0 ? (
            <RecitersList reciters={filteredReciters} />
          ) : (
            <div className={pageStyle.emptyState}>
              <div className={pageStyle.emptyTitle}>
                {t('reciter:no-results')}
              </div>
              <p className={pageStyle.emptySubtitle}>
                {t('common:try-different-search')}
              </p>
              <button
                type="button"
                className={pageStyle.resetButton}
                onClick={handleResetFilters}
              >
                {t('common:clear-filters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const { reciters } = await getAvailableReciters(locale, [
      'profile_picture',
      'cover_image',
      'bio',
    ]);
    const chaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData,
        reciters: reciters || [],
      },
    };
  } catch (e) {
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default RecitersListPage;
