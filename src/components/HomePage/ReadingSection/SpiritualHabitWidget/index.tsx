import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SpiritualHabitWidget.module.scss';

import BookmarkIcon from '@/icons/bookmark.svg';
import CirclesIcon from '@/icons/circles.svg';
import PlantIcon from '@/icons/plant.svg';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { QuranGoalStatus } from '@/types/auth/Goal';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import {
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
  MY_QURAN_URL,
} from '@/utils/navigation';

type Props = {
  streak?: number;
  goal?: QuranGoalStatus;
  currentActivityDay?: CurrentQuranActivityDay;
};

const SpiritualHabitWidget: React.FC<Props> = ({ streak, goal }) => {
  const { t, lang } = useTranslation('home');

  const onHabitClicked = useCallback(() => {
    logButtonClick('homepage_ribbon_habit_click');
  }, []);

  const hasStreak = typeof streak === 'number' && streak > 0;
  const hasGoal = typeof goal === 'number' && goal > 0;

  return (
    <div className={styles.habitContainer} data-testid="spiritual-habit-widget">
      {hasStreak ? (
        <a
          href={getReadingGoalProgressNavigationUrl()}
          onClick={onHabitClicked}
          className={styles.streakPill}
        >
          <PlantIcon className={styles.plantIcon} />
          <span className={styles.streakText}>
            {toLocalizedNumber(streak, lang)} {t('streak-days', { defaultValue: 'Days' })}
          </span>
        </a>
      ) : hasGoal ? (
        <a
          href={getReadingGoalProgressNavigationUrl()}
          onClick={onHabitClicked}
          className={styles.goalPill}
        >
          <CirclesIcon className={styles.targetIcon} />
          <span className={styles.goalText}>
            {t('reading-goal', { defaultValue: 'Goal Active' })}
          </span>
        </a>
      ) : (
        <a
          href={getReadingGoalNavigationUrl()}
          onClick={onHabitClicked}
          className={styles.setGoalPill}
        >
          <CirclesIcon className={styles.targetIcon} />
          <span className={styles.setGoalText}>
            {t('set-reading-goal', { defaultValue: 'Set Goal' })}
          </span>
        </a>
      )}

      <div className={styles.divider} />

      <a
        href={MY_QURAN_URL}
        onClick={() => logButtonClick('homepage_ribbon_my_quran')}
        className={styles.myQuranLink}
      >
        <BookmarkIcon className={styles.bookmarkIcon} />
        <span className={styles.myQuranText}>{t('my-quran')}</span>
      </a>
    </div>
  );
};

export default React.memo(SpiritualHabitWidget);
