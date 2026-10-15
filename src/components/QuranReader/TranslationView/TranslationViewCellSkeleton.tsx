import classNames from 'classnames';
import range from 'lodash/range';
import { useSelector, shallowEqual } from 'react-redux';

import cellStyles from './TranslationViewCell.module.scss';
import skeletonStyles from './TranslationViewSkeleton.module.scss';

import verseTextStyles from '@/components/Verse/VerseText.module.scss';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getFontClassName } from '@/utils/fontFaceHelper';
import QueryParam from 'types/QueryParam';

const TRANSLATION_TEXT_SAMPLE =
  'He has revealed to you ˹O Prophet˺ the Book in truth, confirming what came before it, as He revealed the Torah and the Gospel';
const TRANSLATION_AUTHOR_SAMPLE = '— Dr. Mustafa Khattab, the Clear Quran';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  hasActionMenuItems?: boolean;
}

const TranslationViewCellSkeleton: React.FC<Props> = ({ hasActionMenuItems = true, className, ...props }) => {
  const { value: selectedTranslations }: { value: number[] } = useGetQueryParamOrReduxValue(
    QueryParam.TRANSLATIONS,
  );
  const { quranFont, quranTextFontScale, translationFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const translations = selectedTranslations?.length ? selectedTranslations : [1];

  return (
    <div className={classNames(className, cellStyles.cellContainer, skeletonStyles.cellContainer)} {...props}>
      <div className={cellStyles.actionContainer}>
        <div className={cellStyles.actionContainerLeft}>
          {range(0, 4).map((index) => (
            <Skeleton
              key={index}
              isRounded
              className={classNames(skeletonStyles.actionItem, skeletonStyles.actionButton)}
            />
          ))}
        </div>
        {hasActionMenuItems && (
          <div className={cellStyles.actionContainerRight}>
            <Skeleton
              isRounded
              className={classNames(cellStyles.actionItem, skeletonStyles.actionButton)}
            />
          </div>
        )}
      </div>

      {/* We're not using VersePreview as Skeleton's children here
      because it has layout shift problem when loading the font. Which is not ideal for skeleton */}
      <div className={cellStyles.contentContainer}>
        <Skeleton
          className={classNames(
            skeletonStyles.verseContainer,
            cellStyles.arabicVerseContainer,
            verseTextStyles[getFontClassName(quranFont, quranTextFontScale, mushafLines)],
          )}
        />
        <div
          className={classNames(
            cellStyles.verseTranslationsContainer,
            skeletonStyles[`translation-font-size-${translationFontScale}`],
          )}
        >
          {translations.map((translation) => (
            <div key={translation} className={cellStyles.verseTranslationContainer}>
              <div>
                <Skeleton className={classNames(skeletonStyles.translationText)}>
                  {TRANSLATION_TEXT_SAMPLE}
                </Skeleton>
              </div>
              <div>
                <Skeleton className={classNames(skeletonStyles.translationAuthor)}>
                  {TRANSLATION_AUTHOR_SAMPLE}
                </Skeleton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranslationViewCellSkeleton;
