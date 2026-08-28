import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AudioKeyBoardListeners from './AudioKeyboardListeners';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

let hotkeyCallbacks: Record<string, (e: any) => void> = {};

vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: (key: string, callback: (e: any) => void, options: any) => {
    if (options?.enabled !== false) {
      hotkeyCallbacks[key] = callback;
    }
  },
}));

vi.mock('@/utils/eventLogger', () => ({
  logEvent: vi.fn(),
}));

describe('AudioKeyboardListeners', () => {
  afterEach(() => {
    cleanup();
    hotkeyCallbacks = {};
  });

  it('triggers togglePlaying when Space is pressed outside interactive elements', () => {
    const togglePlaying = vi.fn();
    const mockAudioService = { send: vi.fn() };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <AudioKeyBoardListeners togglePlaying={togglePlaying} isAudioPlayerHidden={false} />
      </AudioPlayerMachineContext.Provider>,
    );

    const spaceHandler = hotkeyCallbacks['space'];
    expect(spaceHandler).toBeDefined();

    const mockEvent = {
      target: document.createElement('div'),
      preventDefault: vi.fn(),
    };
    spaceHandler(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(togglePlaying).toHaveBeenCalled();
  });

  it('does NOT trigger togglePlaying when Space is pressed inside a button', () => {
    const togglePlaying = vi.fn();
    const mockAudioService = { send: vi.fn() };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <AudioKeyBoardListeners togglePlaying={togglePlaying} isAudioPlayerHidden={false} />
      </AudioPlayerMachineContext.Provider>,
    );

    const spaceHandler = hotkeyCallbacks['space'];
    const button = document.createElement('button');
    const mockEvent = {
      target: button,
      preventDefault: vi.fn(),
    };
    spaceHandler(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(togglePlaying).not.toHaveBeenCalled();
  });

  it('sends NEXT_AYAH when right arrow is pressed', () => {
    const togglePlaying = vi.fn();
    const mockAudioService = { send: vi.fn() };

    render(
      <AudioPlayerMachineContext.Provider
        value={mockAudioService as unknown as React.ContextType<typeof AudioPlayerMachineContext>}
      >
        <AudioKeyBoardListeners togglePlaying={togglePlaying} isAudioPlayerHidden={false} />
      </AudioPlayerMachineContext.Provider>,
    );

    const rightHandler = hotkeyCallbacks['right'];
    const mockEvent = {
      preventDefault: vi.fn(),
    };
    rightHandler(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockAudioService.send).toHaveBeenCalledWith({ type: 'NEXT_AYAH' });
  });
});
