/* eslint-disable i18next/no-literal-string */
import useSWR from 'swr';

import styles from './EnrollmentCount.module.scss';

import Skeleton from '@/dls/Skeleton/Skeleton';
import { getReadingGoalCount } from '@/utils/auth/api';
import { makeReadingGoalCountUrl } from '@/utils/auth/apiPaths';
import { GoalCategory } from 'types/auth/Goal';

const MINIMUM_ENROLLMENT_COUNT = 500;

type Props = React.HTMLAttributes<HTMLParagraphElement>;

const EnrollmentCount = ({ ...rest }: Props) => {
  const { data } = useSWR(makeReadingGoalCountUrl({ type: GoalCategory.RAMADAN_CHALLENGE }), () =>
    getReadingGoalCount(GoalCategory.RAMADAN_CHALLENGE),
  );
  const count = data?.data?.count;

  if (!data) {
    return (
      <p {...rest} aria-busy="true">
        <Skeleton className={styles.skeleton} />
      </p>
    );
  }

  if (typeof count !== 'number' || count < MINIMUM_ENROLLMENT_COUNT) {
    return null;
  }

  return (
    <p {...rest}>
      🌍 <span>{count}+</span> people around the world have joined the challenge!
    </p>
  );
};

export default EnrollmentCount;
