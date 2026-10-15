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

export const GradualSpacing: React.FC<GradualSpacingProps> = React.memo(({
  text,
  duration = 0.5,
  delayMultiple = 0.035,
  className,
  containerClassName,
  as: Component = 'div',
}) => {
  // Cursive scripts (Persian, Arabic, Urdu, etc.) break ligature connections if split into characters.
  // When cursive script is detected, animate word-by-word instead of character-by-character.
  const isCursiveScript = useMemo(() => {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  }, [text]);

  const words = useMemo(() => {
    return isCursiveScript ? text.split(' ') : [];
  }, [isCursiveScript, text]);

  const characters = useMemo(() => {
    return !isCursiveScript ? text.split('') : [];
  }, [isCursiveScript, text]);

  return (
    <Component
      className={classNames(styles.gradualContainer, containerClassName)}
      aria-label={text}
      suppressHydrationWarning
    >
      {isCursiveScript
        ? words.map((word, index) => (
            <React.Fragment key={`word-fragment-${index}-${word}`}>
              <span
                className={classNames(styles.char, styles.word, className)}
                style={{
                  animationDuration: `${duration}s`,
                  animationDelay: `${index * delayMultiple * 2.5}s`,
                }}
                data-testid="gradual-word"
                aria-hidden="true"
              >
                {word}
              </span>
              {index < words.length - 1 && (
                <span
                  key={`space-${index}`}
                  className={styles.space}
                  aria-hidden="true"
                >
                  &nbsp;
                </span>
              )}
            </React.Fragment>
          ))
        : characters.map((char, index) => {
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
});

export default GradualSpacing;
