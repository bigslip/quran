import React, { useState } from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './LessonsList.module.scss';

import Link from '@/dls/Link/Link';
import ArrowIcon from '@/icons/arrow.svg';
import CheckIcon from '@/icons/check.svg';
import SparkleIcon from '@/icons/star.svg';
import { Course } from '@/types/auth/Course';
import { getCourseNavigationUrl, getLessonNavigationUrl } from '@/utils/navigation';

const FALLBACK_THUMBNAIL = '/images/courses/course-fallback.svg';

interface CourseCardItemProps {
  course: Course;
}

const CourseCardItem: React.FC<CourseCardItemProps> = ({ course }) => {
  const { t } = useTranslation('learn');
  const [imgSrc, setImgSrc] = useState<string>(course.thumbnail || FALLBACK_THUMBNAIL);

  const {
    slug,
    continueFromLesson,
    title,
    description,
    isCompleted,
    authors,
    dailyMinutes,
    lessons,
  } = course;
  const navigateTo = continueFromLesson
    ? getLessonNavigationUrl(slug, continueFromLesson)
    : getCourseNavigationUrl(slug);

  const authorName = authors?.[0]?.author?.name;
  const userHasEnrolled = typeof isCompleted !== 'undefined';
  const enrolledButNotCompleted = userHasEnrolled && !isCompleted;
  const hasCompletedCourse = isCompleted === true;

  const ctaLabel =
    hasCompletedCourse || enrolledButNotCompleted ? t('continue-learning') : t('learn-more');

  let metaBadge: React.ReactNode = null;
  if (dailyMinutes) {
    metaBadge = (
      <div className={styles.metaInfo}>
        {t('mins-per-day', { count: dailyMinutes, defaultValue: `${dailyMinutes} mins/day` })}
      </div>
    );
  } else if (lessons && lessons.length > 0) {
    metaBadge = (
      <div className={styles.metaInfo}>
        {t('lessons-count', {
          count: lessons.length,
          defaultValue: `${lessons.length} lessons`,
        })}
      </div>
    );
  }

  return (
    <div className={styles.courseCardWrapper}>
      <Link href={navigateTo} className={styles.card}>
        <div className={styles.thumbnailWrapper}>
          <Image
            src={imgSrc}
            alt={title}
            fill
            className={styles.thumbnail}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc(FALLBACK_THUMBNAIL)}
          />
          <div className={styles.gradientOverlay} />

          <div className={styles.badgeStack}>
            {hasCompletedCourse && (
              <span className={styles.completedPill}>
                <CheckIcon />
                {t('completed')}
              </span>
            )}
            {enrolledButNotCompleted && (
              <span className={styles.enrolledPill}>
                <SparkleIcon />
                {t('enrolled')}
              </span>
            )}
          </div>

          {metaBadge}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{title}</h3>
            {description && <p className={styles.cardDesc}>{description}</p>}
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.authorText}>{authorName || t('author')}</span>
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

export default React.memo(CourseCardItem);
