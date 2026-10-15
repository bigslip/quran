import ar from './locales/ar';
import bn from './locales/bn';
import en from './locales/en';
import es from './locales/es';
import fa from './locales/fa';
import fr from './locales/fr';
import id from './locales/id';
import it from './locales/it';
import ms from './locales/ms';
import nl from './locales/nl';
import pt from './locales/pt';
import ru from './locales/ru';
import sq from './locales/sq';
import sw from './locales/sw';
import th from './locales/th';
import tr from './locales/tr';
import ur from './locales/ur';
import vi from './locales/vi';
import zh from './locales/zh';
import { RootState } from '../RootState';
import NotificationsState from '../types/NotificationsState';

import { DefaultSettings } from '@/redux/defaultSettings/defaultSettings';
import AudioState from '@/redux/types/AudioState';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import ReadingPreferences from '@/redux/types/ReadingPreferences';
import SliceName from '@/redux/types/SliceName';
import TafsirsSettings from '@/redux/types/TafsirsSettings';
import Theme from '@/redux/types/Theme';
import TranslationsSettings from '@/redux/types/TranslationsSettings';

const LOCALES_MAP: Record<string, DefaultSettings> = {
  ar,
  bn,
  en,
  es,
  fa,
  fr,
  id,
  it,
  ms,
  nl,
  pt,
  ru,
  sq,
  sw,
  th,
  tr,
  ur,
  vi,
  zh,
};

/**
 * Get the initial state of the store.
 *
 * @param {string} locale
 * @returns {RootState}
 */
export const getStoreInitialState = (locale: string): RootState => {
  return {
    [SliceName.THEME]: getThemeInitialState(locale),
    [SliceName.READING_PREFERENCES]: getReadingPreferencesInitialState(locale),
    [SliceName.QURAN_READER_STYLES]: getQuranReaderStylesInitialState(locale),
    [SliceName.TRANSLATIONS]: getTranslationsInitialState(locale),
    [SliceName.TAFSIRS]: getTafsirsInitialState(locale),
    // @ts-ignore
    [SliceName.AUDIO_PLAYER_STATE]: getAudioPlayerStateInitialState(locale),
    [SliceName.DEFAULT_SETTINGS]: { isUsingDefaultSettings: true },
    [SliceName.NOTIFICATIONS]: getNotificationsInitialState(locale),
  };
};

const DEFAULT_LOCALE = 'en';

/**
 * Load the default settings of the locale passed.
 *
 * @param {string} locale
 * @returns {DefaultSettings}
 */
const importLocaleFile = (locale: string): DefaultSettings =>
  LOCALES_MAP[locale] || LOCALES_MAP[DEFAULT_LOCALE];

/**
 * Get specific settings by its key for a locale.
 * e.g. get the settings for theme by the key 'theme'.
 *
 * @param {string} locale
 * @param {string} key
 * @returns {any}
 */
const getLocaleInitialStateByKey = (locale: string, key: string) => importLocaleFile(locale)[key];

export const getLocaleInitialState = (locale: string) => importLocaleFile(locale);

export const getThemeInitialState = (locale = DEFAULT_LOCALE): Theme => {
  return getLocaleInitialStateByKey(locale, SliceName.THEME);
};

export const getReadingPreferencesInitialState = (locale = DEFAULT_LOCALE): ReadingPreferences => {
  return getLocaleInitialStateByKey(locale, SliceName.READING_PREFERENCES);
};

export const getQuranReaderStylesInitialState = (locale = DEFAULT_LOCALE): QuranReaderStyles => {
  return getLocaleInitialStateByKey(locale, SliceName.QURAN_READER_STYLES);
};

export const getTranslationsInitialState = (locale = DEFAULT_LOCALE): TranslationsSettings => {
  return getLocaleInitialStateByKey(locale, SliceName.TRANSLATIONS);
};

export const getTafsirsInitialState = (locale = DEFAULT_LOCALE): TafsirsSettings => {
  return getLocaleInitialStateByKey(locale, SliceName.TAFSIRS);
};
export const getAudioPlayerStateInitialState = (locale = DEFAULT_LOCALE): AudioState => {
  return getLocaleInitialStateByKey(locale, SliceName.AUDIO_PLAYER_STATE);
};

export const getNotificationsInitialState = (locale = DEFAULT_LOCALE): NotificationsState => {
  return getLocaleInitialStateByKey(locale, SliceName.NOTIFICATIONS);
};
