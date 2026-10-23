import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import Language from '@/types/Language';

const DEFAULT_TRANSLATION = 841; // Naser Makarem Shirazi
const DEFAULT_TAFSIRS = ['fa-tafsir-nemouneh'];

export default {
  ...DEFAULT_SETTINGS,
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedWordByWordLocale: 'fa',
    selectedReflectionLanguages: [Language.FA],
    selectedLessonLanguages: [Language.FA],
  },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
  tafsirs: { ...DEFAULT_SETTINGS.tafsirs, selectedTafsirs: DEFAULT_TAFSIRS },
} as DefaultSettings;
