import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AudioPlayerSlider from './AudioPlayerSlider';

vi.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en' }),
}));

vi.mock('@/hooks/useDirection', () => ({ default: () => 'ltr' }));

vi.mock('@xstate/react', () => ({
  useSelector: () => 0,
}));

vi.mock('@/dls/Slider', () => ({ default: () => <div data-testid="slider" />, SliderVariant: { Secondary: "secondary" }, Direction: {} }));

describe('AudioPlayerSlider', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    render(
      <AudioPlayerSlider 
        data-testid="audio-player-slider" 
        aria-hidden="true" 
        className="extra-class"
      />
    );
    const el = screen.getByTestId('audio-player-slider');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.classList.contains('extra-class')).toBe(true);
  });
});
