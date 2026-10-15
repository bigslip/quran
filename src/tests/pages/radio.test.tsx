import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RadioPage from '@/pages/radio';
import Reciter from 'types/Reciter';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

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

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="close-icon" />,
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
  filterReciters: (reciters: any[], query: string) => {
    if (!query) return reciters;
    return reciters.filter(
      (r) =>
        r.name?.toLowerCase().includes(query.toLowerCase()) ||
        r.translatedName?.name?.toLowerCase().includes(query.toLowerCase()),
    );
  },
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

  it('renders empty state when no stations match search and resets filters on click', () => {
    const mockReciters = [
      {
        id: 7,
        name: 'Mishary Rashid al-Afasy',
        translatedName: { name: 'Mishary Rashid', languageName: 'en' },
        style: { name: 'Murattal' },
        isAvailable: true,
      },
    ] as Partial<Reciter>[] as Reciter[];

    render(<RadioPage reciters={mockReciters} />);

    // Type non-matching search query
    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(input, { target: { value: 'nonexistentqueryxyz' } });

    expect(screen.getByText('radio:no-results')).toBeInTheDocument();
    expect(screen.getByText('common:try-different-search')).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /common:clear-filters/i });
    fireEvent.click(resetButton);

    expect(screen.getByTestId('curated-stations-list')).toBeInTheDocument();
  });
});
