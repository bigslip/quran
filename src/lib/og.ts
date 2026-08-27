const BASE_OG_URL = 'https://og.qurancdn.com';

interface BaseOgOptions {
  locale?: string;
}

export const getDefaultOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og?lang=${locale || 'en'}`;

export const getAboutTheQuranImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/about-the-quran?lang=${locale || 'en'}`;

export const getLearningPlansImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/learning-plans?lang=${locale || 'en'}`;

export const getEmbedOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/embed?lang=${locale || 'en'}`;

export const getMediaGeneratorOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/media?lang=${locale || 'en'}`;

export const getPreparingForRamadanOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/preparing-for-ramadan?lang=${locale || 'en'}`;

export const getBeyondRamadanOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/beyond-ramadan?lang=${locale || 'en'}`;

export const getRamadanChallengeOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/ramadanchallenge?lang=${locale || 'en'}`;

export const getRamadan2026OgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/ramadan2026?lang=${locale || 'en'}`;

export const getChapterOgImageUrl = ({
  chapterId,
  locale = 'en',
  verseNumber,
}: BaseOgOptions & {
  chapterId: string | number;
  verseNumber?: string | number;
}) => {
  const resolvedLocale = locale || 'en';
  const url = `${BASE_OG_URL}/api/og/chapter/${chapterId}?lang=${resolvedLocale}`;

  if (!verseNumber) return url;
  return `${url}&verse=${verseNumber}`;
};

export const getWhatIsRamadanOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/what-is-ramadan?lang=${locale || 'en'}`;

export const getExploreAnswersOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/explore-answers?lang=${locale || 'en'}`;

export const getQuranicCalendarOgImageUrl = ({ locale = 'en' }: BaseOgOptions = {}) =>
  `${BASE_OG_URL}/api/og/calendar?lang=${locale || 'en'}`;
