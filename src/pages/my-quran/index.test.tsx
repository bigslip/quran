import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import MyQuranPage from './index';

afterEach(cleanup);

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, replace: vi.fn(), pathname: '/my-quran' }),
}));
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));
vi.mock('@/components/HeaderNavigation', () => ({
  default: () => <div data-testid="header-navigation" />
}));
vi.mock('@/components/NextSeoWrapper', () => ({
  default: () => <div />
}));
// Provide simple mocks for tabs to prevent deep rendering issues
vi.mock('@/components/MyQuran/SavedTabContent', () => ({
  default: () => <div data-testid="saved-tab" />
}));
vi.mock('@/components/MyQuran/tabs/RecentContent/RecentContent', () => ({
  default: () => <div data-testid="recent-tab" />
}));
vi.mock('@/components/MyQuran/tabs/NotesAndReflectionsTab', () => ({
  default: () => <div data-testid="notes-tab" />
}));

import userEvent from '@testing-library/user-event';

describe('MyQuranPage', () => {
  it('renders main layout and tab switcher', () => {
    render(<MyQuranPage />);
    expect(screen.getByTestId('header-navigation')).toBeInTheDocument();
    
    // Tab contents
    expect(screen.getByTestId('saved-tab')).toBeInTheDocument();
  });

  it('switches tabs on interaction', async () => {
    render(<MyQuranPage />);
    
    expect(screen.getByTestId('saved-tab')).toBeInTheDocument();
    
    const recentTabButton = screen.getByRole('button', { name: /recent/i });
    await userEvent.click(recentTabButton);
    
    expect(screen.getByTestId('recent-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('saved-tab')).not.toBeInTheDocument();
    
    const notesTabButton = screen.getByRole('button', { name: /notes-and-reflections/i });
    await userEvent.click(notesTabButton);
    
    expect(screen.getByTestId('notes-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('recent-tab')).not.toBeInTheDocument();
  });
});
