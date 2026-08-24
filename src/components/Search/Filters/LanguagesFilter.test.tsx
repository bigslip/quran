import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import LanguagesFilter from './LanguagesFilter';
import AvailableLanguage from 'types/AvailableLanguage';

vi.mock('/public/icons/search.svg', () => ({ default: () => <svg data-testid="search-icon" /> }));
vi.mock('/public/icons/close.svg', () => ({ default: () => <svg data-testid="close-icon" /> }));
vi.mock('/public/icons/caret-down.svg', () => ({ default: () => <svg data-testid="caret-icon" /> }));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

// We also need to mock Combobox if it's complex, but let's see if we can render it without mocking.
// Combobox from dls/Forms/Combobox uses Radix UI and might require some environment setup.

const mockLanguages: AvailableLanguage[] = [
  {
    id: 38,
    name: 'English',
    isoCode: 'en',
    nativeName: 'English',
    direction: 'ltr',
    translationsCount: 1,
    translatedName: {
      name: 'English',
      languageName: 'english',
    },
  },
  {
    id: 184,
    name: 'Russian',
    isoCode: 'ru',
    nativeName: 'Русский',
    direction: 'ltr',
    translationsCount: 1,
    translatedName: {
      name: 'Russian',
      languageName: 'english',
    },
  },
];

describe('LanguagesFilter', () => {
  afterEach(cleanup);

  it('renders and forwards props', () => {
    const onChange = vi.fn();
    render(
      <LanguagesFilter
        languages={mockLanguages}
        selectedLanguages="en"
        onLanguageChange={onChange}
        data-testid="languages-filter-root"
        className="test-class"
      />
    );

    const rootElement = screen.getByTestId('languages-filter-root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('test-class');

    // Should render the selected tag "English"
    expect(screen.getAllByText('English').length).toBeGreaterThan(0);
    // And in the listbox options, both English and Russian
    expect(screen.getByText('Russian')).toBeTruthy();
  });
});
