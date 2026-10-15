import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import clipboardCopy from 'clipboard-copy';
import ChaptersList from './ChaptersList';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

expect.extend(matchers);
afterEach(cleanup);

vi.mock('src/xstate/AudioPlayerMachineContext', () => ({
  AudioPlayerMachineContext: {},
}));

vi.mock('@xstate/react', () => ({
  useSelector: vi.fn(() => false),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('src/api', () => ({
  getChapterAudioData: vi.fn(),
}));

vi.mock('src/redux/defaultSettings/util', () => ({
  getLocaleInitialStateByKey: vi.fn(),
  getAudioPlayerStateInitialState: vi.fn(),
}));

vi.mock('@/components/dls/Tooltip', () => ({
  default: ({ children }: any) => <>{children}</>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
  ContentSide: { BOTTOM: 'bottom', TOP: 'top', LEFT: 'left', RIGHT: 'right' },
}));

vi.mock('clipboard-copy', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/icons/copy-link.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/download.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/pause.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/play-arrow.svg', () => ({ default: () => <svg /> }));

describe('ChaptersList', () => {
  it('renders a list of chapters and spreads HTML attributes', () => {
    const mockChapters = [
      {
        id: 1,
        localizedId: '1',
        transliteratedName: 'Al-Fatihah',
      },
    ] as Partial<Chapter>[] as Chapter[];

    const mockReciter = {
      id: 1,
    } as Partial<Reciter> as Reciter;

    render(
      <ChaptersList
        filteredChapters={mockChapters}
        selectedReciter={mockReciter}
        data-testid="chapters-list"
        aria-label="Chapters List"
      />
    );

    const root = screen.getByTestId('chapters-list');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'Chapters List');
    expect(screen.getByText('1. Al-Fatihah')).toBeInTheDocument();

    const playButton = screen.getByRole('button', { name: /common:audio.player.play Al-Fatihah/i });
    expect(playButton).toBeInTheDocument();

    // The component provides ariaLabel={t('reciter:copy-link')}
    const copyButton = screen.getByLabelText('reciter:copy-link');
    expect(copyButton).toBeInTheDocument();
  });

  it('copies canonical reciter chapter URL using slug when available', () => {
    const mockChapters = [
      {
        id: 1,
        slug: 'al-fatihah',
        localizedId: '1',
        transliteratedName: 'Al-Fatihah',
      },
    ] as Partial<Chapter>[] as Chapter[];

    const mockReciter = {
      id: 7,
    } as Partial<Reciter> as Reciter;

    render(
      <ChaptersList
        filteredChapters={mockChapters}
        selectedReciter={mockReciter}
      />
    );

    const copyButton = screen.getByLabelText('reciter:copy-link');
    fireEvent.click(copyButton);

    expect(clipboardCopy).toHaveBeenCalledWith(expect.stringContaining('/reciters/7/al-fatihah'));
  });

  it('copies reciter chapter URL using id when slug is not available', () => {
    const mockChapters = [
      {
        id: 1,
        localizedId: '1',
        transliteratedName: 'Al-Fatihah',
      },
    ] as Partial<Chapter>[] as Chapter[];

    const mockReciter = {
      id: 7,
    } as Partial<Reciter> as Reciter;

    render(
      <ChaptersList
        filteredChapters={mockChapters}
        selectedReciter={mockReciter}
      />
    );

    const copyButton = screen.getByLabelText('reciter:copy-link');
    fireEvent.click(copyButton);

    expect(clipboardCopy).toHaveBeenCalledWith(expect.stringContaining('/reciters/7/1'));
  });
});
