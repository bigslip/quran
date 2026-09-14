import Fuse from 'fuse.js';

import { getLanguageNativeName, getTranslationNativeName } from './translationInfo';

import AvailableTranslation from 'types/AvailableTranslation';

/**
 * Enriches translations with normalized lowercase language name and native metadata.
 *
 * @param {AvailableTranslation[]} translations
 * @returns {AvailableTranslation[]}
 */
export const getTranslations = (translations: AvailableTranslation[]): AvailableTranslation[] => {
  if (!translations) return [];
  return translations.map((translation: any) => {
    const languageName = (translation.languageName || translation.language_name || '').toLowerCase();
    const nativeName = getTranslationNativeName(translation);
    const nativeLanguageName = getLanguageNativeName(languageName);
    return {
      ...translation,
      languageName,
      nativeName,
      nativeLanguageName,
    };
  });
};

const filterTranslations = (
  translations: AvailableTranslation[],
  searchQuery: string,
): AvailableTranslation[] => {
  const prepared = getTranslations(translations);
  const fuse = new Fuse(prepared, {
    keys: ['name', 'languageName', 'authorName', 'translatedName.name', 'nativeName', 'nativeLanguageName'],
    threshold: 0.3,
  });

  const filteredTranslations = fuse.search(searchQuery).map(({ item }) => item);
  return filteredTranslations;
};

export default filterTranslations;
