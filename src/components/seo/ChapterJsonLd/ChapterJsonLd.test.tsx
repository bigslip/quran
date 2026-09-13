import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import ChapterJsonLd from './index';

vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockChapter = {
  id: 2,
  transliteratedName: 'Al-Baqarah',
  translatedName: 'بقره (گاو ماده)',
  nameArabic: 'البقرة',
  versesCount: 286,
  revelationPlace: 'madinah',
  slug: 'al-baqarah',
};

describe('ChapterJsonLd', () => {
  it('renders valid Schema.org JSON-LD structured data in Persian', () => {
    const { container } = render(
      <ChapterJsonLd chapter={mockChapter} lang="fa" currentPath="/fa/al-baqarah" />,
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script?.textContent || '{}');
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toBeDefined();

    const breadcrumbs = data['@graph'].find((item: any) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumbs).toBeDefined();
    expect(breadcrumbs.itemListElement).toHaveLength(2);
    expect(breadcrumbs.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'صفحه اصلی',
      item: 'https://quran.ir/fa',
    });
    expect(breadcrumbs.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'سوره بقره (گاو ماده)',
      item: 'https://quran.ir/fa/al-baqarah',
    });

    const chapterObj = data['@graph'].find((item: any) => item['@type'] === 'Chapter');
    expect(chapterObj).toBeDefined();
    expect(chapterObj.position).toBe(2);
    expect(chapterObj.inLanguage).toBe('fa');
    expect(chapterObj.alternateName).toEqual(['البقرة', 'Al-Baqarah', 'بقره (گاو ماده)']);
    expect(chapterObj.isPartOf).toEqual({
      '@type': 'Book',
      name: 'The Holy Quran',
      url: 'https://quran.ir',
    });

    const audioObj = data['@graph'].find((item: any) => item['@type'] === 'AudioObject');
    expect(audioObj).toBeDefined();
    expect(audioObj.encodingFormat).toBe('audio/mpeg');
    expect(audioObj.inLanguage).toBe('ar');
    expect(audioObj.contentUrl).toBe('https://quran.ir/audio/reciters/7/002.mp3');
  });

  it('renders valid Schema.org JSON-LD structured data in English', () => {
    const { container } = render(
      <ChapterJsonLd
        chapter={{
          ...mockChapter,
          translatedName: 'The Cow',
        }}
        lang="en"
        currentPath="/al-baqarah"
      />,
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script?.textContent || '{}');

    const breadcrumbs = data['@graph'].find((item: any) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumbs.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://quran.ir',
    });
    expect(breadcrumbs.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Surah Al-Baqarah',
      item: 'https://quran.ir/al-baqarah',
    });

    const chapterObj = data['@graph'].find((item: any) => item['@type'] === 'Chapter');
    expect(chapterObj['@id']).toBe('https://quran.ir/al-baqarah#chapter');
    expect(chapterObj.inLanguage).toBe('en');
  });

  it('renders valid Schema.org JSON-LD structured data in Arabic', () => {
    const { container } = render(
      <ChapterJsonLd chapter={mockChapter} lang="ar" currentPath="/ar/al-baqarah" />,
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent || '{}');

    const breadcrumbs = data['@graph'].find((item: any) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumbs.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'الرئيسية',
      item: 'https://quran.ir/ar',
    });
  });

  it('handles partial or missing chapter properties gracefully', () => {
    const { container } = render(<ChapterJsonLd chapter={{}} lang="en" currentPath="1" />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script?.textContent || '{}');
    const chapterObj = data['@graph'].find((item: any) => item['@type'] === 'Chapter');
    expect(chapterObj.position).toBe(1);
    expect(chapterObj.alternateName).toEqual([]);
  });
});
