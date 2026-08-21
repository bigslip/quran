import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ShareButtons from './index';

// Mock next-translate
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
  }),
}));

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

// Mock Redux slices to prevent importing store initialization code
vi.mock('@/redux/slices/ayahWidget', () => ({ selectAyahWidgetOverrides: vi.fn() }));
vi.mock('@/redux/slices/QuranReader/styles', () => ({ selectQuranFont: vi.fn() }));
vi.mock('@/redux/slices/QuranReader/translations', () => ({ selectSelectedTranslations: vi.fn() }));

// Mock clipboard-copy
vi.mock('clipboard-copy', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

// Mock react-share components
vi.mock('react-share', () => ({
  FacebookShareButton: ({ children, onClick }: any) => <button onClick={onClick} data-testid="fb-share">{children}</button>,
  TwitterShareButton: ({ children, onClick }: any) => <button onClick={onClick} data-testid="tw-share">{children}</button>,
  WhatsappShareButton: ({ children, onClick }: any) => <button onClick={onClick} data-testid="wa-share">{children}</button>,
  XIcon: () => <svg data-testid="x-icon" />,
  WhatsappIcon: () => <svg data-testid="wa-icon" />,
}));

// Mock internal dependencies
vi.mock('@/hooks/useThemeDetector', () => ({
  default: () => ({ themeVariant: 'light' }),
}));
vi.mock('@/components/AyahWidget/widget-defaults', () => ({
  getMushafFromQuranFont: vi.fn(),
}));
vi.mock('@/components/AyahWidget/widget-embed', () => ({
  buildSimpleEmbedSnippet: vi.fn(() => 'embed-snippet'),
}));
vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

// Mock SVG icons
vi.mock('@/icons/code-embed-circle.svg', () => ({ default: () => <svg data-testid="code-embed-icon" /> }));
vi.mock('@/icons/copy-link-new.svg', () => ({ default: () => <svg data-testid="copy-link-icon" /> }));
vi.mock('@/icons/fb.svg', () => ({ default: () => <svg data-testid="fb-icon" /> }));
vi.mock('@/icons/video-link-new.svg', () => ({ default: () => <svg data-testid="video-icon" /> }));

describe('ShareButtons', () => {
  afterEach(cleanup);

  const defaultProps = {
    url: 'https://example.com',
    title: 'Test Title',
    analyticsContext: 'test_context',
  };

  it('renders correctly with default props', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByTestId('fb-share')).toBeTruthy();
    expect(screen.getByTestId('tw-share')).toBeTruthy();
    expect(screen.getByTestId('wa-share')).toBeTruthy();
    expect(screen.getByText('copylink')).toBeTruthy();
  });

  it('spreads props to the root container', () => {
    render(<ShareButtons {...defaultProps} data-testid="share-container" aria-label="Share Options" />);
    const container = screen.getByTestId('share-container');
    expect(container.getAttribute('aria-label')).toBe('Share Options');
  });

  it('shows embed button only when verse is provided', () => {
    const { rerender } = render(<ShareButtons {...defaultProps} />);
    expect(screen.queryByText('copy-embed')).toBeNull();

    rerender(<ShareButtons {...defaultProps} verse={{ chapterId: '1', verseNumber: 1 }} />);
    expect(screen.getByText('copy-embed')).toBeTruthy();
  });

  it('hides video generation when hideVideoGeneration is true', () => {
    const { rerender } = render(<ShareButtons {...defaultProps} hideVideoGeneration={false} />);
    expect(screen.getByText('quran-reader:generate-media')).toBeTruthy();

    rerender(<ShareButtons {...defaultProps} hideVideoGeneration={true} />);
    expect(screen.queryByText('quran-reader:generate-media')).toBeNull();
  });
});
