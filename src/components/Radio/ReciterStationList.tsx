import React, { useContext } from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from '@xstate/react';

import styles from './ReciterStationList.module.scss';
import { StationType } from './types';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import { makeCDNUrl } from '@/utils/cdn';
import { logEvent } from '@/utils/eventLogger';
import { getReciterNavigationUrl } from '@/utils/navigation';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Reciter from 'types/Reciter';

const getInitials = (name: string): string => {
  const clean = name.replace(/^(استاد|الشیخ|القارئ|Sheikh|Qari|Ustad|Ostadh)\s+/i, '').trim();
  return clean.charAt(0) || name.charAt(0) || '?';
};

type ReciterStationListProps = {
  reciters: Reciter[];
} & React.HTMLAttributes<HTMLDivElement>;

const ReciterStationList: React.FC<ReciterStationListProps> = ({ reciters, className, ...props }) => {
  const { t } = useTranslation('radio');
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlaying = useSelector(audioService, (state) =>
    state?.matches ? state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING') : false,
  );

  const radioActor = useSelector(audioService, (state) => state?.context?.radioActor);
  const radioContext = radioActor?.getSnapshot ? radioActor.getSnapshot()?.context || {} : {};

  return (
    <div className={classNames(styles.container, className)} {...props}>
      {reciters.map((reciter) => {
        const isAvailable = Boolean(reciter.isAvailable ?? reciter.hasAudio ?? false);
        const reciterName = reciter.translatedName?.name || reciter.name;
        const reciterStyle = reciter.style?.name || '';
        const profilePicUrl = reciter.profilePicture ? makeCDNUrl(reciter.profilePicture) : null;
        const initialLetter = getInitials(reciterName);

        const isSelectedStation =
          radioContext.type === StationType.Reciter && Number(radioContext.id) === reciter.id;

        const handlePlayStation = () => {
          if (!isAvailable) return;
          if (!isSelectedStation) {
            logEvent('station_played', {
              stationId: reciter.id,
              type: StationType.Reciter,
            });
            audioService.send({
              type: 'PLAY_RADIO',
              stationType: StationType.Reciter,
              stationId: reciter.id,
            });
          } else {
            audioService.send('TOGGLE');
          }
        };

        const isStationPlaying = isSelectedStation && isAudioPlaying;
        const actionIcon = isStationPlaying ? <PauseIcon /> : <PlayIcon />;

        return (
          <div
            key={reciter.id}
            className={classNames(styles.stationCard, {
              [styles.availableCard]: isAvailable,
              [styles.disabledCard]: !isAvailable,
              [styles.activeStation]: isSelectedStation,
            })}
            aria-disabled={!isAvailable}
            title={!isAvailable ? t('radio:unavailable-tooltip') : undefined}
          >
            <div
              className={styles.imageWrapper}
              onClick={isAvailable ? handlePlayStation : undefined}
              role={isAvailable ? 'button' : undefined}
              tabIndex={isAvailable ? 0 : -1}
              onKeyDown={(e) => {
                if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handlePlayStation();
                }
              }}
            >
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
                    <span>{t('radio:badge-live')}</span>
                  </span>
                ) : (
                  <span className={styles.comingSoonBadge}>
                    {t('radio:badge-coming-soon')}
                  </span>
                )}
              </div>

              {/* Play Overlay */}
              {isAvailable && (
                <div
                  className={classNames(styles.playOverlay, {
                    [styles.playOverlayActive]: isStationPlaying,
                  })}
                >
                  <Button
                    shape={ButtonShape.Circle}
                    variant={ButtonVariant.Ghost}
                    className={styles.playButton}
                    ariaLabel={
                      isStationPlaying ? t('common:audio.pause') : t('common:audio.play')
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayStation();
                    }}
                  >
                    {actionIcon}
                  </Button>
                </div>
              )}
            </div>

            <div className={styles.infoWrapper}>
              <div className={styles.reciterName}>
                {isAvailable ? (
                  <Link
                    href={getReciterNavigationUrl(reciter.id.toString())}
                    className={styles.reciterLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {reciterName}
                  </Link>
                ) : (
                  reciterName
                )}
              </div>
              {reciterStyle && <div className={styles.reciterStyle}>{reciterStyle}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ReciterStationList);

