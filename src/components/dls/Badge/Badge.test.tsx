import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge, { BadgePosition } from './Badge';

expect.extend(matchers);

describe('Badge', () => {
  it('renders children correctly', () => {
    render(
      <Badge content="1">
        <button>Click me</button>
      </Badge>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders the badge content', () => {
    render(
      <Badge content="5">
        <button>Click me</button>
      </Badge>
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('has standard accessibility attributes', () => {
    render(
      <Badge content="New" aria-label="New notification">
        <button>Messages</button>
      </Badge>
    );
    // Badge should probably support passing ARIA attributes or have role="status"
    const badgeElement = screen.getByText('New');
    expect(badgeElement).toHaveAttribute('role', 'status');
  });
});
