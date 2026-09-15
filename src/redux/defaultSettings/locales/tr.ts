import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

const DEFAULT_TRANSLATION = 77; // Diyanet

export default {
  ...DEFAULT_SETTINGS,
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedWordByWordLocale: 'tr',
  },
  translations: { ...DEFAULT_SETTINGS.translations, selectedTranslations: [DEFAULT_TRANSLATION] },
} as DefaultSettings;
