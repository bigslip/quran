import React, { useMemo } from 'react';

import classNames from 'classnames';

import styles from './LoadingState.module.scss';

const CHEVRON_DELAYS = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3);
  const c = i % 3;
  return (c + Math.abs(r - 1)) * 90;
});

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const ORBIT_DELAYS = Array.from({ length: 9 }, (_, i) => {
  const k = ORBIT_ORDER.indexOf(i);
  return k === -1 ? null : k * 110;
});

export type LoadingStateVariant = 'Drive' | 'Dots' | 'Orbit';

const PATTERNS: Record<
  LoadingStateVariant,
  { delays: (number | null)[]; dur: number; round: boolean }
> = {
  Drive: { delays: CHEVRON_DELAYS, dur: 650, round: false },
  Dots: { delays: CHEVRON_DELAYS, dur: 650, round: true },
  Orbit: { delays: ORBIT_DELAYS, dur: 950, round: false },
};

export interface LoadingStateProps {
  label?: string;
  variant?: LoadingStateVariant;
  className?: string;
  labelClassName?: string;
  showGrid?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading...',
  variant = 'Drive',
  className,
  labelClassName,
  showGrid = true,
}) => {
  const pattern = useMemo(() => PATTERNS[variant] ?? PATTERNS.Drive, [variant]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames(styles.loadingContainer, className)}
    >
      {label && (
        <span className={classNames(styles.label, labelClassName)}>
          {label}
        </span>
      )}
      {showGrid && (
        <span aria-hidden="true" className={styles.grid}>
          {pattern.delays.map((delay, index) => (
            <span
              key={`pixel-${index}`}
              className={classNames(styles.pixel, {
                [styles.round]: pattern.round,
              })}
              style={{
                opacity: delay === null ? 0.08 : 0.18,
                animation:
                  delay === null
                    ? 'none'
                    : `${styles.pixelOn || 'pixelOn'} ${pattern.dur}ms ease-in-out ${delay}ms infinite`,
              }}
            />
          ))}
        </span>
      )}
    </div>
  );
};

export default React.memo(LoadingState);
