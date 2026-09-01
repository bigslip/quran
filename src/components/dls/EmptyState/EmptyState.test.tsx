/* eslint-disable i18next/no-literal-string */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import EmptyState from './EmptyState';

expect.extend(matchers);

describe('EmptyState', () => {
  it('renders title and description correctly', () => {
    render(
      <EmptyState
        title="No items found"
        description="Try adjusting your filters or search terms"
        testId="empty-state"
      />,
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
  });

  it('renders icon and action button when provided', () => {
    render(
      <EmptyState
        title="No bookmarks"
        icon={<span data-testid="test-icon">icon</span>}
        primaryAction={<button type="button">Create Bookmark</button>}
      />,
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Bookmark' })).toBeInTheDocument();
  });
});
