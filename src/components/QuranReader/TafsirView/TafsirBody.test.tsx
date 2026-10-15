import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TafsirBody from './TafsirBody';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({ selectQuranReaderStyles: vi.fn() }));
vi.mock('@/redux/slices/QuranReader/tafsirs', () => ({ selectTafsirs: vi.fn(), setSelectedTafsirs: vi.fn() }));

vi.mock('react-redux', () => ({
  useSelector: vi.fn((selector) => {
    if (selector.name === 'selectTafsirs') return { selectedTafsirs: [] };
    return {};
  }),
  shallowEqual: vi.fn(),
}));

vi.mock('@/hooks/auth/usePersistPreferenceGroup', () => ({
  default: () => ({ actions: { onSettingsChange: vi.fn() }, isLoading: false }),
}));

vi.mock('@/utils/navigation', () => ({ fakeNavigate: vi.fn(), getVerseSelectedTafsirNavigationUrl: vi.fn() }));
vi.mock('@/utils/tafsir', () => ({
  getFirstTafsirOfLanguage: vi.fn(),
  getSelectedTafsirLanguage: vi.fn(),
  getTafsirsLanguageOptions: vi.fn(() => []),
}));
vi.mock('src/api', () => ({ fetcher: vi.fn() }));
vi.mock('swr/immutable', () => ({ default: () => ({ data: {} }) }));

vi.mock('@/components/DataFetcher', () => ({ default: () => <div data-testid="data-fetcher" /> }));
vi.mock('./LanguageAndTafsirSelection', () => ({ default: () => <div data-testid="language-and-tafsir" /> }));
vi.mock('./SurahAndAyahSelection', () => ({ default: () => <div data-testid="surah-and-ayah" /> }));
vi.mock('./TafsirEndOfScrollingActions', () => ({ default: () => <div /> }));
vi.mock('./TafsirGroupMessage', () => ({ default: () => <div /> }));
vi.mock('./TafsirMessage', () => ({ default: () => <div /> }));
vi.mock('./TafsirSkeleton', () => ({ default: () => <div /> }));
vi.mock('./TafsirText', () => ({ default: () => <div /> }));
vi.mock('../VerseTextPreview', () => ({ default: () => <div /> }));

describe('TafsirBody', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const renderProp = ({ body }: any) => <div data-testid="wrapper">{body}</div>;
    render(
      <TafsirBody 
        initialChapterId="1" 
        initialVerseNumber="1" 
        scrollToTop={vi.fn()} 
        render={renderProp} 
        data-testid="tafsir-body" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('tafsir-body');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
