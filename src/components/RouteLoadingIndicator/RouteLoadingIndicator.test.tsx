import React from 'react';

import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import RouteLoadingIndicator from './RouteLoadingIndicator';

let mockEventHandlers: Record<string, ((url: string) => void)[]> = {};

vi.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/',
    events: {
      on: (event: string, handler: (url: string) => void) => {
        mockEventHandlers[event] = mockEventHandlers[event] || [];
        mockEventHandlers[event].push(handler);
      },
      off: (event: string, handler: (url: string) => void) => {
        if (mockEventHandlers[event]) {
          mockEventHandlers[event] = mockEventHandlers[event].filter((h) => h !== handler);
        }
      },
    },
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
  }),
}));

describe('RouteLoadingIndicator Component', () => {
  beforeEach(() => {
    mockEventHandlers = {};
    vi.clearAllMocks();
  });

  it('renders nothing initially when not navigating', () => {
    render(<RouteLoadingIndicator />);
    expect(screen.queryByTestId('route-loading-indicator')).toBeNull();
  });

  it('renders loading indicator when routeChangeStart fires and displays contextual label', () => {
    render(<RouteLoadingIndicator />);

    // Trigger route change start for a Surah route
    act(() => {
      mockEventHandlers.routeChangeStart?.forEach((handler) => handler('/2'));
    });

    expect(screen.getByTestId('route-loading-indicator')).toBeTruthy();
    expect(screen.getByText('Loading Surah...')).toBeTruthy();

    // Trigger route change complete
    act(() => {
      mockEventHandlers.routeChangeComplete?.forEach((handler) => handler('/2'));
    });
  });

  it('handles Juz and Page routes with appropriate labels', () => {
    render(<RouteLoadingIndicator />);

    act(() => {
      mockEventHandlers.routeChangeStart?.forEach((handler) => handler('/juz/3'));
    });
    expect(screen.getByText('Loading Juz...')).toBeTruthy();

    act(() => {
      mockEventHandlers.routeChangeStart?.forEach((handler) => handler('/page/10'));
    });
    expect(screen.getByText('Loading Page...')).toBeTruthy();
  });
});
