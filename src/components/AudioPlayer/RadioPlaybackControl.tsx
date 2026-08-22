import React from 'react';
import classNames from 'classnames';

import { useActor } from '@xstate/react';

import CloseRadioButton from './Buttons/CloseRadioButton';
import PlayPauseButton from './Buttons/PlayPauseButton';
import styles from './RadioPlaybackControl.module.scss';

import useCurrentStationInfo from 'src/xstate/Radio/useCurrentStationInfo';

interface RadioPlaybackControlProps extends React.HTMLAttributes<HTMLDivElement> {
  radioActor: any;
}

const RadioPlaybackControl = ({ radioActor, className, ...props }: RadioPlaybackControlProps) => {
  const [radioService] = useActor(radioActor);
  const stationInfo = useCurrentStationInfo((radioService as any).context);
  return (
    <div className={classNames(className, styles.container)} {...props}>
      <div className={styles.infoContainer}>
        <div className={styles.title}>{stationInfo.title}</div>
        <div className={styles.description}>{stationInfo.description}</div>
      </div>
      <div className={styles.actions}>
        <PlayPauseButton />
        <CloseRadioButton />
      </div>
    </div>
  );
};

export default RadioPlaybackControl;
