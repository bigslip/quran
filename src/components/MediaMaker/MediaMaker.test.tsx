vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => ([]),
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
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import VideoSettings from './Settings/VideoSettings';
import MediaMakerContent from './Content/index';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
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
vi.mock('/public/icons/retry.svg', () => ({ default: () => <svg /> }));


vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('remotion', () => ({
  useVideoConfig: () => ({
    fps: 30,
    durationInFrames: 300,
    width: 1080,
    height: 1920,
  }),
  useCurrentFrame: () => 0,
  interpolate: () => 0,
  spring: () => 0,
  Sequence: ({ children }: any) => <div>{children}</div>,
  Composition: () => null,
  staticFile: (path: string) => path,
  AbsoluteFill: ({ children, style, ...rest }: any) => <div style={style} {...rest}>{children}</div>,
  Audio: () => null,
  Video: () => null,
  Img: () => null,
}));

describe('MediaMaker Components', () => {
  it('VideoSettings accepts HTML attributes', () => {
    const props: any = {
      chaptersList: [],
      reciters: [],
      playerRef: { current: null },
      isFetching: false,
      inputProps: {},
      mediaSettings: { translations: [] },
    };
    render(<VideoSettings {...props} data-testid="video-settings-container" />);
    expect(screen.getByTestId('video-settings-container')).toBeInTheDocument();
  });
  
  it('MediaMakerContent accepts HTML attributes', () => {
    const props: any = {
      verses: [],
      audio: { audioUrl: 'test', verseTimings: [] },
      timestamps: [],
      backgroundColor: '#000',
      opacity: 50,
      borderColor: '#000',
      borderSize: 0,
      fontColor: '#000',
      verseAlignment: 'center',
      translationAlignment: 'center',
      video: { videoSrc: 'test' },
      quranTextFontScale: 3,
      quranTextFontStyle: 'v1',
      translationFontScale: 3,
      orientation: 'landscape',
      videoId: 'v1',
      chapterEnglishName: 'Test',
      isPlayer: false,
      translations: [],
      previewMode: 'disabled'
    };
    render(<MediaMakerContent {...props} data-testid="media-maker-content" />);
    expect(screen.getByTestId('media-maker-content')).toBeInTheDocument();
  });
});
