import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AnnouncementPill.module.scss';

import Link from '@/dls/Link/Link';
import ArrowIcon from '@/public/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { ROUTES } from '@/utils/navigation';

type Props = {
  text?: string;
  link?: string;
};

const AnnouncementPill: React.FC<Props> = ({ text, link = ROUTES.RAMADAN_CHALLENGE }) => {
  const { t } = useTranslation('home');

  const handleClick = useCallback(() => {
    logButtonClick('homepage_ribbon_announcement_click');
  }, []);

  const label = text || t('ramadan-challenge', { defaultValue: 'Ramadan Challenge' });

  return (
    <Link
      href={link}
      onClick={handleClick}
      className={styles.announcementPill}
      data-testid="announcement-pill"
    >
      <span className={styles.sparkleIcon}>✨</span>
      <span className={styles.labelText}>{label}</span>
      <ArrowIcon className={styles.arrowIcon} />
    </Link>
  );
};

export default React.memo(AnnouncementPill);
