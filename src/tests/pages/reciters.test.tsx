import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RecitersListPage from '@/pages/reciters';
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

vi.mock('@/components/Navbar/SettingsDrawer/ReciterSelectionBody', () => ({
  filterReciters: (reciters: any) => reciters,
}));

describe('RecitersListPage', () => {
  it('renders reciters list page correctly', () => {
    const mockReciters = [
      {
        id: 1,
        translatedName: { name: 'Mishary Rashid', languageName: 'en' },
        style: { name: 'Murattal' },
        profilePicture: 'mishary.jpg',
      },
    ] as Partial<Reciter>[] as Reciter[];

    render(<RecitersListPage reciters={mockReciters} />);

    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
});
