import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import PlaybackControls from './PlaybackControls';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ lang: 'en', t: (key: string) => key }),
}));

vi.mock('@xstate/react', () => ({
  useSelector: () => false,
}));

vi.mock('@/hooks/useGetChaptersData', () => ({ default: () => ({}) }));

vi.mock('./Buttons/CloseButton', () => ({ default: () => <div /> }));
vi.mock('./Buttons/PlayPauseButton', () => ({ default: () => <div /> }));
vi.mock('./Buttons/VolumeControl', () => ({ default: () => <div /> }));
vi.mock('./OverflowAudioPlayerActionsMenu', () => ({ default: () => <div /> }));
vi.mock('./SeekButton', () => ({ default: () => <div />, SeekButtonType: { PrevAyah: 'prev', NextAyah: 'next' } }));

describe('PlaybackControls', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    render(
      <PlaybackControls 
        data-testid="playback-controls" 
        aria-hidden="true" 
        className="extra-class"
      />
    );
    const el = screen.getByTestId('playback-controls');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.classList.contains('extra-class')).toBe(true);
  });
});
