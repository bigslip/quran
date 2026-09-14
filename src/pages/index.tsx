/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './index.module.scss';

import ChapterAndJuzListWrapper from '@/components/chapters/ChapterAndJuzList';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { ElegantDarkPattern } from '@/components/ui/elegant-dark-pattern';
import useAuthData from '@/hooks/auth/useAuthData';
import useIsMobile from '@/hooks/useIsMobile';
import { selectIsHomepageBannerVisible } from '@/redux/slices/fundraisingBanner';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import getCurrentDayAyah from '@/utils/quranInYearCalendar';
import { ChaptersResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

import HomePageHero from '@/components/HomePage/HomePageHero';
import LearningPlansLoading from '@/components/HomePage/LearningPlansSection/Loading';

const ReadingSection = dynamic(() => import('@/components/HomePage/ReadingSection'), {
  ssr: false,
});

const SpiritualPrayerRibbon = dynamic(
  () => import('@/components/HomePage/SpiritualPrayerRibbon/SpiritualPrayerRibbon'),
  { ssr: false },
);

const HomepageFundraisingBanner = dynamic(
  () => import('@/components/Fundraising/HomepageFundraisingBanner'),
  { ssr: false },
);

const MobileHomepageSections = dynamic(
  () => import('@/components/HomePage/MobileHomepageSections'),
  { ssr: false },
);

const LearningPlansSection = dynamic(() => import('@/components/HomePage/LearningPlansSection'), {
  ssr: false,
  loading: () => <LearningPlansLoading />,
});

const QuranInYearSection = dynamic(() => import('@/components/HomePage/QuranInYearSection'), {
  ssr: false,
});

const ExploreTopicsSection = dynamic(() => import('@/components/HomePage/ExploreTopicsSection'), {
  ssr: false,
});


type IndexProps = {
  chaptersResponse: ChaptersResponse;
  chaptersData: ChaptersData;
};

const Index: NextPage<IndexProps> = ({
  chaptersResponse: { chapters },
  chaptersData,
}): JSX.Element => {
  const { t, lang } = useTranslation('home');
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuthData();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isUserLoggedIn = isMounted && isAuthenticated;
  const todayAyah = useMemo(() => getCurrentDayAyah(), []);
  const isBannerVisible = useSelector(selectIsHomepageBannerVisible);

  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/images/background.png" crossOrigin="anonymous" />
      </Head>
      <NextSeoWrapper
        title={t('home:noble-quran')}
        url={getCanonicalUrl(lang, '')}
        languageAlternates={getLanguageAlternates('')}
      />
      <div className={styles.pageContainer}>
        <div className={styles.flow}>
          <ElegantDarkPattern className={styles.sanctuaryHeroStage}>
            <HomePageHero />
            <SpiritualPrayerRibbon />
          </ElegantDarkPattern>
          <div className={styles.bodyContainer}>
            <div className={classNames(styles.flowItem, styles.homepageRibbon)}>
              <ReadingSection />
            </div>
            {isBannerVisible ? (
              <div
                className={classNames(
                  styles.flowItem,
                  styles.fullWidth,
                  styles.homepageCard,
                  styles.homepageFundraisingCard,
                )}
              >
                <HomepageFundraisingBanner />
              </div>
            ) : null}
            <div
              id="chapter-and-juz-list"
              className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
            >
              <ChapterAndJuzListWrapper chapters={chapters} />
            </div>
            {isMounted && isMobile ? (
              <MobileHomepageSections
                isUserLoggedIn={isUserLoggedIn}
                todayAyah={todayAyah}
                chaptersData={chaptersData}
              />
            ) : (
              <>
                {isUserLoggedIn ? (
                  <>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <LearningPlansSection />
                    </div>
                    {todayAyah ? (
                      <div
                        className={classNames(
                          styles.flowItem,
                          styles.fullWidth,
                          styles.homepageCard,
                        )}
                      >
                        <QuranInYearSection chaptersData={chaptersData} />
                      </div>
                    ) : null}
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <ExploreTopicsSection />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <ExploreTopicsSection />
                    </div>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <LearningPlansSection />
                    </div>
                    {todayAyah ? (
                      <div
                        className={classNames(
                          styles.flowItem,
                          styles.fullWidth,
                          styles.homepageCard,
                        )}
                      >
                        <QuranInYearSection chaptersData={chaptersData} />
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
      chaptersResponse: {
        chapters: Object.keys(allChaptersData).map((chapterId) => {
          const chapterData = allChaptersData[chapterId];
          return { ...chapterData, id: Number(chapterId) };
        }),
      },
    },
  };
};

export default Index;
