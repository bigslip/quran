import { useSelector } from 'react-redux';

import { RootState } from '@/redux/RootState';
import { selectLoadedFontFaces } from '@/redux/slices/QuranReader/font-faces';
import { getFontFaceNameForPage, isQCFFont } from '@/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';

/**
 * A hook that detects whether a font of a specific page
 * has been loaded or not.
 *
 * @param {number} pageNumber
 * @param {QuranFont} quranFont
 * @returns {boolean}
 */
const useIsFontLoaded = (pageNumber: number, quranFont: QuranFont): boolean => {
  const isFontLoaded = useSelector((state: RootState) => {
    if (!isQCFFont(quranFont)) {
      return true;
    }
    return selectLoadedFontFaces(state).includes(getFontFaceNameForPage(quranFont, pageNumber));
  });

  return isFontLoaded;
};

export default useIsFontLoaded;
