import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RadioPlaybackControl from './RadioPlaybackControl';

vi.mock('@xstate/react', () => ({
  useActor: () => [{}],
}));

vi.mock('src/xstate/Radio/useCurrentStationInfo', () => ({
  default: () => ({ title: 'Test Title', description: 'Test Description' }),
}));

vi.mock('./Buttons/CloseRadioButton', () => ({ default: () => <div /> }));
vi.mock('./Buttons/PlayPauseButton', () => ({ default: () => <div /> }));

describe('RadioPlaybackControl', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    render(
      <RadioPlaybackControl 
        radioActor={{}}
        data-testid="radio-playback" 
        aria-hidden="true" 
        className="extra-class"
      />
    );
    const el = screen.getByTestId('radio-playback');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.classList.contains('extra-class')).toBe(true);
  });
});
