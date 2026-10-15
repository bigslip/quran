import { useCallback, useEffect, useState } from 'react';

import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './my-quran.module.scss';

import MyQuranHero from '@/components/MyQuran/MyQuranHero';
import MyQuranTab from '@/components/MyQuran/tabs';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Spinner from '@/dls/Spinner/Spinner';
import { getAllChaptersData } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getMyQuranNavigationUrl } from '@/utils/navigation';

const MY_QURAN_PATH = getMyQuranNavigationUrl();

const SavedTabContent = dynamic(() => import('@/components/MyQuran/SavedTabContent'), {
  ssr: false,
  loading: () => <Spinner />,
});
const RecentContent = dynamic(
  () => import('@/components/MyQuran/tabs/RecentContent/RecentContent'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);
const NotesAndReflectionsTab = dynamic(
  () => import('@/components/MyQuran/tabs/NotesAndReflectionsTab'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

const MyQuranPage = (): JSX.Element => {
  const { lang, t } = useTranslation('my-quran');
  const router = useRouter();
  const { tab } = router.query;
  const [selectedTab, setSelectedTab] = useState(MyQuranTab.SAVED);

  const title = t('common:my-quran');

  const onTabChange = useCallback(
    (value: MyQuranTab) => {
      logEvent('my_quran_tab_change', { value });
      setSelectedTab(value);
      if (tab) router.replace(router.pathname, undefined, { shallow: true });
    },
    [router, tab],
  );

  useEffect(() => {
    if (tab && Object.values(MyQuranTab).includes(tab as MyQuranTab)) {
      setSelectedTab(tab as MyQuranTab);
    }
  }, [tab]);

  return (
    <>
      <NextSeoWrapper
        title={title}
        canonical={getCanonicalUrl(lang, MY_QURAN_PATH)}
        languageAlternates={getLanguageAlternates(MY_QURAN_PATH)}
        nofollow
        noindex
      />
      <main className={styles.main}>
        <MyQuranHero selectedTab={selectedTab} onTabChange={onTabChange} />
        <PageContainer
          isSheetsLike={false}
          wrapperClassName={styles.mainContent}
          className={styles.pageContainer}
        >
          <div
            role="tabpanel"
            id={`tabpanel-${selectedTab}`}
            aria-labelledby={`tab-${selectedTab}`}
            className={styles.tabContent}
          >
            {selectedTab === MyQuranTab.SAVED && <SavedTabContent />}
            {selectedTab === MyQuranTab.RECENT && <RecentContent />}
            {selectedTab === MyQuranTab.NOTES_AND_REFLECTIONS && <NotesAndReflectionsTab />}
          </div>
        </PageContainer>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);
  return { props: { chaptersData: allChaptersData } };
};

export default MyQuranPage;
