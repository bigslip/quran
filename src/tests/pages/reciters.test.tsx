import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RecitersListPage from '@/pages/reciters';
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

describe('RecitersListPage', () => {
  it('renders reciters list page correctly', () => {
    const mockReciters = [
      {
        id: 1,
        name: 'Mishary Rashid',
        translatedName: { name: 'Mishary Rashid', languageName: 'en' },
        style: { name: 'Murattal' },
        profilePicture: 'mishary.jpg',
        isAvailable: true,
      },
    ] as Partial<Reciter>[] as Reciter[];

    render(<RecitersListPage reciters={mockReciters} />);

    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders empty state when search finds no match and resets filters on clear click', () => {
    const mockReciters = [
      {
        id: 1,
        name: 'Mishary Rashid',
        translatedName: { name: 'Mishary Rashid', languageName: 'en' },
        style: { name: 'Murattal' },
        isAvailable: true,
      },
    ] as Partial<Reciter>[] as Reciter[];

    render(<RecitersListPage reciters={mockReciters} />);

    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(input, { target: { value: 'nonexistentqueryxyz' } });

    expect(screen.getByText('reciter:no-results')).toBeInTheDocument();
    expect(screen.getByText('common:try-different-search')).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /common:clear-filters/i });
    fireEvent.click(resetButton);

    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
  });
});
