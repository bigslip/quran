/* eslint-disable i18next/no-literal-string */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Badge from './Badge';

expect.extend(matchers);

describe('Badge', () => {
  it('renders children correctly', () => {
    render(
      <Badge content="1">
        <button type="button">Click me</button>
      </Badge>,
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders the badge content', () => {
    render(
      <Badge content="5">
        <button type="button">Click me</button>
      </Badge>,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('has standard accessibility attributes', () => {
    render(
      <Badge aria-label="New notification" content="New">
        <button type="button">Messages</button>
      </Badge>,
    );
    const badgeElement = screen.getByLabelText('New notification');
    expect(badgeElement).toHaveAttribute('aria-label', 'New notification');
  });
});
