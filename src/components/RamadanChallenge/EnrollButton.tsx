/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import styles from './EnrollButton.module.scss';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import { addReadingGoal } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';
import { GoalCategory } from 'types/auth/Goal';

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  section: string;
  subscribedText: string;
  enrollText: string;
  isEnrolled: boolean;
  isLoading: boolean;
  mutate: () => Promise<unknown>;
}

const EnrollButton = ({
  section,
  subscribedText,
  enrollText,
  isEnrolled,
  isLoading,
  mutate,
  ...rest
}: Props) => {
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);
  const toast = useToast();

  const isDisabled = isEnrolled || isEnrollLoading || isLoading;

  const handleEnroll = async () => {
    setIsEnrollLoading(true);
    logButtonClick(`ramadan_challenge_enroll_${section}`);
    try {
      await addReadingGoal({ category: GoalCategory.RAMADAN_CHALLENGE });
      await mutate();
      toast('Enrolled successfully! You may see a welcome email in your inbox.', {
        status: ToastStatus.Success,
      });
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'ramadan_challenge_enroll',
        metadata: { section },
      });
      toast('Failed to enroll, please try again later.', { status: ToastStatus.Error });
    } finally {
      setIsEnrollLoading(false);
    }
  };

  // Button handles isLoading natively below

  return (
    <Button
      onClick={handleEnroll}
      variant={isDisabled ? ButtonVariant.Ghost : ButtonVariant.Shadow}
      isLoading={isEnrollLoading || isLoading}
      isDisabled={isDisabled}
      aria-live="polite"
      className={styles.button}
      {...rest}
    >
      {isDisabled ? subscribedText : enrollText}
    </Button>
  );
};

export default EnrollButton;
