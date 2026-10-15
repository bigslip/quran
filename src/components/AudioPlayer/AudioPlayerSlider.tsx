import React, { useContext } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import styles from './AudioPlayerSlider.module.scss';

import Slider, { Direction, SliderVariant } from '@/dls/Slider';
import useDirection from '@/hooks/useDirection';
import { secondsFormatter } from '@/utils/datetime';
import { logEvent } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface AudioPlayerSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  isEmbedded?: boolean;
}

const AudioPlayerSlider = ({ isEmbedded, className, ...props }: AudioPlayerSliderProps): JSX.Element => {
  const router = useRouter();
  const { locale } = router;
  const direction = useDirection();

  const audioService = useContext(AudioPlayerMachineContext);
  const elapsed = useSelector(audioService, (state) => state.context.elapsed);
  const downloadProgress = useSelector(audioService, (state) => state.context.downloadProgress);
  const duration = useSelector(audioService, (state) => state.context.duration);

  const sliderContainerClass = classNames(styles.sliderContainer, {
    [styles.embeddedSliderContainer]: isEmbedded,
  });

  return (
    <div className={classNames(className, styles.container)} {...props}>
      <span className={styles.currentTime} data-testid="audio-elapsed">
        {secondsFormatter(elapsed, locale)}
      </span>
      <div className={sliderContainerClass}>
        <Slider
          showThumbs={false}
          variant={SliderVariant.Secondary}
          label="audio-player-download"
          value={[downloadProgress]}
          onValueChange={([newTimestamp]) => {
            logEvent('audio_player_slider_value_change');
            audioService.send({ type: 'SEEK_TO', timestamp: newTimestamp });
          }}
          max={duration}
          direction={direction as Direction}
          withBackground
        />
      </div>
      <div className={sliderContainerClass}>
        <Slider
          label="audio-player-seek"
          value={[elapsed]}
          onValueChange={([newTimestamp]) => {
            logEvent('audio_player_slider_value_change');
            audioService.send({ type: 'SEEK_TO', timestamp: newTimestamp });
          }}
          max={duration}
          direction={direction as Direction}
        />
      </div>
      <span className={styles.remainingTime}>{secondsFormatter(duration, locale)}</span>
    </div>
  );
};

export default AudioPlayerSlider;
