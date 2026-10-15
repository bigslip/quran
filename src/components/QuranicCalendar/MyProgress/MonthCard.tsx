import React, { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './MyProgress.module.scss';
import { MonthData, ProcessedWeek } from './types';

import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';

interface MonthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  month: MonthData;
  getWeekClass: (week: ProcessedWeek) => string;
  isProgramCompleted: boolean;
  onWeekSelect: (weekNumber: number) => void;
}

const MonthCard: React.FC<MonthCardProps> = ({
  month,
  getWeekClass,
  isProgramCompleted,
  onWeekSelect,
  className,
  ...props
}) => {
  const { t, lang } = useTranslation('quranic-calendar');
  const toast = useToast();
  const [loadingWeeks, setLoadingWeeks] = useState<number[]>([]);

  const onWeekClick = async (week: ProcessedWeek) => {
    const weekNumber = week.globalWeekNumber;
    logButtonClick('quran_calendar_week_selected', {
      weekNumber,
    });

    // Skip if already being loaded
    if (loadingWeeks.includes(weekNumber)) {
      return;
    }

    // Add weekNumber to loadingWeeks
    setLoadingWeeks((prev) => [...prev, weekNumber]);

    try {
      await onWeekSelect(weekNumber);
    } catch (error) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    } finally {
      // Remove weekNumber from loadingWeeks
      setLoadingWeeks((prev) => prev.filter((w) => w !== weekNumber));
    }
  };

  return (
    <div className={classNames(styles.monthCard, className)} {...props}>
      <h3
        className={classNames(styles.monthTitle, {
          [styles.currentMonthTitle]: month.isCurrentMonth,
        })}
      >
        {month.name}
      </h3>
      {month.isRamadan ? (
        <>
          <div className={styles.weekLabel}>{t('end-of-calendar')}</div>
          <div
            className={classNames(styles.completeLabel, {
              [styles.completeLabelCompleted]: isProgramCompleted,
            })}
          >
            {!isProgramCompleted ? t('complete') : `🎉 ${t('complete')}`}
          </div>
        </>
      ) : (
        <>
          <div className={styles.weekLabel}>{t('week')}</div>
          <div className={styles.weeksRow}>
            {month.weeks.map((week) => {
              const isLoading = loadingWeeks.includes(week.globalWeekNumber);
              const { isCompleted } = week;
              const weekClass = getWeekClass(week);

              return (
                <div
                  key={`week-${month.id}-${week.globalWeekNumber}`}
                  className={weekClass}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t('week')} ${toLocalizedNumber(
                    week.globalWeekNumber,
                    lang,
                  )} of ${month.name}${isCompleted ? ` - ${t('completed')}` : ''}`}
                  data-week-number={week.globalWeekNumber}
                  title={week.data.ranges}
                  onClick={() => onWeekClick(week)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onWeekClick(week);
                    }
                  }}
                >
                  {isLoading ? (
                    <Spinner size={SpinnerSize.Small} isCentered={false} />
                  ) : (
                    toLocalizedNumber(week.globalWeekNumber, lang)
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthCard;
