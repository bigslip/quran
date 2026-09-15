import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RadioPage from '@/pages/radio';
import Reciter from 'types/Reciter';

expect.extend(matchers);

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="search-icon" />,
}));

vi.mock('@xstate/react', () => ({
  useSelector: vi.fn(() => false),
}));

vi.mock('@/icons/play-arrow.svg', () => ({
  default: () => <svg data-testid="play-icon" />,
}));

vi.mock('@/icons/pause.svg', () => ({
  default: () => <svg data-testid="pause-icon" />,
}));

vi.mock('@/components/Radio/CuratedStationList', () => ({
  default: () => <div data-testid="curated-stations-list" />,
}));

vi.mock('@/components/Navbar/SettingsDrawer/ReciterSelectionBody', () => ({
  filterReciters: (reciters: any) => reciters,
}));

describe('RadioPage', () => {
  it('renders radio page with hero, curated and reciter station sections', () => {
    const mockReciters = [
      {
        id: 7,
        name: 'Mishary Rashid al-Afasy',
        translatedName: { name: 'Mishary Rashid', languageName: 'en' },
        style: { name: 'Murattal' },
        profilePicture: 'mishary.jpg',
        isAvailable: true,
      },
    ] as Partial<Reciter>[] as Reciter[];

    render(<RadioPage reciters={mockReciters} />);

    expect(screen.getByTestId('curated-stations-list')).toBeInTheDocument();
    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
  });
});
