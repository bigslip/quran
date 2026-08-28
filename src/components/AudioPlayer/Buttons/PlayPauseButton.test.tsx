import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import PlayPauseButton from './PlayPauseButton';
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

vi.mock('@/icons/pause.svg', () => ({ default: () => <svg data-testid="pause-icon" /> }));
vi.mock('@/icons/play-arrow.svg', () => ({ default: () => <svg data-testid="play-icon" /> }));

describe('PlayPauseButton', () => {
  afterEach(cleanup);

  it('renders play button and toggles playback on click', () => {
    const mockSend = vi.fn();
    const mockAudioService = {
      send: mockSend,
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      state: {
        matches: vi.fn((stateName: string) => false),
        hasTag: vi.fn(() => false),
      },
    };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <PlayPauseButton />
      </AudioPlayerMachineContext.Provider>,
    );

    const button = screen.getByTestId('audio-play-toggle');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('audio.player.play');

    fireEvent.click(button);
    expect(mockSend).toHaveBeenCalledWith('TOGGLE');
  });

  it('renders pause button when audio is playing', () => {
    const mockSend = vi.fn();
    const mockAudioService = {
      send: mockSend,
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      state: {
        matches: vi.fn((stateName: string) => stateName === 'VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
        hasTag: vi.fn(() => false),
      },
    };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <PlayPauseButton />
      </AudioPlayerMachineContext.Provider>,
    );

    const button = screen.getByTestId('audio-pause-toggle');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('audio.player.pause');

    fireEvent.click(button);
    expect(mockSend).toHaveBeenCalledWith('TOGGLE');
  });

  it('renders loading spinner when audio is loading', () => {
    const mockAudioService = {
      send: vi.fn(),
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      state: {
        matches: vi.fn(() => false),
        hasTag: vi.fn((tag: string) => tag === 'loading'),
      },
    };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <PlayPauseButton />
      </AudioPlayerMachineContext.Provider>,
    );

    const button = screen.getByTestId('audio-loading-button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('loading...');
  });
});
