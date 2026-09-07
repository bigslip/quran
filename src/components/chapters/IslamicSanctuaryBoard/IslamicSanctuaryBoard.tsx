import React, { useMemo, useState, useEffect } from 'react';

import styles from './IslamicSanctuaryBoard.module.scss';
import PetalSurahCard from '../PetalSurahCard/PetalSurahCard';

import { chunkToHoneycomb } from '@/utils/honeycomb';
import Chapter from 'types/Chapter';

type Props = {
  chapters: Chapter[];
  mostVisitedChapters?: Record<number, boolean>;
};

const getHoneycombPattern = (): number[] => {
  if (typeof window === 'undefined') return [3, 4];
  if (window.innerWidth < 640) return [1, 2];
  if (window.innerWidth < 1024) return [3, 2];
  return [3, 4];
};

const IslamicSanctuaryBoard: React.FC<Props> = ({ chapters, mostVisitedChapters = {} }) => {
  const [pattern, setPattern] = useState<number[]>([3, 4]);

  useEffect(() => {
    const updatePattern = () => {
      setPattern(getHoneycombPattern());
    };
    updatePattern();
    window.addEventListener('resize', updatePattern, { passive: true });
    return () => window.removeEventListener('resize', updatePattern);
  }, []);

  const rows = useMemo(() => chunkToHoneycomb(chapters, pattern), [chapters, pattern]);

  return (
    <div className={styles.sanctuaryBoard} data-testid="islamic-sanctuary-board">
      {/* Top Islamic Arch Header (Exact 1:1 Muezzin Theme Shape) */}
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

      {/* Bottom Islamic Arch Notch (Exact 1:1 Muezzin Theme Shape) */}
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
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
