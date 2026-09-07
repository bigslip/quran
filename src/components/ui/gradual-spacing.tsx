import React, { useMemo } from 'react';

import classNames from 'classnames';

import styles from './gradual-spacing.module.scss';

export interface GradualSpacingProps {
  text: string;
  duration?: number;
  delayMultiple?: number;
  className?: string;
  containerClassName?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export const GradualSpacing: React.FC<GradualSpacingProps> = ({
  text,
  duration = 0.5,
  delayMultiple = 0.035,
  className,
  containerClassName,
  as: Component = 'div',
}) => {
  const characters = useMemo(() => text.split(''), [text]);

  return (
    <Component
      className={classNames(styles.gradualContainer, containerClassName)}
      aria-label={text}
    >
      {characters.map((char, index) => {
        if (char === ' ') {
          return (
            <span
              key={`space-${index}`}
              className={styles.space}
              aria-hidden="true"
            >
              &nbsp;
            </span>
          );
        }

        return (
          <span
            key={`char-${index}-${char}`}
            className={classNames(styles.char, className)}
            style={{
              animationDuration: `${duration}s`,
              animationDelay: `${index * delayMultiple}s`,
            }}
            aria-hidden="true"
          >
            {char}
          </span>
        );
      })}
    </Component>
  );
};

export default GradualSpacing;
