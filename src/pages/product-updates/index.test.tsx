import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductUpdatesPage from './index';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key) => key, lang: 'en' }),
}));

describe('ProductUpdatesPage', () => {
  it('renders correctly and accepts HTML attributes', () => {
    const pages = [{
      slug: { current: 'test-slug' },
      title: 'Test Update',
      date: '2026-08-01',
      summary: 'A test update'
    }];
    render(<ProductUpdatesPage pages={pages} data-testid="product-updates-page" />);
    
    expect(screen.getByTestId('product-updates-page')).toBeInTheDocument();
  });
});
