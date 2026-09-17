export interface TranslationItem {
  id: number;
  name: string;
  nameFa: string;
  languageCode: 'fa' | 'en';
  languageNameFa: string;
  authorName: string;
}

export const AVAILABLE_TRANSLATIONS: TranslationItem[] = [
  // 15 Persian Translations from Quran.ir / Tanzil / QDC
  {
    id: 841,
    name: 'Naser Makarem Shirazi',
    nameFa: 'ناصر مکارم شیرازی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'مکارم شیرازی',
  },
  {
    id: 842,
    name: 'Hussain Ansarian',
    nameFa: 'حسین انصاریان',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'انصاریان',
  },
  {
    id: 843,
    name: 'Mohammad Mahdi Fooladvand',
    nameFa: 'محمدمهدی فولادوند',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'فولادوند',
  },
  {
    id: 844,
    name: 'Mahdi Elahi Ghomshei',
    nameFa: 'مهدی الهی قمشه‌ای',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'الهی قمشه‌ای',
  },
  {
    id: 845,
    name: 'Bahaoddin Khorramshahi',
    nameFa: 'بهاءالدین خرمشاهی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'خرمشاهی',
  },
  {
    id: 846,
    name: 'Mohsen Gharaati',
    nameFa: 'محسن قرائتی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'قرائتی',
  },
  {
    id: 847,
    name: 'AbdolMohammad Ayati',
    nameFa: 'عبدالمحمد آیتی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'آیتی',
  },
  {
    id: 848,
    name: 'Abolfazl Bahrampour',
    nameFa: 'ابوالفضل بهرام‌پور',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'بهرام‌پور',
  },
  {
    id: 849,
    name: 'Mostafa Khorramdel',
    nameFa: 'مصطفی خرمدل',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'خرمدل',
  },
  {
    id: 850,
    name: 'Sayyed Mohammad Reza Safavi',
    nameFa: 'سید محمدرضا صفوی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'صفوی',
  },
  {
    id: 851,
    name: 'Mohammad Sadeqi Tehrani',
    nameFa: 'محمد صادقی تهرانی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'صادقی تهرانی',
  },
  {
    id: 852,
    name: 'Sayyed Jalaloddin Mojtabavi',
    nameFa: 'سید جلال‌الدین مجتبوی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'مجتبوی',
  },
  {
    id: 853,
    name: 'Mohammad Kazem Moezzi',
    nameFa: 'محمدکاظم معزی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'معزی',
  },
  {
    id: 135,
    name: 'IslamHouse.com',
    nameFa: 'اسلام‌هاوس',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'اسلام‌هاوس',
  },
  {
    id: 29,
    name: 'Hussein Taji Kal Dari',
    nameFa: 'حسین تاجی کل‌داری',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'تاجی کل‌داری',
  },

  // English Translations
  {
    id: 20,
    name: 'Saheeh International',
    nameFa: 'صحیح اینترنشنال (انگلیسی)',
    languageCode: 'en',
    languageNameFa: 'انگلیسی',
    authorName: 'Saheeh International',
  },
  {
    id: 131,
    name: 'The Clear Quran (Dr. Mustafa Khattab)',
    nameFa: 'کلیر قرآن - مصطفی خطاب',
    languageCode: 'en',
    languageNameFa: 'انگلیسی',
    authorName: 'Mustafa Khattab',
  },
  {
    id: 85,
    name: 'M.A.S. Abdel Haleem',
    nameFa: 'عبدالحلیم (انگلیسی)',
    languageCode: 'en',
    languageNameFa: 'انگلیسی',
    authorName: 'Abdel Haleem',
  },
];

export const DEFAULT_TRANSLATION_IDS = [841]; // Makarem Shirazi default

export function getTranslationById(id: number): TranslationItem | undefined {
  return AVAILABLE_TRANSLATIONS.find((t) => t.id === id);
}

export function searchTranslations(
  query: string,
  languageCode: 'all' | 'fa' | 'en' = 'all'
): TranslationItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return AVAILABLE_TRANSLATIONS.filter((translation) => {
    if (languageCode !== 'all' && translation.languageCode !== languageCode) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      translation.name.toLowerCase().includes(normalizedQuery) ||
      translation.nameFa.includes(normalizedQuery) ||
      translation.authorName.includes(normalizedQuery)
    );
  });
}

/**
 * Returns translated text from a Verse object for a given translation ID.
 */
export function getVerseTranslationText(
  verse: {
    translation_fa_makarem?: string;
    translation_fa_ansarian?: string;
    translation_en_saheeh?: string;
  },
  translationId: number
): string | null {
  if (translationId === 841) return verse.translation_fa_makarem || null;
  if (translationId === 842) return verse.translation_fa_ansarian || null;
  if (translationId === 20) return verse.translation_en_saheeh || null;
  return null;
}
