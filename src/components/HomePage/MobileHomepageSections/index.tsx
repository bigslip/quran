import React from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';

import styles from '@/pages/index.module.scss';
import ChaptersData from 'types/ChaptersData';

const ExploreTopicsSection = dynamic(() => import('../ExploreTopicsSection'));
const LearningPlansSection = dynamic(() => import('../LearningPlansSection'));
const QuranGrowthJourneySection = dynamic(() => import('../QuranGrowthJourneySection'));
const QuranInYearSection = dynamic(() => import('../QuranInYearSection'));

type Props = {
  isUserLoggedIn: boolean;
  todayAyah: { chapter: number; verse: number } | null;
  chaptersData?: ChaptersData;
};

const MobileHomepageSections: React.FC<Props> = ({ isUserLoggedIn, todayAyah, chaptersData }) => {
  return isUserLoggedIn ? (
    <>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <LearningPlansSection />
      </div>
      {todayAyah ? (
        <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
          <QuranInYearSection chaptersData={chaptersData} />
        </div>
      ) : null}
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <ExploreTopicsSection />
      </div>
    </>
  ) : (
    <>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <QuranGrowthJourneySection />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <ExploreTopicsSection />
      </div>
      {todayAyah ? (
        <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
          <QuranInYearSection chaptersData={chaptersData} />
        </div>
      ) : null}
      <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
        <LearningPlansSection />
      </div>
    </>
  );
};

export default React.memo(MobileHomepageSections);
