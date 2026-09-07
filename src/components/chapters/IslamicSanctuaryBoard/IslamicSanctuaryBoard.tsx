import React, { useMemo, useState, useEffect } from 'react';

import styles from './IslamicSanctuaryBoard.module.scss';
import PetalSurahCard from '../PetalSurahCard/PetalSurahCard';

import { chunkToHoneycomb } from '@/utils/honeycomb';
import Chapter from 'types/Chapter';

type Props = {
  chapters: Chapter[];
  mostVisitedChapters?: Record<number, boolean>;
};

// Hoist static non-primitive default prop to prevent breaking React.memo (rerender-memo-with-default-value)
const DEFAULT_MOST_VISITED: Record<number, boolean> = {};

// Hoist static SVG defs outside component to eliminate duplicate path strings and VDOM allocation (rendering-hoist-jsx)
const SHARED_SVG_DEFS = (
  <svg style={{ display: 'none', position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <path
        id="muezzin-petal-path"
        d="M0,285c0-0.67,0-1.33,0-2c8.61-5.65,15.18-13.46,21.86-21.08c12.95-14.78,24.65-30.67,38.92-44.27
          c12.39-11.81,26.05-21.27,43.81-23.07c5.21-0.53,7.8-3.85,8.14-9.17c0.14-2.32,0-4.67,0.07-7c0.61-20.09,8.49-36.79,23.69-49.91
          c13.47-11.63,29.32-16.72,47-16.55c8.94,0.08,11.26-1.9,12.49-10.58c1.22-8.56,4.35-16.37,9-23.63
          c10.24-15.99,24.68-27.83,38.95-39.88C258.17,25.84,273.4,14.89,285,0c0.33,0,0.67,0,1,0c6.55,8.74,14.71,15.85,22.97,22.88
          c15.09,12.85,31.11,24.65,44.7,39.18c10.15,10.85,18.56,22.71,21.11,37.84c1.86,11.03,3.11,11.91,14.23,12.05
          c22.71,0.29,41.49,8.96,55.43,27.06c10.02,13.02,14.41,27.95,13.81,44.42c-0.26,7.06,2.42,10.55,8.64,11.21
          c13.63,1.46,25.04,7.58,35.44,16.05c16.03,13.05,28.27,29.59,41.62,45.12c8.35,9.71,16.32,19.82,27.04,27.18c0,0.67,0,1.33,0,2
          c-3.95,2-6.83,5.29-9.91,8.32c-14.07,13.8-25.61,29.82-38.79,44.4c-15.6,17.24-31.93,33.31-56.87,35.93
          c-4.4,0.46-6.9,3.84-7.16,8.41c-0.14,2.49,0.01,5-0.07,7.5c-0.6,20.1-8.54,36.79-23.69,49.92c-13.73,11.91-29.96,16.89-48,16.59
          c-7.18-0.12-10.55,2.32-11.23,8.56c-1.41,12.92-7.15,23.81-15.07,33.76c-9.61,12.09-21.44,21.85-33.15,31.75
          c-14.23,12.03-29.54,22.9-41.07,37.86c-0.33,0-0.67,0-1,0c-6.7-8.83-14.98-16.06-23.36-23.19c-15.09-12.85-31.09-24.66-44.67-39.22
          c-10.99-11.78-19.64-24.78-21.33-41.43c-0.53-5.23-3.87-7.84-9.15-8.09c-1.83-0.09-3.67,0.06-5.5-0.01
          c-27.59-1.15-48.35-13.34-61.23-38.08c-5.52-10.6-7.38-21.98-7.04-33.87c0.19-6.69-2.56-10.1-8.63-10.75
          c-13.62-1.47-25.03-7.59-35.44-16.06c-16.04-13.04-28.3-29.56-41.61-45.12C18.72,302.43,10.67,292.41,0,285z"
      />
    </defs>
  </svg>
);

// Hoist static top and bottom crests outside render cycle (rendering-hoist-jsx)
const TOP_ARCH_CREST = (
  <div className={styles.topShapeWrapper}>
    <svg
      className={styles.topArchSvg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 526.16 123"
      aria-hidden="true"
      data-testid="sanctuary-top-crest"
    >
      <g>
        <path d="M526.24,211.95c0,77.96-0.02,155.92,0.08,233.88c0,3.17-0.29,4.23-3.96,4.22c-172.75-0.12-345.49-0.12-518.24,0
          c-3.67,0-3.96-1.06-3.96-4.23c0.1-78.29,0.08-156.59,0.08-234.88c7.78-21.03,24-30.67,45.27-33.16c4.2-0.49,4.67-2.73,4.73-6.06
          c0.39-22.14,11.45-37.76,30.17-48.43c13.24-7.55,27.66-10.46,42.81-9.64c3.82,0.21,6.11-0.96,7.84-4.54
          c12.26-25.31,31.61-43.43,56.98-55.22c10.88-5.06,22.06-9.46,32.54-15.35c17.31-9.75,33.26-21.04,43.66-38.6c0.33,0,0.67,0,1,0
          c5.68,10.26,13.77,18.33,22.99,25.38c13.75,10.51,28.97,18.42,44.9,24.92c29.09,11.87,51.54,30.88,65.42,59.38
          c1.45,2.98,3.4,4.05,6.67,3.91c8.56-0.36,16.95,0.89,25.16,3.31c27.38,8.06,46.93,30.09,45.2,55.68c-0.25,3.63,1.71,4.76,5.12,5.2
          C502.31,180.5,518.75,190.31,526.24,211.95z" />
      </g>
    </svg>
  </div>
);

const BOTTOM_ARCH_NOTCH = (
  <div className={styles.bottomShapeWrapper}>
    <svg
      className={styles.bottomArchSvg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 83 38"
      aria-hidden="true"
      data-testid="sanctuary-bottom-crest"
    >
      <g>
        <path d="M42.77,37.91c-0.33,0-0.67,0-1,0c-5.51-9.23-12.67-16.99-21.09-23.64C6.23,2.85-9.99-5.49-26.94-12.48
          c-28.58-11.79-50.78-30.5-64.38-58.6c-1.51-3.11-3.5-4.42-6.99-4.24c-6.47,0.34-12.94,0.09-19.37-1.04
          c-25.4-4.45-54.52-23.14-54.18-57.99c0.04-3.83-2.18-4.46-5.41-4.83c-14.01-1.59-26.18-6.99-35.82-17.62
          c-4.84-5.34-6.98-11.96-9.64-18.37c0-6.31,0-12.61,0-18.92c2.66-0.11,5.31-0.31,7.97-0.31c169.97-0.01,339.95-0.01,509.92-0.01
          c1.66,0,3.33,0.07,4.99,0.04c2.63-0.04,3.97,1.18,4.15,3.84c0.63,9.8-0.46,19.27-5.78,27.79c-9.04,14.48-22.88,21.35-39.25,23.42
          c-5.14,0.65-6.84,2.36-6.65,7.42c0.48,12.33-3.79,23.19-11.83,32.41c-15.25,17.49-35.2,24.24-57.83,24.28
          c-3.65,0.01-5.74,1.04-7.38,4.38c-13.51,27.48-35.1,46.26-63.24,57.85c-9.24,3.8-18.27,8.04-26.96,12.94
          C68.44,9.5,52.68,20.46,42.77,37.91z" />
      </g>
    </svg>
  </div>
);

const SSR_DEFAULT_PATTERN = [6, 7];

const getHoneycombPattern = (): number[] => {
  if (typeof window === 'undefined') return SSR_DEFAULT_PATTERN;
  if (window.innerWidth < 640) return [1, 2];
  if (window.innerWidth < 1024) return [3, 4];
  if (window.innerWidth < 1280) return [4, 5];
  return [6, 7];
};

const IslamicSanctuaryBoard: React.FC<Props> = ({
  chapters,
  mostVisitedChapters = DEFAULT_MOST_VISITED,
}) => {
  // Always initialize to SSR_DEFAULT_PATTERN to prevent SSR/client hydration mismatch (rendering-hydration-no-flicker)
  const [pattern, setPattern] = useState<number[]>(SSR_DEFAULT_PATTERN);

  // Use matchMedia queries when available, with passive resize listener fallback (client-event-listeners)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updatePattern = () => {
      setPattern(getHoneycombPattern());
    };

    updatePattern();

    if (typeof window.matchMedia === 'function') {
      const mediaMobile = window.matchMedia('(max-width: 639px)');
      const mediaTablet = window.matchMedia('(min-width: 640px) and (max-width: 1023px)');
      const mediaDesktop = window.matchMedia('(min-width: 1024px) and (max-width: 1279px)');
      const mediaWide = window.matchMedia('(min-width: 1280px)');

      mediaMobile.addEventListener?.('change', updatePattern);
      mediaTablet.addEventListener?.('change', updatePattern);
      mediaDesktop.addEventListener?.('change', updatePattern);
      mediaWide.addEventListener?.('change', updatePattern);

      return () => {
        mediaMobile.removeEventListener?.('change', updatePattern);
        mediaTablet.removeEventListener?.('change', updatePattern);
        mediaDesktop.removeEventListener?.('change', updatePattern);
        mediaWide.removeEventListener?.('change', updatePattern);
      };
    }

    window.addEventListener('resize', updatePattern, { passive: true });
    return () => window.removeEventListener('resize', updatePattern);
  }, []);

  const rows = useMemo(() => chunkToHoneycomb(chapters, pattern), [chapters, pattern]);

  return (
    <div className={styles.sanctuaryBoard} data-testid="islamic-sanctuary-board">
      {SHARED_SVG_DEFS}

      {/* Top Islamic Arch Header */}
      {TOP_ARCH_CREST}

      {/* Main Sanctuary Body with Honeycomb Tapestry */}
      <div className={styles.boardBody}>
        <div className={styles.honeycombGrid}>
          {rows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className={styles.honeycombRow}
              data-testid={`honeycomb-row-${rowIndex}`}
            >
              {row.map((chapter) => (
                <PetalSurahCard
                  key={chapter.id}
                  chapter={chapter}
                  isPreload={mostVisitedChapters[Number(chapter.id)] === true}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Islamic Arch Notch */}
      {BOTTOM_ARCH_NOTCH}
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);

