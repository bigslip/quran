import sampleVerseData from '@/utils/sample-verse.json';
import Verse from 'types/Verse';

const SAMPLE_LOCALIZED_DATA: Record<
  string,
  { wbw: string[]; translation: string; languageId: number; languageName: string }
> = {
  fa: {
    wbw: ['به نام', 'خداوند', 'بخشنده', 'مهربان', '(۱)'],
    translation: 'به نام خداوند بخشنده بخشایشگر',
    languageId: 43,
    languageName: 'persian',
  },
  tr: {
    wbw: ['Adıyla', "Allah'ın", 'Rahman', 'Rahim', '(1)'],
    translation: "Rahmân ve Rahîm olan Allah'ın adıyla.",
    languageId: 167,
    languageName: 'turkish',
  },
  ur: {
    wbw: ['ساتھ نام', 'اللہ کے', 'نہایت مہربان', 'رحم کرنے والا', '(۱)'],
    translation: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
    languageId: 174,
    languageName: 'urdu',
  },
  id: {
    wbw: ['Dengan nama', 'Allah', 'Maha Pengasih', 'Maha Penyayang', '(1)'],
    translation: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang.',
    languageId: 67,
    languageName: 'indonesian',
  },
  bn: {
    wbw: ['নামে', 'আল্লাহর', 'পরম করুণাময়', 'অতি দয়ালু', '(১)'],
    translation: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।',
    languageId: 20,
    languageName: 'bengali',
  },
  en: {
    wbw: ['In (the) name', '(of) Allah', 'the Most Gracious', 'the Most Merciful', '(1)'],
    translation: 'In the Name of Allah—the Most Compassionate, Most Merciful.',
    languageId: 38,
    languageName: 'english',
  },
};

const getSampleVerse = async (wbwLocale = 'en'): Promise<Verse> => {
  const baseVerse = JSON.parse(JSON.stringify(sampleVerseData)) as Verse;
  const localized = SAMPLE_LOCALIZED_DATA[wbwLocale.toLowerCase()] || SAMPLE_LOCALIZED_DATA.en;

  if (baseVerse.words) {
    baseVerse.words = baseVerse.words.map((word, index) => ({
      ...word,
      translation: {
        text: localized.wbw[index] || word.translation?.text || '',
        languageId: localized.languageId,
        languageName: localized.languageName,
      },
    }));
  }

  if (baseVerse.translations && baseVerse.translations.length > 0) {
    baseVerse.translations[0] = {
      ...baseVerse.translations[0],
      text: localized.translation,
      languageId: localized.languageId,
      languageName: localized.languageName,
    };
  }

  return baseVerse;
};

export default getSampleVerse;

