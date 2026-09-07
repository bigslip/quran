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
      {/* Top Islamic Arch Header */}
      <svg
        className={styles.topArchSvg}
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-top-crest"
      >
        <defs>
          <linearGradient id="sanctuaryTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>
        <path
          d="
            M 0,160
            L 0,100
            C 0,40 40,36 80,36
            L 340,36
            C 420,36 470,22 520,10
            C 560,0 585,0 600,0
            C 615,0 640,0 680,10
            C 730,22 780,36 860,36
            L 1120,36
            C 1160,36 1200,40 1200,100
            L 1200,160
            Z
          "
          fill="url(#sanctuaryTopGrad)"
        />
        <path
          d="
            M 0,160
            L 0,100
            C 0,40 40,36 80,36
            L 340,36
            C 420,36 470,22 520,10
            C 560,0 585,0 600,0
            C 615,0 640,0 680,10
            C 730,22 780,36 860,36
            L 1120,36
            C 1160,36 1200,40 1200,100
            L 1200,160
          "
          fill="none"
          stroke="#d97706"
          strokeWidth="2.5"
        />
      </svg>

      {/* Main Sanctuary Body with Honeycomb Tapestry */}
      <div className={styles.sanctuaryBody}>
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
      <svg
        className={styles.bottomArchSvg}
        viewBox="0 0 1200 70"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="sanctuary-bottom-crest"
      >
        <path
          d="
            M 0,0
            L 0,20
            C 0,45 35,50 70,50
            L 520,50
            C 560,50 585,60 600,70
            C 615,60 640,50 680,50
            L 1130,50
            C 1165,50 1200,45 1200,20
            L 1200,0
            Z
          "
          fill="#064e3b"
        />
        <path
          d="
            M 0,0
            L 0,20
            C 0,45 35,50 70,50
            L 520,50
            C 560,50 585,60 600,70
            C 615,60 640,50 680,50
            L 1130,50
            C 1165,50 1200,45 1200,20
            L 1200,0
          "
          fill="none"
          stroke="#d97706"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
