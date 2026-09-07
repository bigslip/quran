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
      {/* Top Islamic Arch Header (Exact 1:1 silhouette from surah.jpeg) */}
      <svg
        className={styles.topArchSvg}
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-top-crest"
      >
        <path
          d="
            M 0,240
            L 0,195
            C 0,140 45,120 92,120
            L 488,120
            C 498,120 508,112 516,99.5
            C 526,82 541,61 562,43.4
            C 582,25.5 597,5 600,0
            C 603,5 618,25.5 638,43.4
            C 659,61 674,82 684,99.5
            C 692,112 702,120 712,120
            L 1108,120
            C 1155,120 1200,140 1200,195
            L 1200,240
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

      {/* Bottom Islamic Arch Notch (Exact 1:1 silhouette from surah.jpeg) */}
      <svg
        className={styles.bottomArchSvg}
        viewBox="0 0 1200 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-bottom-crest"
      >
        <path
          d="
            M 0,0
            L 0,45
            C 0,95 45,120 92,120
            L 488,120
            C 520,120 545,135 565,150
            C 585,165 597,180 600,180
            C 603,180 615,165 635,150
            C 655,135 680,120 712,120
            L 1108,120
            C 1155,120 1200,95 1200,45
            L 1200,0
            Z
          "
        />
      </svg>
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
