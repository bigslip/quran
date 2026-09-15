import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, afterEach } from 'vitest';
import MyQuranPage from '@/pages/my-quran';

afterEach(cleanup);

vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<any>) => {
    let Component: any = null;
    loader().then((mod) => {
      Component = mod.default || mod;
    });
    return (props: any) => (Component ? <Component {...props} /> : null);
  },
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, replace: vi.fn(), pathname: '/my-quran' }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/icons/bookmark.svg', () => ({
  default: () => <svg data-testid="bookmark-icon" />,
}));

vi.mock('@/icons/history.svg', () => ({
  default: () => <svg data-testid="history-icon" />,
}));

vi.mock('@/icons/edit.svg', () => ({
  default: () => <svg data-testid="edit-icon" />,
}));

vi.mock('@/components/NextSeoWrapper', () => ({
  default: () => <div />,
}));

// Provide simple mocks for tabs to prevent deep rendering issues
vi.mock('@/components/MyQuran/SavedTabContent', () => ({
  default: () => <div data-testid="saved-tab" />,
}));
vi.mock('@/components/MyQuran/tabs/RecentContent/RecentContent', () => ({
  default: () => <div data-testid="recent-tab" />,
}));
vi.mock('@/components/MyQuran/tabs/NotesAndReflectionsTab', () => ({
  default: () => <div data-testid="notes-tab" />,
}));

describe('MyQuranPage', () => {
  it('renders main sanctuary layout and hero tabs', () => {
    render(<MyQuranPage />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);

    // Tab contents
    expect(screen.getByTestId('saved-tab')).toBeInTheDocument();
  });

  it('switches tabs on interaction', async () => {
    render(<MyQuranPage />);

    expect(screen.getByTestId('saved-tab')).toBeInTheDocument();

    const recentTabButton = screen.getByRole('tab', { name: /recent/i });
    await userEvent.click(recentTabButton);

    expect(screen.getByTestId('recent-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('saved-tab')).not.toBeInTheDocument();

    const notesTabButton = screen.getByRole('tab', { name: /notes-and-reflections/i });
    await userEvent.click(notesTabButton);

    expect(screen.getByTestId('notes-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('recent-tab')).not.toBeInTheDocument();
  });
});
