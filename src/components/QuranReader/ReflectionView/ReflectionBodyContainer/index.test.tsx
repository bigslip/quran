import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ReflectionBodyContainer from './index';
import ContentType from 'types/QuranReflect/ContentType';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => []),
  useDispatch: vi.fn(),
}));

vi.mock('@/hooks/auth/usePersistPreferenceGroup', () => ({
  default: () => ({ actions: { onSettingsChange: vi.fn() }, isLoading: false }),
}));

vi.mock('@/utils/navigation', () => ({ fakeNavigate: vi.fn(), getVerseLessonNavigationUrl: vi.fn(), getVerseReflectionNavigationUrl: vi.fn() }));
vi.mock('@/utils/quranReflect/locale', () => ({ getReflectionLanguageItems: vi.fn(() => []), localeToQuranReflectLanguageID: vi.fn() }));
vi.mock('src/api', () => ({ fetcher: vi.fn() }));
vi.mock('swr/immutable', () => ({ default: () => ({ data: {} }) }));
vi.mock('next/dynamic', () => ({ default: () => () => <div /> }));
vi.mock('@/components/DataFetcher', () => ({ default: () => <div data-testid="data-fetcher" /> }));
vi.mock('@/dls/CompactSelector', () => ({ default: () => <div data-testid="compact-selector" /> }));
vi.mock('@/dls/Tabs/Tabs', () => ({ default: () => <div data-testid="tabs" /> }));
vi.mock('@/hooks/useGlobalIntersectionObserverWithDelay', () => ({ default: vi.fn() }));

describe('ReflectionBodyContainer', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const renderProp = ({ body }: any) => <div data-testid="wrapper">{body}</div>;
    render(
      <ReflectionBodyContainer 
        initialChapterId="1" 
        initialVerseNumber="1" 
        scrollToTop={vi.fn()} 
        render={renderProp} 
        data-testid="reflection-body" 
        aria-hidden="true" 
        initialContentType={ContentType.REFLECTIONS}
      />
    );
    const el = screen.getByTestId('reflection-body');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});

vi.mock('@/redux/actions/sync-locale-dependent-settings', () => ({ default: vi.fn() }));
vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectReflectionLanguages: vi.fn(() => []),
  setReflectionLanguages: vi.fn(),
  selectLessonLanguages: vi.fn(() => []),
  setLessonLanguages: vi.fn(),
}));
