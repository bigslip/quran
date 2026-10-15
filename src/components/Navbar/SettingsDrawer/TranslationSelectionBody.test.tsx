import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import TranslationSelectionBody from './TranslationSelectionBody';

vi.mock('@/icons/search.svg', () => ({
  default: () => <span data-testid="search-icon" />,
}));

vi.mock('@/icons/tick.svg', () => ({
  default: () => <span data-testid="tick-icon" />,
}));

vi.mock('@/icons/information-circle-outline.svg', () => ({
  default: () => <span data-testid="info-icon" />,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'fa',
  }),
}));

vi.mock('@/components/DataFetcher', () => ({
  default: ({ render: renderProp }: { render: (data: any) => JSX.Element }) =>
    renderProp({
      translations: [
        {
          id: 841,
          name: 'Naser Makarem Shirazi',
          authorName: 'Naser Makarem Shirazi',
          languageName: 'persian',
          translatedName: { name: 'ناصر مکارم شیرازی', languageName: 'persian' },
        },
        {
          id: 843,
          name: 'Mohammad Mahdi Fooladvand',
          authorName: 'Mohammad Mahdi Fooladvand',
          languageName: 'persian',
          translatedName: { name: 'محمدمهدی فولادوند', languageName: 'persian' },
        },
        {
          id: 131,
          name: 'Dr. Mustafa Khattab',
          authorName: 'Mustafa Khattab',
          languageName: 'english',
          translatedName: { name: 'Dr. Mustafa Khattab', languageName: 'english' },
        },
      ],
    }),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => ({ selectedTranslations: [841] })),
  useDispatch: vi.fn(() => vi.fn()),
}));

vi.mock('@/hooks/auth/usePersistPreferenceGroup', () => ({
  default: () => ({
    actions: { onSettingsChange: vi.fn() },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useRemoveQueryParam', () => ({
  default: () => vi.fn(),
}));

describe('TranslationSelectionBody', () => {
  it('renders translations grouped with native names in Persian locale', () => {
    render(<TranslationSelectionBody />);

    expect(screen.getByTestId('translation-select')).toBeDefined();
    expect(screen.getByText('ناصر مکارم شیرازی')).toBeDefined();
    expect(screen.getByText('محمدمهدی فولادوند')).toBeDefined();
    expect(screen.getByText('Dr. Mustafa Khattab')).toBeDefined();
  });
});
