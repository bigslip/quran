import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Link, { LinkVariant } from './Link';

// Mock NextLink to just render its children with href
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => {
    return children;
  },
}));

describe('Link', () => {
  afterEach(cleanup);

  it('renders an anchor tag with href', () => {
    render(<Link href="/about">About Us</Link>);
    const anchor = screen.getByRole('link', { name: 'About Us' });
    expect(anchor.getAttribute('href')).toBe('/about');
  });

  it('applies new tab attributes', () => {
    render(<Link href="/external" isNewTab>External</Link>);
    const anchor = screen.getByRole('link', { name: 'External' });
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noreferrer');
  });

  it('spreads remaining props to the root anchor element', () => {
    render(
      <Link href="/spread" data-testid="spread-link" aria-expanded="false">
        Spread Props
      </Link>
    );
    const anchor = screen.getByTestId('spread-link');
    expect(anchor.getAttribute('aria-expanded')).toBe('false');
  });

  it('applies variant classes', () => {
    render(
      <Link href="/variant" variant={LinkVariant.Primary} data-testid="variant-link">
        Primary
      </Link>
    );
    const anchor = screen.getByTestId('variant-link');
    expect(anchor.className).toContain('primary');
  });
});
