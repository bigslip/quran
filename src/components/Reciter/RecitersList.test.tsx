import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RecitersList from './RecitersList';
import Reciter from 'types/Reciter';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

const mockTranslations: Record<string, string> = {
  'reciter:badge-available': 'Full Audio',
  'reciter:badge-coming-soon': 'Coming Soon',
  'reciter:unavailable-tooltip': 'Audio files for this reciter will be added soon.',
};

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => mockTranslations[key] || key,
    lang: 'en',
  }),
}));

describe('RecitersList', () => {
  it('renders a list of reciters and spreads HTML attributes', () => {
    const mockReciters = [
      {
        id: 7,
        name: 'Mishary Rashid al-Afasy',
        translatedName: { name: 'Mishary Rashid', languageName: 'en' },
        style: { name: 'Murattal' },
        profilePicture: 'mishary.jpg',
        isAvailable: true,
      },
      {
        id: 1,
        name: 'AbdulBaset AbdulSamad',
        translatedName: { name: 'AbdulBaset Mujawwad', languageName: 'en' },
        style: { name: 'Mujawwad' },
        profilePicture: 'abdulbaset.jpg',
        isAvailable: false,
      },
    ] as Partial<Reciter>[] as Reciter[];

    render(
      <RecitersList
        reciters={mockReciters}
        data-testid="reciters-list"
        aria-label="List of reciters"
      />,
    );

    const root = screen.getByTestId('reciters-list');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'List of reciters');

    // Available reciter has link and Full Audio badge
    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
    expect(screen.getByText('Full Audio')).toBeInTheDocument();
    const availableLink = screen.getByRole('link', { name: /Mishary Rashid/i });
    expect(availableLink).toHaveAttribute('href', '/reciters/7');

    // Unavailable reciter has Coming Soon badge and disabled state
    expect(screen.getByText('AbdulBaset Mujawwad')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });
});

