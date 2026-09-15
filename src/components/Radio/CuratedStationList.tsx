import React, { useCallback, useContext, useMemo } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import Card, { CardSize } from '../dls/Card/Card';

import styles from './CuratedStationList.module.scss';
import curatedStationsMap from './curatedStations';
import { CuratedStation, StationType } from './types';

import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import { logEvent } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

type CuratedStationListProps = {
  stations?: [string, CuratedStation][];
  className?: string;
};

// When one of the curated station is clicked,
// 1) Pick (randomly) one of the audioTrack listed in the station
// 2) Update the current station state in the audio machine
// 3) Play the audio
const CuratedStationList: React.FC<CuratedStationListProps> = ({
  stations,
  className,
}) => {
  const { t } = useTranslation('radio');

  const defaultStations = useMemo(() => Object.entries(curatedStationsMap), []);
  const stationEntries = stations ?? defaultStations;

  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlaying = useSelector(audioService, (state) =>
    state?.matches ? state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING') : false,
  );
  const radioActor = useSelector(audioService, (state) => state?.context?.radioActor);

  const playStation = useCallback(
    (id: string) => {
      logEvent('station_played', {
        stationId: id,
        type: StationType.Curated,
      });

      audioService.send({
        type: 'PLAY_RADIO',
        stationType: StationType.Curated,
        stationId: Number(id),
      });
    },
    [audioService],
  );

  const radioContext = radioActor?.getSnapshot ? radioActor.getSnapshot()?.context || {} : {};

  return (
    <div className={styles.container}>
      {stationEntries.map(([id, station]) => {
        const isSelectedStation =
          radioContext.type === StationType.Curated && radioContext.id === Number(id);

        const handleAction = () => {
          if (!isSelectedStation) {
            playStation(id);
          } else {
            audioService.send('TOGGLE');
          }
        };

        const actionIcon = isSelectedStation && isAudioPlaying ? <PauseIcon /> : <PlayIcon />;
        const actionLabel =
          isSelectedStation && isAudioPlaying
            ? t('common:audio.pause')
            : t('common:audio.play');

        return (
          <div className={styles.item} key={id}>
            <Card
              shouldFlipIconOnRTL={false}
              actionIcon={actionIcon}
              imgSrc={station.bannerImgSrc}
              size={CardSize.Large}
              tooltip={actionLabel}
              ariaLabel={actionLabel}
              title={t(`curated-station.${station.title}`)}
              imgAlt={t(`curated-station.${station.title}`)}
              description={t(`curated-station.${station.description}`)}
              onImgClick={handleAction}
              onActionIconClick={handleAction}
            />
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CuratedStationList);

