import React from 'react';

import Head from 'next/head';

import { getChapterAudioUrl } from '@/utils/audio';
import Chapter from 'types/Chapter';

interface ChapterJsonLdProps {
  chapter: Partial<Chapter>;
  lang: string;
  currentPath: string;
}

const ChapterJsonLd: React.FC<ChapterJsonLdProps> = ({ chapter, lang, currentPath }) => {
  const chapterId = Number(chapter?.id || 1);
  const transliterated = chapter?.transliteratedName || '';
  const translated = (chapter?.translatedName as string) || '';
  const arabic = chapter?.nameArabic || '';
  const canonicalUrl = `https://quran.ir${currentPath.startsWith('/') ? currentPath : `/${currentPath}`}`;
  const audioUrl = getChapterAudioUrl(chapterId, 7); // Default reciter Mishari Rashid al-Afasy (ID 7)

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: lang === 'fa' ? 'صفحه اصلی' : lang === 'ar' ? 'الرئيسية' : 'Home',
            item: `https://quran.ir${lang === 'en' ? '' : `/${lang}`}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: lang === 'fa' ? `سوره ${translated || transliterated}` : `Surah ${transliterated}`,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'Chapter',
        '@id': `${canonicalUrl}#chapter`,
        name: `Surah ${transliterated}`,
        alternateName: [arabic, transliterated, translated].filter(Boolean),
        position: chapterId,
        inLanguage: lang,
        isPartOf: {
          '@type': 'Book',
          name: 'The Holy Quran',
          url: 'https://quran.ir',
        },
      },
      {
        '@type': 'AudioObject',
        name: `Surah ${transliterated} Audio Recitation`,
        description: `High-quality audio recitation of Surah ${transliterated}`,
        contentUrl: audioUrl,
        encodingFormat: 'audio/mpeg',
        inLanguage: 'ar',
      },
    ],
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        key={`chapter-jsonld-${chapterId}`}
      />
    </Head>
  );
};

export default React.memo(ChapterJsonLd);
