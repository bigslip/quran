import React from 'react';

import * as RadixProgress from '@radix-ui/react-progress';
import classnames from 'classnames';

import styles from './Progress.module.scss';

export interface ProgressProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, size = 'medium', className }) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value || 0));

  return (
    <RadixProgress.Root
      className={classnames(styles.root, className)}
      value={clampedValue}
      data-size={size}
    >
      <RadixProgress.Indicator
        className={styles.indicator}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </RadixProgress.Root>
  );
};

export default Progress;
