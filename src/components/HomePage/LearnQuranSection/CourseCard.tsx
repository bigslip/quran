import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import { getCardCtaLabel } from './helpers';
import styles from './LearnQuranSection.module.scss';

import Link from '@/dls/Link/Link';
import ArrowIcon from '@/icons/arrow.svg';
import CheckIcon from '@/icons/check.svg';
import SparkleIcon from '@/icons/star.svg';
import { Course } from '@/types/auth/Course';
import { getCourseNavigationUrl } from '@/utils/navigation';

interface CourseCardProps {
  course: Course;
  isFirstNonEnrolledCourse: boolean;
  onCardClicked: (slug: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isFirstNonEnrolledCourse,
  onCardClicked,
}) => {
  const { t } = useTranslation('home');
  const courseUrl = getCourseNavigationUrl(course.slug);
  const { isCompleted } = course;
  const userHasEnrolled = typeof isCompleted !== 'undefined';
  const enrolledButNotCompleted = userHasEnrolled && !isCompleted;
  const hasCompletedCourse = isCompleted === true;
  const authorName = course.authors?.[0]?.author?.name;
  const ctaLabel = getCardCtaLabel(t, hasCompletedCourse, enrolledButNotCompleted);

  return (
    <div className={styles.learnPlanCard}>
      <Link href={courseUrl} className={styles.card} onClick={() => onCardClicked(course.slug)}>
        <div className={styles.thumbnailWrapper}>
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className={styles.thumbnail}
            sizes="(max-width: 768px) 70vw, 340px"
          />
          <div className={styles.gradientOverlay} />
          <div className={styles.badgeStack}>
            {hasCompletedCourse && (
              <span className={styles.completedPill}>
                <CheckIcon />
                {t('learn:completed')}
              </span>
            )}
            {enrolledButNotCompleted && (
              <span className={styles.enrolledPill}>
                <SparkleIcon />
                {t('learn:enrolled')}
              </span>
            )}
            {isFirstNonEnrolledCourse && (
              <span className={styles.newPill}>
                <SparkleIcon />
                {t('common:new')}
              </span>
            )}
          </div>
          {course.dailyMinutes ? (
            <div className={styles.metaInfo}>
              {course.dailyMinutes} {t('common:mins', { defaultValue: 'mins' })}
              {t('common:day-unit', { defaultValue: '/day' })}
            </div>
          ) : null}
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{course.title}</h3>
          <div className={styles.cardFooter}>
            <span className={styles.authorText}>{authorName || t('learning-plan')}</span>
            <span className={styles.ctaButton}>
              {ctaLabel}
              <ArrowIcon className={styles.ctaArrow} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default React.memo(CourseCard);
