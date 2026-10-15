import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SeekButton, { SeekButtonType } from './SeekButton';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

vi.mock('@/hooks/useDirection', () => ({ default: () => 'ltr' }));
vi.mock('@/dls/Tooltip', () => ({
  default: ({ children }: any) => <>{children}</>,
  ContentSide: {
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left',
  },
}));
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ lang: 'en', t: (key: string) => key }),
}));

vi.mock('@/icons/backward.svg', () => ({ default: () => <svg data-testid="backward-icon" /> }));
vi.mock('@/icons/forward.svg', () => ({ default: () => <svg data-testid="forward-icon" /> }));

describe('SeekButton', () => {
  afterEach(cleanup);

  it('renders next ayah button and sends NEXT_AYAH on click', () => {
    const mockSend = vi.fn();
    const mockAudioService = {
      send: mockSend,
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      state: {
        context: { surah: 1, ayahNumber: 2 },
      },
    };
    const chaptersData = {
      1: { id: 1, versesCount: 7, transliteratedName: 'Al-Fatihah' },
    };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <SeekButton
          type={SeekButtonType.NextAyah}
          isLoading={false}
          chaptersData={chaptersData as any}
        />
      </AudioPlayerMachineContext.Provider>,
    );

    const button = screen.getByTestId('audio-next-ayah');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('next-ayah');

    fireEvent.click(button);
    expect(mockSend).toHaveBeenCalledWith({ type: 'NEXT_AYAH' });
  });

  it('renders prev ayah button and sends PREV_AYAH on click', () => {
    const mockSend = vi.fn();
    const mockAudioService = {
      send: mockSend,
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      state: {
        context: { surah: 1, ayahNumber: 3 },
      },
    };
    const chaptersData = {
      1: { id: 1, versesCount: 7, transliteratedName: 'Al-Fatihah' },
    };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <SeekButton
          type={SeekButtonType.PrevAyah}
          isLoading={false}
          chaptersData={chaptersData as any}
        />
      </AudioPlayerMachineContext.Provider>,
    );

    const button = screen.getByTestId('audio-prev-ayah');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('previous-ayah');

    fireEvent.click(button);
    expect(mockSend).toHaveBeenCalledWith({ type: 'PREV_AYAH' });
  });
});
