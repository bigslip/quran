import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslationViewCellSkeleton from './TranslationViewCellSkeleton';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => ({
    quranFont: 'qpc_uthmani_hafs',
    quranTextFontScale: 3,
    translationFontScale: 3,
    mushafLines: '16_lines',
  })),
  shallowEqual: vi.fn(),
}));

vi.mock('@/hooks/useGetQueryParamOrReduxValue', () => ({
  default: () => ({ value: [131, 20] }),
}));

describe('TranslationViewCellSkeleton', () => {
  afterEach(cleanup);

  it('renders skeleton items without nested button tags or hydration errors', () => {
    const { container } = render(
      <TranslationViewCellSkeleton data-testid="translation-cell-skeleton" hasActionMenuItems={true} />
    );

    const el = screen.getByTestId('translation-cell-skeleton');
    expect(el).toBeTruthy();

    // Ensure no nested button elements are rendered inside Skeleton
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);

    // Ensure action skeletons are present
    const skeletons = container.querySelectorAll('span[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
