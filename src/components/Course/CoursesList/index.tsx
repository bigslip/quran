import React, { useMemo } from 'react';

import classNames from 'classnames';
import Image from 'next/image';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import CourseCardItem from './CourseCardItem';
import filterCourses from './filterCourses';
import styles from './LessonsList.module.scss';
import useCoursesList from './useCoursesList';

import Link, { LinkVariant } from '@/dls/Link/Link';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { CoursesResponse } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import { getCoursesNavigationUrl } from '@/utils/navigation';

type Props = {
  initialResponse: CoursesResponse;
  isMyCourses: boolean;
  languages?: string[];
  searchQuery?: string;
  activeFilter?: string;
  onResetFilters?: () => void;
};

const MIN_COURSES_COUNT = 6;
const COMING_SOON_IMAGE = '/images/courses/coming-soon.svg';

const CoursesList: React.FC<Props> = ({
  initialResponse,
  isMyCourses,
  languages,
  searchQuery = '',
  activeFilter = 'all',
  onResetFilters,
}) => {
  const { t } = useTranslation('learn');
  const { courses, hasNextPage, isLoadingMore, sentinelRef } = useCoursesList({
    initialResponse,
    isMyCourses,
    languages,
  });

  const onMyCourses = () => {
    logButtonClick('user_no_courses_link');
  };

  const onAllCoursesClicked = () => {
    logButtonClick('all_courses_link');
  };

  const filteredCourses = useMemo(
    () => filterCourses(courses, searchQuery, activeFilter),
    [courses, searchQuery, activeFilter],
  );

  const comingSoonPlaceholders = useMemo(() => {
    const isFiltered = Boolean(searchQuery.trim()) || activeFilter !== 'all';
    if (isMyCourses || isFiltered || filteredCourses.length >= MIN_COURSES_COUNT) {
      return [];
    }
    const missingCoursesCount = MIN_COURSES_COUNT - filteredCourses.length;
    return Array.from({ length: missingCoursesCount }, (unusedIndex, index) => index);
  }, [filteredCourses.length, isMyCourses, searchQuery, activeFilter]);

  const shouldShowEmptyMyCourses = isMyCourses && courses.length === 0 && !hasNextPage;

  if (shouldShowEmptyMyCourses) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptySubtitle}>
          <Trans
            i18nKey="learn:empty-learning-plans"
            components={{
              link: (
                <Link
                  onClick={onMyCourses}
                  key={0}
                  href={getCoursesNavigationUrl()}
                  variant={LinkVariant.Highlight}
                />
              ),
            }}
          />
        </p>
      </div>
    );
  }

  if (filteredCourses.length === 0 && (searchQuery.trim() || activeFilter !== 'all')) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyTitle}>{t('no-courses-found')}</div>
        <p className={styles.emptySubtitle}>{t('try-different-filter')}</p>
        {onResetFilters && (
          <button type="button" className={styles.resetButton} onClick={onResetFilters}>
            {t('clear-filters')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={styles.container} data-testid="courses-list">
        {filteredCourses.map((course) => (
          <CourseCardItem key={course.id} course={course} />
        ))}
        {comingSoonPlaceholders.map((placeholderIndex) => (
          <div key={`coming-soon-${placeholderIndex}`} className={styles.courseCardWrapper}>
            <div className={classNames(styles.card, styles.comingSoonCard)}>
              <div className={styles.thumbnailWrapper}>
                <Image
                  src={COMING_SOON_IMAGE}
                  alt={t('coming-soon')}
                  fill
                  className={styles.thumbnail}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={styles.gradientOverlay} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{t('coming-soon')}</h3>
                  <p className={styles.cardDesc}>
                    {t('coming-soon-desc', {
                      defaultValue: 'برنامه‌ها و دوره‌های جدید در دست آماده‌سازی است',
                    })}
                  </p>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.comingSoonBadge}>
                    {t('coming-soon-badge', { defaultValue: 'به زودی' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div ref={sentinelRef} className={styles.loadingMore}>
          {isLoadingMore && <Spinner size={SpinnerSize.Small} />}
        </div>
      )}

      {isMyCourses && (
        <div className={styles.allCourses}>
          <Link
            variant={LinkVariant.Highlight}
            onClick={onAllCoursesClicked}
            href={getCoursesNavigationUrl()}
          >
            {t('all-learning-plans')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default CoursesList;
