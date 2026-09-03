import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import CourseCard from './CourseCard';
import { learningPlansSorter } from './helpers';
import styles from './LearnQuranSection.module.scss';

import DataFetcher from '@/components/DataFetcher';
import Loading from '@/components/HomePage/LearningPlansSection/Loading';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ArrowIcon from '@/icons/arrow.svg';
import { TestId } from '@/tests/test-ids';
import { CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getCoursesNavigationUrl } from '@/utils/navigation';

const LearnQuranSection = () => {
  const { t, lang } = useTranslation('home');

  const onSeeMoreClicked = () => {
    logButtonClick('homepage_learning_plans_see_more');
  };

  const onLearningPlanCardClicked = (slug: string) => {
    logButtonClick('homepage_learning_plans_card', {
      slug,
    });
  };

  return (
    <DataFetcher
      loading={Loading}
      fetcher={privateFetcher}
      queryKey={makeGetCoursesUrl({ myCourses: false, languages: [lang] })}
      render={(data: CoursesResponse) => {
        const courses = data?.data;
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
          return null;
        }
        const sortedCourses = [...courses].sort(learningPlansSorter);
        const firstNonEnrolledIndex = sortedCourses.findIndex(
          (course) => typeof course.isCompleted === 'undefined',
        );
        const hasEnrolledCourses = sortedCourses.some(
          (course) => typeof course.isCompleted !== 'undefined',
        );

        return (
          <section className={styles.section} aria-label={t('learning-plan')}>
            <div className={styles.header} data-testid="learning-plans-section">
              <div className={styles.titleWrapper}>
                <h2 className={styles.title}>
                  {t(hasEnrolledCourses ? 'continue-learning-plan' : 'start-learning-plan')}
                </h2>
                <p className={styles.subtitle}>
                  {t('qgj.learning-plans.desc.logged-in', {
                    defaultValue:
                      'Structured interactive courses to deepen your understanding step by step.',
                  })}
                </p>
              </div>
              <div>
                <Link
                  variant={LinkVariant.Blend}
                  href={getCoursesNavigationUrl()}
                  className={styles.seeMore}
                  onClick={onSeeMoreClicked}
                >
                  {t('see-more-learning-plans')}
                  <ArrowIcon className={styles.ctaArrow} />
                </Link>
              </div>
            </div>
            <div className={styles.cardsContainer} data-testid={TestId.COURSES_LIST}>
              {sortedCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFirstNonEnrolledCourse={
                    typeof course.isCompleted === 'undefined' && index === firstNonEnrolledIndex
                  }
                  onCardClicked={onLearningPlanCardClicked}
                />
              ))}
            </div>
          </section>
        );
      }}
    />
  );
};

export default LearnQuranSection;
