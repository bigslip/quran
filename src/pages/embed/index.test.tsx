vi.mock('@/hooks/useThemeDetector', () => ({
  default: () => ({ themeVariant: 'light', settingsTheme: { type: 'light' } })
}));
const overrides = {};
const readingPrefs = { wordByWordDisplay: [], wordByWordContentType: [] };
const themeObj = { type: 'light' };
const translations = [];

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: vi.fn((fn) => {
    const name = fn.name;
    if (name === 'selectReadingPreferences') {
      return readingPrefs;
    }
    if (name === 'selectTheme') {
      return themeObj;
    }
    if (name === 'selectAyahWidgetOverrides') {
      return overrides;
    }
    if (name === 'selectSelectedTranslations') {
      return translations;
    }
    if (name === 'selectQuranFont') {
      return 'v1';
    }
    return []; // default fallback
  }),
}));
vi.mock('@/redux/defaultSettings/util', () => ({
  getThemeInitialState: () => ({}),
  getReadingPreferencesInitialState: () => ({}),
  getQuranReaderStylesInitialState: () => ({}),
  getTranslationsInitialState: () => ({}),
  getTafsirsInitialState: () => ({}),
  getAudioPlayerStateInitialState: () => ({}),
  getNotificationsInitialState: () => ({}),
  getLocaleInitialStateByKey: () => ({}),
  getLocaleInitialState: () => ({}),
}));
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import AyahWidgetBuilderPage from './index';

// Mock Redux store


vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
    isReady: true,
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));
vi.mock('next-translate/Trans', () => ({
  default: () => <span>embed:header.subtitle</span>,
}));

vi.mock('@/hooks/widget/useAyahWidgetSurahs', () => ({
  default: () => [{ id: '1', versesCount: 7, name: 'Al-Fatihah' }]
}));
vi.mock('@/hooks/widget/useAyahWidgetTranslations', () => ({
  default: () => []
}));
vi.mock('@/hooks/widget/useAyahWidgetReciters', () => ({
  default: () => []
}));
vi.mock('@/hooks/widget/useAyahWidgetPreview', () => ({
  default: () => ({ previewRef: { current: null }, isLoading: false })
}));


describe('Embed Builder Page', () => {
  it('renders correctly and accepts HTML attributes', () => {
    render(
      <AyahWidgetBuilderPage data-testid="embed-builder-page" />
    );
    expect(screen.getByText('header.title')).toBeInTheDocument();
    
    // Check if attributes are spread
    expect(screen.getByTestId('embed-builder-page')).toBeInTheDocument();
  });
});
