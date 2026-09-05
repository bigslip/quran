import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/icons/arrow.svg';
import DiamondIcon from '@/icons/diamond.svg';
import QRColoredIcon from '@/icons/qr-colored.svg';
import QRLogoIcon from '@/icons/qr-logo.svg';
import Language from '@/types/Language';
import { getQRNavigationUrl } from '@/utils/quranReflect/navigation';

interface QuranReflectCardProps {
  onClick: () => void;
}

const QuranReflectCard: React.FC<QuranReflectCardProps> = ({ onClick }) => {
  const { lang, t } = useTranslation('home');

  return (
    <Card
      className={classNames(styles.card, styles.reflectionCard, {
        [styles.fullWidthCard]: lang !== Language.EN,
      })}
      link={getQRNavigationUrl()}
      isNewTab
      linkClassName={styles.link}
      onClick={onClick}
    >
      <div className={styles.cardContent}>
        <div className={styles.reflectionHeader}>
          <div className={styles.brandRow}>
            <QRColoredIcon className={styles.coloredIcon} />
            <QRLogoIcon className={styles.logoIcon} />
          </div>
          <span className={styles.verseRefPill}>
            <DiamondIcon className={styles.pillIcon} />
            {t('home:featured-reflections', { defaultValue: 'Daily Reflection' })}
          </span>
        </div>

        <div className={styles.quoteBody}>
          <blockquote className={styles.quoteText}>&ldquo;{t('qr-community')}&rdquo;</blockquote>
        </div>

        <div className={styles.reflectionFooter}>
          <div className={styles.authorAttribution}>
            <div className={styles.authorAvatar}>QR</div>
            <div className={styles.authorMeta}>
              <span className={styles.authorName}>
                {t('home:qr-community-name', { defaultValue: 'QuranReflect Community' })}
              </span>
              <span className={styles.authorStatus}>
                {t('home:qr-community-subtitle', {
                  defaultValue: 'Global Quran Reflections',
                })}
              </span>
            </div>
          </div>
          <div className={styles.actionPrompt}>
            <span className={styles.actionText}>
              {t('common:read', { defaultValue: 'Read reflections' })}
            </span>
            <IconContainer
              size={IconSize.Xsmall}
              icon={<ArrowIcon />}
              shouldForceSetColors={false}
              className={styles.arrowIcon}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(QuranReflectCard);
