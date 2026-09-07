import React from 'react';

import classNames from 'classnames';

import styles from './elegant-dark-pattern.module.scss';

export interface ElegantDarkPatternProps {
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showStreaks?: boolean;
  showDotMatrix?: boolean;
  showRadialHighlight?: boolean;
}

export const ElegantDarkPattern: React.FC<ElegantDarkPatternProps> = ({
  children,
  className,
  contentClassName,
  showStreaks = true,
  showDotMatrix = true,
  showRadialHighlight = true,
}) => {
  return (
    <div className={classNames(styles.patternContainer, className)}>
      <div className={styles.backdropLayer} aria-hidden="true">
        <div className={styles.radialBase}>
          {showStreaks && (
            <>
              {/* Skewed celestial cyan, emerald, and gold light streaks */}
              <div className={classNames(styles.streak, styles.streak1)} />
              <div className={classNames(styles.streak, styles.streak2, styles.emeraldStreak)} />
              <div className={classNames(styles.streak, styles.streak3, styles.goldStreak)} />
              <div className={classNames(styles.streak, styles.streak4)} />
              <div className={classNames(styles.streak, styles.streak5, styles.emeraldStreak)} />
            </>
          )}
        </div>

        {/* Fine Star / Dot Matrix Overlay */}
        {showDotMatrix && <div className={styles.dotMatrix} />}

        {/* Specular Ambient Radial Highlight */}
        {showRadialHighlight && <div className={styles.radialHighlight} />}
      </div>

      {/* Foreground Content */}
      <div className={classNames(styles.contentContainer, contentClassName)}>{children}</div>
    </div>
  );
};

// Aliases for 21st.dev compatibility
export const DarkGradientBg = ElegantDarkPattern;
export default ElegantDarkPattern;
