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
      {/* Top Islamic Arch Crown */}
      <svg
        className={styles.topArchCrown}
        viewBox="0 0 440 60"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-top-crest"
      >
        <path d="M 0,60 C 90,60 150,40 185,20 C 205,8 215,0 220,0 C 225,0 235,8 255,20 C 290,40 350,60 440,60 Z" />
      </svg>

      {/* Honeycomb Grid Tapestry */}
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

      {/* Bottom Islamic Arch Notch */}
      <svg
        className={styles.bottomArchNotch}
        viewBox="0 0 220 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-bottom-crest"
      >
        <path d="M 0,0 C 60,0 90,12 110,24 C 130,12 160,0 220,0 Z" />
      </svg>
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
