import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TajweedWordImage from './TajweedWordImage';

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => 3),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranTextFontScale: vi.fn(() => 3),
}));

describe('TajweedWordImage', () => {
  afterEach(cleanup);

  it('renders image with correct CDN path and alt text', () => {
    render(
      <TajweedWordImage
        path="tajweed/1_1_1.png"
        alt="Tajweed word"
        data-testid="tajweed-image-word"
      />,
    );
    const container = screen.getByTestId('tajweed-image-word');
    expect(container).toBeTruthy();
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toBe('Tajweed word');
    expect(img?.getAttribute('src')).toContain('images/tajweed/1_1_1.png');
  });
});
