import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import styles from './MyLearningPlansSkeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const MyLearningPlansSkeleton = (props: HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation('learn');
  return (
    <div
      aria-busy="true"
      aria-label={t('loading-plans', { defaultValue: 'Loading plans' })}
      {...props}
      className={classNames(styles.containerSkeleton, props.className)}
    >
      <div className={styles.titleContainerSkeleton}>
        <Skeleton className={styles.titleSkeleton} />
      </div>
      <div className={styles.contentSkeleton}>
        <Skeleton className={styles.cardsSkeletonContainer} />
        <Skeleton className={styles.cardsSkeletonContainer} />
        <Skeleton className={styles.cardsSkeletonContainer} />
      </div>
    </div>
  );
};

export default MyLearningPlansSkeleton;
