import { Translate } from 'next-translate';

import { Course } from '@/types/auth/Course';

export const learningPlansSorter = (a: Course, b: Course): number => {
  // Enrolled but unfinished courses come first
  if (a.isCompleted === false && b.isCompleted !== false) return -1;
  if (a.isCompleted !== false && b.isCompleted === false) return 1;

  // New courses (isCompleted undefined) come second
  if (a.isCompleted === undefined && b.isCompleted === true) return -1;
  if (a.isCompleted === true && b.isCompleted === undefined) return 1;

  return 0;
};

export const getCardCtaLabel = (
  t: Translate,
  hasCompletedCourse: boolean,
  enrolledButNotCompleted: boolean,
): string => {
  if (hasCompletedCourse) {
    return t('learn:completed');
  }
  if (enrolledButNotCompleted) {
    return t('learn:continue-learning');
  }
  return t('learn:enroll', { defaultValue: 'Start' });
};
