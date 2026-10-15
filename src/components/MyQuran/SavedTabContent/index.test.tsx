import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SavedTabContent from './index';
import useCollections from '@/hooks/useCollections';
import useRecentlySaved from '@/hooks/useRecentlySaved';
import useReadingBookmarkDisplay from '@/hooks/useReadingBookmarkDisplay';

vi.mock('@/redux/defaultSettings/util', () => ({
  getLocaleInitialStateByKey: vi.fn(),
  getAvailableLocales: vi.fn(),
}));
vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: () => ({ isLoggedIn: true })
}));
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  shallowEqual: vi.fn(),
}));
vi.mock('@/hooks/useCollections', () => ({
  default: vi.fn(() => ({ collections: [], isLoading: false })),
  CollectionSortOption: { RECENTLY_UPDATED: 'RECENTLY_UPDATED' }
}));
vi.mock('@/hooks/useRecentlySaved', () => ({
  default: vi.fn(() => ({ items: [], isLoading: false }))
}));
vi.mock('@/hooks/useReadingBookmarkDisplay', () => ({
  default: vi.fn(() => ({ bookmark: null, isLoading: false }))
}));
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));
vi.mock('@/components/MyQuran/MyReadingBookmark', () => ({
  default: () => <div data-testid="my-reading-bookmark" />
}));
vi.mock('@/components/MyQuran/CollectionsList', () => ({
  default: () => <div data-testid="collections-list" />
}));
vi.mock('@/components/MyQuran/RecentlySaved', () => ({
  default: () => <div data-testid="recently-saved" />
}));
vi.mock('@/components/MyQuran/CollectionDetailView', () => ({
  default: () => <div data-testid="collection-detail-view" />
}));
vi.mock('@/components/Verse/SaveBookmarkModal/Collections/NewCollectionForm', () => ({
  default: () => <div data-testid="new-collection-form" />
}));
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(cleanup);

describe('SavedTabContent', () => {
  it('renders with aria-busy when loading collections', () => {
    vi.mocked(useCollections).mockReturnValue({
      collections: [],
      isLoading: true,
    } as any);
    vi.mocked(useRecentlySaved).mockReturnValue({
      items: [],
      isLoading: false,
    } as any);
    vi.mocked(useReadingBookmarkDisplay).mockReturnValue({
      bookmark: null,
      isLoading: false,
    } as any);

    render(<SavedTabContent data-testid="saved-content" />);
    expect(screen.getByTestId('saved-content')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not have aria-busy when not loading', () => {
    vi.mocked(useCollections).mockReturnValue({
      collections: [],
      isLoading: false,
    } as any);
    vi.mocked(useRecentlySaved).mockReturnValue({
      items: [],
      isLoading: false,
    } as any);
    vi.mocked(useReadingBookmarkDisplay).mockReturnValue({
      bookmark: null,
      isLoading: false,
    } as any);

    render(<SavedTabContent data-testid="saved-content" />);
    expect(screen.getByTestId('saved-content')).not.toHaveAttribute('aria-busy', 'true');
  });

  it('renders populated states correctly', () => {
    vi.mocked(useCollections).mockReturnValue({
      collections: [{ id: '1', name: 'My Collection' }],
      isLoading: false,
    } as any);
    vi.mocked(useRecentlySaved).mockReturnValue({
      items: [{ id: '1' }],
      isLoading: false,
    } as any);
    vi.mocked(useReadingBookmarkDisplay).mockReturnValue({
      bookmark: { id: '1' },
      isLoading: false,
    } as any);

    render(<SavedTabContent />);
    expect(screen.getByTestId('collections-list')).toBeInTheDocument();
    expect(screen.getByTestId('recently-saved')).toBeInTheDocument();
    expect(screen.getByTestId('my-reading-bookmark')).toBeInTheDocument();
  });

  it('renders empty states correctly', () => {
    vi.mocked(useCollections).mockReturnValue({
      collections: [],
      isLoading: false,
    } as any);
    vi.mocked(useRecentlySaved).mockReturnValue({
      items: [],
      isLoading: false,
    } as any);
    vi.mocked(useReadingBookmarkDisplay).mockReturnValue({
      bookmark: null,
      isLoading: false,
    } as any);

    render(<SavedTabContent />);
    expect(screen.getByTestId('collections-list')).toBeInTheDocument();
    // recently saved is empty and not loading, so it should not render
    expect(screen.queryByTestId('recently-saved')).not.toBeInTheDocument();
    expect(screen.getByTestId('my-reading-bookmark')).toBeInTheDocument();
  });
});
