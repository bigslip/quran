import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import { HeadlessServiceProvider } from '../Notifications/hooks/useHeadlessService';

import styles from './EnrollButton.module.scss';
import EnrollButtonNotification from './EnrollButtonNotification';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useRamadanChallengeStatus from '@/hooks/useGetRamadanChallengeStatus';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  section: string;
}

const UnauthEnrollButton = ({ section, ...rest }: Props) => {
  const { t } = useTranslation('ramadan-activities');
  const router = useRouter();
  const { isLoggedIn } = useIsLoggedIn();
  const { isLoading, isEnrolled, mutate } = useRamadanChallengeStatus();

  const rawSubscribedText = t('subscribed');
  const subscribedText =
    rawSubscribedText === 'subscribed' ? 'Subscribed!' : rawSubscribedText;
  const rawEnrollText = t('join-surah-mulk-challenge');
  const enrollText =
    rawEnrollText === 'join-surah-mulk-challenge'
      ? 'Join the Surah Al-Mulk Challenge'
      : rawEnrollText;

  const onButtonClicked = () => {
    logButtonClick(`guest_ramadan_challenge_${section}`);
  };

  // Spinner is handled natively by Button inside the return or inside EnrollButtonNotification

  if (isLoggedIn) {
    return (
      <HeadlessServiceProvider>
        <EnrollButtonNotification
          isEnrolled={isEnrolled}
          isLoading={isLoading}
          mutate={mutate}
          section={section}
          subscribedText={subscribedText}
          enrollText={enrollText}
          {...rest}
        />
      </HeadlessServiceProvider>
    );
  }

  return (
    <Button
      onClick={onButtonClicked}
      href={getLoginNavigationUrl(router.asPath)}
      variant={ButtonVariant.Shadow}
      isLoading={isLoading}
      className={styles.button}
      {...rest}
    >
      {enrollText}
    </Button>
  );
};

export default UnauthEnrollButton;
