import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';
import QuranReflectCard from './QuranReflectCard';
import RamadanCard from './RamadanCard';

import { TestId } from '@/tests/test-ids';
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';

const CommunitySection = () => {
  const { lang, t } = useTranslation('home');

  const onQRCardClicked = () => {
    logButtonClick('homepage_community_qr_card');
  };

  const onRamadanCardClicked = () => {
    logButtonClick('homepage_community_ramadan_card');
  };

  return (
    <section className={styles.section} aria-label={t('common:community.title')}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>{t('common:community.title')}</h2>
          <span className={styles.headerSubtitle}>
            {t('home:community-subtitle', {
              defaultValue: 'Connect, reflect, and share insights with the global Ummah',
            })}
          </span>
        </div>
      </div>
      <div className={styles.cardsContainer} data-testid={TestId.COMMUNITY_SECTION}>
        {lang === Language.EN && <RamadanCard onClick={onRamadanCardClicked} />}
        <QuranReflectCard onClick={onQRCardClicked} />
      </div>
    </section>
  );
};

export default CommunitySection;
