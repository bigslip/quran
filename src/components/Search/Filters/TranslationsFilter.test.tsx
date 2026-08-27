import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslationsFilter from './TranslationsFilter';
import AvailableTranslation from 'types/AvailableTranslation';

vi.mock('/public/icons/tick.svg', () => ({ default: () => <svg data-testid="tick-icon" /> }));
vi.mock('/public/icons/divider-horizontal.svg', () => ({ default: () => <svg data-testid="divider-icon" /> }));

const mockTranslations: AvailableTranslation[] = [
  {
    id: 131,
    name: 'Dr. Mustafa Khattab, the Clear Quran',
    authorName: 'Dr. Mustafa Khattab',
    slug: 'clearquran-with-tafsir',
    languageName: 'english',
    translatedName: {
      name: 'Dr. Mustafa Khattab, the Clear Quran',
      languageName: 'english',
    },
  },
  {
    id: 17,
    name: 'Dr. Ghali',
    authorName: 'Dr. Mahmud M. Ghali',
    slug: 'ghali',
    languageName: 'english',
    translatedName: {
      name: 'Dr. Ghali',
      languageName: 'english',
    },
  },
  {
    id: 54,
    name: 'Tafsir Jalalayn',
    authorName: 'Jalal ad-Din al-Mahalli and Jalal ad-Din as-Suyuti',
    slug: 'ruy-tafsir-jalalayn',
    languageName: 'russian',
    translatedName: {
      name: 'Tafsir Jalalayn',
      languageName: 'russian',
    },
  }
];

describe('TranslationsFilter', () => {
  afterEach(cleanup);

  it('renders translations grouped by language', () => {
    render(
      <TranslationsFilter
        translations={mockTranslations}
        selectedTranslations=""
        onTranslationChange={vi.fn()}
      />
    );

    expect(screen.getByText('english')).toBeTruthy();
    expect(screen.getByText('Dr. Mustafa Khattab, the Clear Quran')).toBeTruthy();
    expect(screen.getByText('Dr. Ghali')).toBeTruthy();
    
    expect(screen.getByText('russian')).toBeTruthy();
    expect(screen.getByText('Tafsir Jalalayn')).toBeTruthy();
  });

  it('dispatches selected translations when checked', () => {
    const onChange = vi.fn();
    render(
      <TranslationsFilter
        translations={mockTranslations}
        selectedTranslations="131"
        onTranslationChange={onChange}
      />
    );

    // Click on Dr. Ghali to select it
    fireEvent.click(screen.getByText('Dr. Ghali'));
    
    // It should dispatch the existing 131 + the new 17
    expect(onChange).toHaveBeenCalledWith(['131', '17']);
  });

  it('spreads HTMLAttributes like data-testid to root element', () => {
    render(
      <TranslationsFilter
        translations={mockTranslations}
        selectedTranslations=""
        onTranslationChange={vi.fn()}
        data-testid="translations-filter-root"
        className="test-class"
      />
    );

    const rootElement = screen.getByTestId('translations-filter-root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('test-class');
  });
});
