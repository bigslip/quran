import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/icons/arrow.svg';
import DiamondIcon from '@/icons/diamond.svg';
import StarIcon from '@/public/icons/star.svg';
import { ROUTES } from '@/utils/navigation';

interface RamadanCardProps {
  onClick: () => void;
}

const RamadanCard: React.FC<RamadanCardProps> = ({ onClick }) => {
  const { t } = useTranslation('home');

  return (
    <Card
      className={classNames(styles.card, styles.ramadanCard)}
      link={ROUTES.RAMADAN_2026}
      isNewTab
      linkClassName={styles.link}
      onClick={onClick}
    >
      <div className={styles.cardContent}>
        <div className={styles.ramadanHeader}>
          <div className={styles.diamondBadge}>
            <DiamondIcon className={styles.ramadanIcon} />
          </div>
          <div className={styles.eventTag}>
            <StarIcon className={styles.sparkleIcon} />
            <span>{t('ramadan-event-tag', { defaultValue: 'Ramadan 2026' })}</span>
          </div>
        </div>
        <div className={styles.ramadanBody}>
          <h3 className={styles.ramadanTitle}>
            {t('ramadan-event-title', { defaultValue: 'Discover Ramadan Activities!' })}
          </h3>
          <p className={styles.ramadanDescription}>
            {t('ramadan-event-desc', {
              defaultValue: 'Tools & content to stay engaged and spiritually uplifted all month',
            })}
          </p>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.exploreLink}>
            {t('common:learn-more', { defaultValue: 'Explore Activities' })}
          </span>
          <IconContainer
            size={IconSize.Xsmall}
            icon={<ArrowIcon />}
            shouldForceSetColors={false}
            className={classNames(styles.arrowIcon, styles.ramadanArrowIcon)}
          />
        </div>
      </div>
    </Card>
  );
};

export default React.memo(RamadanCard);
