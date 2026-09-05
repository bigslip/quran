import React, { useContext, useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Link, { LinkVariant } from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import styles from './JuzView.module.scss';

import DataContext from '@/contexts/DataContext';
import { getAllJuzMappings, getChapterData } from '@/utils/chapter';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';

type JuzViewProps = {
  isDescending: boolean;
};

const EMPTY_MAPPINGS: [string, Record<string, string>][] = [];

const JuzView: React.FC<JuzViewProps> = ({ isDescending }: JuzViewProps) => {
  const { t, lang } = useTranslation();
  const [juzMappings, setJuzMappings] =
    useState<[string, Record<string, string>][]>(EMPTY_MAPPINGS);
  const chaptersData = useContext(DataContext);

  useEffect(() => {
    getAllJuzMappings()
      .then((data) => Object.entries(data))
      .then(setJuzMappings);
  }, []);

  const sortedJuzIds = useMemo(
    () =>
      isDescending ? juzMappings.slice().sort(([a], [b]) => Number(b) - Number(a)) : juzMappings,
    [isDescending, juzMappings],
  );

  if (juzMappings.length === 0) {
    return <div className={styles.loadingContainer} />;
  }

  return (
    <>
      {sortedJuzIds.map((juzEntry) => {
        const [juzId, chapterAndVerseMappings] = juzEntry;
        const chapterIds = Object.keys(chapterAndVerseMappings);
        return (
          <div key={juzId} className={styles.juzContainer} data-testid={`juz-${juzId}-container`}>
            <Link href={`/juz/${juzId}`} variant={LinkVariant.Primary} shouldPrefetch={false}>
              <div className={styles.juzTitle}>
                <span>
                  {t('common:juz')} {toLocalizedNumber(Number(juzId), lang)}
                </span>
                <span className={styles.readJuz}>{t('home:read-juz')}</span>
              </div>
            </Link>
            {chapterIds.map((chapterId) => {
              const chapter = getChapterData(chaptersData, chapterId);
              return (
                <div className={styles.chapterContainer} key={chapterId}>
                  <Link
                    href={`/${chapterId}/${chapterAndVerseMappings[chapterId]}`}
                    shouldPrefetch={false}
                  >
                    <SurahPreviewRow
                      chapterId={Number(chapterId)}
                      description={`${toLocalizedNumber(chapter.versesCount, lang)} ${t(
                        'common:ayahs',
                      )}`}
                      surahName={chapter.transliteratedName}
                      surahNumber={Number(chapterId)}
                      translatedSurahName={chapter.translatedName as string}
                      isMinimalLayout={shouldUseMinimalLayout(lang)}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export default React.memo(JuzView);
