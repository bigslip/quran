import React from 'react';

import * as RadixProgress from '@radix-ui/react-progress';
import classnames from 'classnames';

import useDirection from '@/hooks/useDirection';

import styles from './Progress.module.scss';

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixProgress.Root>, 'value'> {
  value: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, size = 'medium', className, ...props }) => {
  const direction = useDirection();
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value || 0));

  const translateX = direction === 'rtl' ? 100 - clampedValue : -(100 - clampedValue);

  return (
    <RadixProgress.Root
      className={classnames(styles.root, className)}
      value={clampedValue}
      data-size={size}
      dir={direction}
      {...props}
    >
      <RadixProgress.Indicator
        className={styles.indicator}
        style={{ transform: `translateX(${translateX}%)` }}
      />
    </RadixProgress.Root>
  );
};

export default Progress;
