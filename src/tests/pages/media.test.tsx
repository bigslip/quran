vi.mock('@/redux/defaultSettings/util', () => ({
  getThemeInitialState: () => ({}),
  getReadingPreferencesInitialState: () => ({}),
  getQuranReaderStylesInitialState: () => ({}),
  getTranslationsInitialState: () => ({ selectedTranslations: [] }),
  getTafsirsInitialState: () => ({}),
  getAudioPlayerStateInitialState: () => ({}),
  getNotificationsInitialState: () => ({}),
  getLocaleInitialStateByKey: () => ({}),
  getLocaleInitialState: () => ({}),
}));

vi.mock('@/icons/headphones-success.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/headphones.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/colors-success.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/colors.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/photo-success.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/photo.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/translate-success.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/translate.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/text-success.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/text.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/caret-down.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/download.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/copy.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/video.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/retry.svg', () => ({ default: () => <svg /> }));
vi.mock('remotion', () => ({
  prefetch: () => ({ waitUntilDone: () => Promise.resolve(), free: vi.fn() }),
  cancelRender: vi.fn(),
  staticFile: (path: string) => path,
}));
vi.mock('swr', () => ({
  default: () => ({ data: undefined, error: undefined, isValidating: false }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => ([]),
}));

vi.mock('@/utils/media/utils', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    getBackgroundVideoById: () => ({ videoSrc: 'test.mp4' }),
  };
});
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MediaMakerPage from '@/pages/media';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
  }),
}));

vi.mock('@/hooks/useGetChaptersData', () => ({
  default: () => ({}),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key) => key, lang: 'en' }),
}));

vi.mock('@/hooks/auth/media/useGetMediaSettings', () => ({
  default: () => ({
    surah: 1,
    verseFrom: 1,
    verseTo: 3,
    reciter: 1,
    translations: [20],
    backgroundColor: '#000',
    opacity: 50,
    borderColor: '#fff',
    borderSize: 2,
    fontColor: '#fff',
    verseAlignment: 'center',
    translationAlignment: 'center',
    videoId: 'bg1',
    quranTextFontScale: 3,
    quranTextFontStyle: 'v1',
    translationFontScale: 3,
    orientation: 'landscape',
    previewMode: 'disabled',
  }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: {}
}));

describe('MediaMaker Page', () => {
  it('renders correctly and accepts HTML attributes', () => {
    const props = {
      chaptersData: {},
      englishChaptersList: {},
      reciters: [],
      verses: {},
      audio: { verseTimings: [] },
      translationsData: [],
    };
    render(<MediaMakerPage {...props} data-testid="media-maker-page" />);
    // Check for title or specific UI
    expect(screen.getByText('media:title')).toBeInTheDocument();
    
    // Test that data-testid is spread to the root container
    // To make this pass, we will have to spread props onto the main wrapper.
    expect(screen.getByTestId('media-maker-page')).toBeInTheDocument();
  });
});
