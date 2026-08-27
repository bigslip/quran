import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import RecentContent from './RecentContent';

afterEach(cleanup);
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';

vi.mock('@/hooks/auth/useGetRecentlyReadVerseKeys');
vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: vi.fn(() => ({ quranFont: 1, mushafLines: 15 })),
}));
vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => ({ quranFont: 1, mushafLines: 15 })),
  shallowEqual: vi.fn(),
}));
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));
vi.mock('@/utils/chapter', () => ({
  getChapterData: vi.fn(() => ({ transliteratedName: 'Al-Fatihah' }))
}));
vi.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en' })
}));
vi.mock('@/dls/IconContainer/IconContainer', () => ({
  default: () => <div data-testid="icon-container" />
}));
vi.mock('@/components/chapters/ChapterIcon/ChapterIconContainer', () => ({
  default: () => <div data-testid="chapter-icon-container" />,
  ChapterIconsSize: { Large: 'large' }
}));
vi.mock('./VerseMetadata', () => ({
  default: () => <div data-testid="verse-metadata" />
}));

describe('RecentContent', () => {
  it('renders with aria-busy when loading', () => {
    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      isLoading: true,
      recentlyReadVerseKeys: [],
      timestamps: [],
    } as any);

    render(<RecentContent data-testid="recent-content" />);
    const element = screen.getByTestId('recent-content');
    expect(element).toHaveAttribute('aria-busy', 'true');
  });

  it('renders empty state', () => {
    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      isLoading: false,
      recentlyReadVerseKeys: [],
      timestamps: [],
    } as any);

    render(<RecentContent data-testid="recent-content" />);
    expect(screen.getByText('recent-empty')).toBeInTheDocument();
    expect(screen.getByTestId('recent-content')).not.toHaveAttribute('aria-busy', 'true');
  });

  it('renders populated state', () => {
    vi.mocked(useGetRecentlyReadVerseKeys).mockReturnValue({
      isLoading: false,
      recentlyReadVerseKeys: ['1:1', '2:2'],
      timestamps: [new Date(), new Date()],
    } as any);

    render(<RecentContent data-testid="recent-content" />);
    expect(screen.getByTestId('recent-content')).not.toHaveAttribute('aria-busy', 'true');
    // Using string matching for the test id because it's from TestId enum
    expect(screen.getAllByTestId('my-quran-recent-content-item')).toHaveLength(2);
  });
});
