/* eslint-disable react-func/max-lines-per-function */
import { NextSeoProps } from 'next-seo';

import { getDefaultOgImageUrl } from '@/lib/og';
import Language from '@/types/Language';
import { getOpenGraphLocale, toLocalizedNumber } from '@/utils/locale';
import { VersesResponse } from 'types/ApiResponses';

export const config = {
  siteName: 'Quran.ir',
  twitterHandle: '@app_quran',
  twitterCardType: 'summary_large_image',
  facebookApp: '342185219529773',
  facebookPage: '603289706669016',
  appleAppName: 'Quran - by Quran.ir - قرآن',
  appleAppId: '1118663303',
  appleAppUrl: 'https://apps.apple.com/us/app/quran-by-quran-com-qran/id1118663303',
  androidAppName: 'Quran for Android',
  androidPackage: 'com.quran.labs.androidquran',
  androidAppUrl: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
};

type SeoConfigType = {
  path?: string;
  locale?: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
};

export interface SEOProps extends NextSeoProps {
  dangerouslySetAllPagesToNoFollow?: boolean;
  dangerouslySetAllPagesToNoIndex?: boolean;
}

export function createSEOConfig({
  title,
  description,
  canonicalUrl,
  locale,
}: SeoConfigType = {}): SEOProps {
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  const seoTitle = title || '';
  const resolvedLocale = locale || 'en';

  return {
    title: seoTitle,
    description,
    titleTemplate: '%s - Quran.ir',
    defaultTitle: config.siteName,
    dangerouslySetAllPagesToNoFollow: !isProduction, // @see https://github.com/garmeeh/next-seo#dangerouslySetAllPagesToNoFollow
    dangerouslySetAllPagesToNoIndex: !isProduction, // @see https://github.com/garmeeh/next-seo#dangerouslySetAllPagesToNoIndex
    canonical: canonicalUrl,
    openGraph: {
      type: 'website',
      locale: getOpenGraphLocale(resolvedLocale),
      url: canonicalUrl,
      title: seoTitle,
      description,
      images: [
        {
          url: getDefaultOgImageUrl({ locale: resolvedLocale }),
          width: 1200,
          height: 630,
          alt: config.siteName,
        },
      ],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      site_name: config.siteName,
    },
    facebook: {
      appId: config.facebookApp,
    },
    twitter: {
      handle: config.twitterHandle,
      site: config.twitterHandle,
      cardType: config.twitterCardType,
    },
    additionalMetaTags: [
      {
        property: 'fb:pages',
        content: config.facebookPage,
      },
      {
        name: 'Charset',
        content: 'UTF-8',
      },
      {
        name: 'Distribution',
        content: 'Global', // indicates that your webpage is intended for everyone
      },
      {
        name: 'Rating',
        content: 'General', // lets the younger web-surfers know the content is appropriate
      },
      {
        name: 'theme-color',
        content: '#fff', // placeholder
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
    ],
  };
}

/**
 * Concatenate the first 4 verses of the Page/Juz.
 *
 * @param {VersesResponse} response
 * @returns {string}
 */
export const getPageOrJuzMetaDescription = (response?: VersesResponse): string => {
  return (
    response?.verses
      ?.slice(0, 4)
      .map((verse) => verse?.textImlaeiSimple)
      .filter(Boolean)
      .join(' - ') || ''
  );
};

export interface SurahSeoTitleOptions {
  chapter: {
    id?: number | string;
    transliteratedName?: string;
    translatedName?: string;
    nameArabic?: string;
    versesCount?: number;
  };
  lang: string;
  isChapter: boolean;
  verseNumber?: number;
  isAyatulKursi?: boolean;
}

export const isAyatulKursi = (
  chapterId: string | number,
  verseNumber: string | number,
): boolean => String(chapterId) === '2' && Number(verseNumber) === 255;

export const getSurahSeoTitle = ({
  chapter,
  lang,
  isChapter,
  verseNumber,
  isAyatulKursi: isAyatulKursiParam,
}: SurahSeoTitleOptions): string => {
  const transliterated = chapter?.transliteratedName || '';
  const translated = chapter?.translatedName || '';
  const arabic = chapter?.nameArabic || '';

  if (!isChapter && isAyatulKursiParam) {
    if (lang === Language.FA) {
      return 'آیت الکرسی (آیه ۲۵۵ سوره بقره) - متن، ترجمه و صوت | قرآن کریم';
    }
    if (lang === Language.AR) {
      return 'آية الكرسي (سورة البقرة آية ۲۵۵) - قراءة وتفسير | القرآن الكريم';
    }
    return 'Ayatul Kursi (Surah Al-Baqarah - Verse 255) - Translation & Audio | Quran.ir';
  }

  if (!isChapter && verseNumber) {
    const localizedVerseNum = toLocalizedNumber(verseNumber, lang);
    if (lang === Language.FA) {
      const cleanFaName = translated.split('(')[0].trim() || transliterated;
      return `آیه ${localizedVerseNum} سوره ${cleanFaName} (${transliterated}) - متن و ترجمه | قرآن کریم`;
    }
    if (lang === Language.AR) {
      return `سورة ${arabic || transliterated} آية ${localizedVerseNum} - قراءة وتفسير | القرآن الكريم`;
    }
    return `Surah ${transliterated} - Verse ${verseNumber} - Translation & Tafsir | Quran.ir`;
  }

  // Full Surah view
  if (lang === Language.FA) {
    const cleanFaName = translated.split('(')[0].trim() || transliterated;
    return `سوره ${cleanFaName} (${transliterated}) - متن، ترجمه و صوت | قرآن کریم`;
  }

  if (lang === Language.AR) {
    return `سورة ${arabic || transliterated} - قراءة واستماع وتفسير | القرآن الكريم`;
  }

  const englishSubtitle = translated ? ` (${translated})` : '';
  return `Surah ${transliterated}${englishSubtitle} - Read, Translation & Audio | Quran.ir`;
};
