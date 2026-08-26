import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './MyLearningPlansSkeleton.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';

const MyLearningPlansSkeleton = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      aria-busy="true"
      aria-label="Loading plans"
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
