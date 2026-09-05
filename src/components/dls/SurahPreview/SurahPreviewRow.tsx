import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './SurahPreviewRow.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Spinner from '@/dls/Spinner/Spinner';
import { toLocalizedNumber } from '@/utils/locale';

type SurahPreviewRowProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  description: string;
  chapterId: number;
  revelationPlace?: string;
  isMinimalLayout?: boolean;
  isLoading?: boolean;
};
const SurahPreviewRow = ({
  surahName,
  surahNumber,
  translatedSurahName,
  description,
  chapterId,
  revelationPlace,
  isMinimalLayout = false,
  isLoading = false,
}: SurahPreviewRowProps) => {
  const { t, lang } = useTranslation('common');
  const localizedSurahNumber = useMemo(
    () => toLocalizedNumber(surahNumber, lang),
    [surahNumber, lang],
  );
  const isMakkah = revelationPlace === 'makkah';

  if (isMinimalLayout) {
    return (
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.surahNumber}>
            <span>{localizedSurahNumber}</span>
          </div>
          <ChapterIconContainer
            chapterId={chapterId.toString()}
            hasSurahPrefix={false}
            size={ChapterIconsSize.Large}
          />
        </div>
        <div className={styles.right}>
          {description && (
            <div className={classNames(styles.description, styles.largeText)}>{description}</div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.surahNumber}>
          <span>{localizedSurahNumber}</span>
        </div>
        <div className={styles.surahNameContainer}>
          <div className={styles.nameHeader}>
            <span className={styles.surahName} translate="no">
              {surahName}
            </span>
            {revelationPlace && (
              <span className={classNames(styles.revelationTag, isMakkah ? styles.makkah : styles.madinah)}>
                {isMakkah ? t('common:makkah-short', { defaultValue: 'Makki' }) : t('common:madinah-short', { defaultValue: 'Madani' })}
              </span>
            )}
          </div>
          <div className={styles.translatedSurahName} translate="no">
            {translatedSurahName}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <ChapterIconContainer
              chapterId={chapterId.toString()}
              hasSurahPrefix={false}
              size={ChapterIconsSize.Large}
            />
            {description && <div className={styles.description}>{description}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default SurahPreviewRow;
