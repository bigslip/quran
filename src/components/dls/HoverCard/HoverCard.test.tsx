import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import HoverCard from './index';

expect.extend(matchers);

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('HoverCard', () => {
  it('renders trigger and shows content on hover', async () => {
    render(
      <HoverCard content={<div>Hidden Info</div>} openDelay={0} closeDelay={0}>
        <span>Hover me</span>
      </HoverCard>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Info')).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText('Hover me'));
    await waitFor(() => {
      expect(screen.getByText('Hidden Info')).toBeInTheDocument();
    });
  });
});
