import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ReciterPage from '@/pages/reciters/[reciterId]';
import Reciter from 'types/Reciter';
import Chapter from 'types/Chapter';

expect.extend(matchers);

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="search-icon" />,
}));

vi.mock('src/xstate/AudioPlayerMachineContext', () => ({
  AudioPlayerMachineContext: {},
}));

vi.mock('@xstate/react', () => ({
  useSelector: vi.fn(() => false),
}));

vi.mock('@/components/dls/Tooltip', () => ({
  default: ({ children }: any) => <>{children}</>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
  ContentSide: { BOTTOM: 'bottom', TOP: 'top', LEFT: 'left', RIGHT: 'right' },
}));

vi.mock('src/api', () => ({
  getChapterAudioData: vi.fn(),
}));

vi.mock('src/redux/defaultSettings/util', () => ({
  getLocaleInitialStateByKey: vi.fn(),
  getAudioPlayerStateInitialState: vi.fn(),
}));

vi.mock('@/icons/copy-link.svg', () => ({ default: () => <svg data-testid="copy-link" /> }));
vi.mock('@/icons/download.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/pause.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/play-arrow.svg', () => ({ default: () => <svg /> }));

describe('ReciterPage', () => {
  it('renders reciter profile and chapters correctly', () => {
    const mockReciter = {
      id: 1,
      translatedName: { name: 'Mishary Rashid' },
      bio: 'A famous reciter',
      profilePicture: 'mishary.jpg',
    } as Partial<Reciter> as Reciter;

    const mockChaptersData = {
      '1': {
        id: 1,
        localizedId: '1',
        transliteratedName: 'Al-Fatihah',
      } as Partial<Chapter> as Chapter,
    } as Record<string, Chapter>;

    render(<ReciterPage selectedReciter={mockReciter} chaptersData={mockChaptersData} />);

    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
    expect(screen.getByText('1. Al-Fatihah')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('copy-link')).toBeInTheDocument();
  });
});
