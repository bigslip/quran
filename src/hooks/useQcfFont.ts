import { useCallback, useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import useThemeDetector from './useThemeDetector';

import { selectLoadedFontFaces, addLoadedFontFace } from '@/redux/slices/QuranReader/font-faces';
import { QuranFont } from '@/types/QuranReader';
import {
  getFontFaceNameForPage,
  getPagesByVerses,
  getQCFFontFaceSource,
  isQCFFont,
} from '@/utils/fontFaceHelper';
import Verse from 'types/Verse';

const globalFetchingFonts = new Set<string>();
const globalLoadedFonts = new Set<string>();

/**
 * This hook manually request the browser to download the font for each page
 * of QCF's V1 and V2 Mushafs. After each resource has been downloaded, we
 * store it in redux so that VerseText can use it to determine whether the fallback
 * text and font should be font or not.
 *
 * Notes, loaded font is reset every time the user switch the font
 * see src/components/Navbar/SettingsDrawer/QuranFontSection.tsx
 *
 * @param {QuranFont} quranFont
 * @param {Verse[]} verses
 */
const useQcfFont = (quranFont: QuranFont, verses: Verse[]) => {
  const dispatch = useDispatch();
  const isFontQCF = isQCFFont(quranFont);
  const loadedFonts = useSelector(selectLoadedFontFaces);
  const loadedFontsRef = useRef(loadedFonts);
  loadedFontsRef.current = loadedFonts;
  const { themeVariant } = useThemeDetector();

  const onFontLoaded = useCallback(
    (fontFace: string) => {
      globalLoadedFonts.add(fontFace);
      dispatch(addLoadedFontFace(fontFace));
    },
    [dispatch],
  );

  // listen to changes in verses (this is due to infinite scrolling fetching more verses).
  useEffect(() => {
    if (
      !isFontQCF ||
      verses.length === 0 ||
      typeof document === 'undefined' ||
      !('fonts' in document) ||
      typeof FontFace === 'undefined'
    ) {
      return;
    }

    // loop through unique page numbers of the current verses
    getPagesByVerses(verses).forEach((pageNumber) => {
      const fontFaceName = getFontFaceNameForPage(quranFont, pageNumber);
      // we only want to load fonts that were not loaded and also are not currently being loaded
      if (
        globalFetchingFonts.has(fontFaceName) ||
        globalLoadedFonts.has(fontFaceName) ||
        loadedFontsRef.current.includes(fontFaceName)
      ) {
        return;
      }

      globalFetchingFonts.add(fontFaceName);
      const fontFace = new FontFace(
        fontFaceName,
        getQCFFontFaceSource(quranFont, pageNumber, themeVariant),
      );
      fontFace.display = 'block';
      document.fonts.add(fontFace);

      // load the font-face programmatically
      fontFace
        .load()
        .then(() => {
          // store the font face in Redux slice
          onFontLoaded(fontFaceName);
        })
        .finally(() => {
          globalFetchingFonts.delete(fontFaceName);
        });
    });
  }, [quranFont, verses, isFontQCF, onFontLoaded, themeVariant]);
};

export default useQcfFont;
