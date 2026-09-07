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
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-top-crest"
      >
        <path
          d="
            M 0,220
            L 0,165
            C 0,115 45,90 95,90
            L 380,90
            C 415,90 435,78 450,60
            C 475,30 520,18 565,8
            C 585,3 597,0 600,0
            C 603,0 615,3 635,8
            C 680,18 725,30 750,60
            C 765,78 785,90 820,90
            L 1105,90
            C 1155,90 1200,115 1200,165
            L 1200,220
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
        viewBox="0 0 1200 90"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-bottom-crest"
      >
        <path
          d="
            M 0,0
            L 0,35
            C 0,65 45,90 95,90
            L 490,90
            C 530,90 565,102 585,114
            C 595,120 600,128 600,128
            C 600,128 605,120 615,114
            C 635,102 670,90 710,90
            L 1105,90
            C 1155,90 1200,65 1200,35
            L 1200,0
            Z
          "
        />
      </svg>
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
