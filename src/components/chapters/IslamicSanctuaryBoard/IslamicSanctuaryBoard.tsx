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
      {/* Top Islamic Arch Header (Continuous silhouette from surah.jpeg) */}
      <svg
        className={styles.topArchSvg}
        viewBox="0 0 1140 160"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-top-crest"
      >
        <path
          d="
            M 0,160
            L 0,90
            C 0,45 35,40 70,40
            L 320,40
            C 400,40 450,24 500,12
            C 540,2 560,0 570,0
            C 580,0 600,2 640,12
            C 690,24 740,40 820,40
            L 1070,40
            C 1105,40 1140,45 1140,90
            L 1140,160
            Z
          "
        />
      </svg>

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

      {/* Bottom Islamic Arch Notch (From surah.jpeg) */}
      <svg
        className={styles.bottomArchSvg}
        viewBox="0 0 1140 70"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-bottom-crest"
      >
        <path
          d="
            M 0,0
            L 0,25
            C 0,55 35,60 70,60
            L 490,60
            C 530,60 555,68 570,70
            C 585,68 610,60 650,60
            L 1070,60
            C 1105,60 1140,55 1140,25
            L 1140,0
            Z
          "
        />
      </svg>
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
