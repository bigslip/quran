import React from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './RecitersList.module.scss';

import Link from '@/dls/Link/Link';
import { makeCDNUrl } from '@/utils/cdn';
import { getReciterNavigationUrl } from '@/utils/navigation';
import Reciter from 'types/Reciter';

type RecitersListProps = {
  reciters: Reciter[];
} & React.HTMLAttributes<HTMLDivElement>;

const getInitials = (name: string): string => {
  const clean = name.replace(/^(استاد|الشیخ|القارئ|Sheikh|Qari|Ustad|Ostadh)\s+/i, '').trim();
  return clean.charAt(0) || name.charAt(0) || '?';
};

const RecitersList: React.FC<RecitersListProps> = ({ reciters, className, ...props }) => {
  const { t } = useTranslation('reciter');

  return (
    <div className={classNames(styles.container, className)} {...props}>
      {reciters.map((reciter) => {
        const isAvailable = Boolean(reciter.isAvailable ?? reciter.hasAudio ?? false);
        const reciterName = reciter.translatedName?.name || reciter.name;
        const reciterStyle = reciter.style?.name || '';
        const profilePicUrl = reciter.profilePicture ? makeCDNUrl(reciter.profilePicture) : null;
        const initialLetter = getInitials(reciterName);

        const cardContent = (
          <div
            className={classNames(styles.reciterCard, {
              [styles.availableCard]: isAvailable,
              [styles.disabledCard]: !isAvailable,
            })}
            aria-disabled={!isAvailable}
            title={!isAvailable ? t('reciter:unavailable-tooltip') : undefined}
          >
            <div className={styles.imageWrapper}>
              {profilePicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePicUrl}
                  alt={reciterName}
                  className={styles.reciterImage}
                  loading="lazy"
                />
              ) : (
                <div className={styles.avatarFallback}>
                  <span>{initialLetter}</span>
                </div>
              )}

              {/* Status Badge */}
              <div className={styles.badgeContainer}>
                {isAvailable ? (
                  <span className={styles.availableBadge}>
                    <span className={styles.pulseDot} />
                    <span>{t('reciter:badge-available')}</span>
                  </span>
                ) : (
                  <span className={styles.comingSoonBadge}>
                    {t('reciter:badge-coming-soon')}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.infoWrapper}>
              <div className={styles.reciterName}>{reciterName}</div>
              {reciterStyle && <div className={styles.reciterStyle}>{reciterStyle}</div>}
            </div>
          </div>
        );

        if (isAvailable) {
          return (
            <Link
              key={reciter.id}
              href={getReciterNavigationUrl(reciter.id.toString())}
              className={styles.cardLink}
            >
              {cardContent}
            </Link>
          );
        }

        return (
          <div key={reciter.id} className={styles.disabledCardContainer}>
            {cardContent}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(RecitersList);

