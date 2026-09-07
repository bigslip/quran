import React, { useMemo } from 'react';

import styles from './IslamicSanctuaryBoard.module.scss';
import PetalSurahCard from '../PetalSurahCard/PetalSurahCard';

import { chunkToHoneycomb } from '@/utils/honeycomb';
import Chapter from 'types/Chapter';

type Props = {
  chapters: Chapter[];
  mostVisitedChapters?: Record<number, boolean>;
};

const IslamicSanctuaryBoard: React.FC<Props> = ({ chapters, mostVisitedChapters = {} }) => {
  // 4 then 3 desktop pattern
  const rows = useMemo(() => chunkToHoneycomb(chapters, [4, 3]), [chapters]);

  return (
    <div className={styles.sanctuaryContainer} data-testid="islamic-sanctuary-board">
      <div className={styles.sanctuaryCrest} aria-hidden="true" data-testid="sanctuary-top-crest">
        <svg viewBox="0 0 200 30" className={styles.crestSvg}>
          <path d="M 0,15 Q 50,0 80,15 Q 100,0 120,15 Q 150,0 200,15 L 200,30 L 0,30 Z" />
        </svg>
      </div>

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

      <div className={styles.bottomCrest} aria-hidden="true" data-testid="sanctuary-bottom-crest">
        <svg viewBox="0 0 200 30" className={styles.crestSvg}>
          <path d="M 0,15 Q 50,30 80,15 Q 100,30 120,15 Q 150,30 200,15 L 200,0 L 0,0 Z" />
        </svg>
      </div>
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
