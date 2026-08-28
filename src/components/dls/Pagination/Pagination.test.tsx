import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Pagination from './Pagination';

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
  }),
}));

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

vi.mock('@/icons/caret-back.svg', () => ({
  default: () => <span data-testid="prev-icon" />,
}));

vi.mock('@/icons/caret-forward.svg', () => ({
  default: () => <span data-testid="next-icon" />,
}));

vi.mock('@/dls/Tooltip', () => ({
  default: ({ children }: any) => children,
  ContentSide: {
    BOTTOM: 'bottom',
    TOP: 'top',
    LEFT: 'left',
    RIGHT: 'right',
  },
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.page) return `Page ${params.page}`;
      return key;
    },
    lang: 'en',
  }),
}));

describe('Pagination', () => {
  afterEach(cleanup);

  it('renders null when total pages is less than 2', () => {
    const { container } = render(
      <Pagination currentPage={1} totalCount={10} pageSize={20} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination navigation landmark and buttons when total pages >= 2', () => {
    render(
      <Pagination currentPage={1} totalCount={100} pageSize={20} onPageChange={vi.fn()} />,
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toBeDefined();
    expect(nav.getAttribute('aria-label')).toBe('pagination-navigation');
  });

  it('marks current page with aria-current="page"', () => {
    render(
      <Pagination currentPage={2} totalCount={100} pageSize={20} onPageChange={vi.fn()} />,
    );

    const currentBtn = screen.getByRole('button', { name: 'Page 2' });
    expect(currentBtn.getAttribute('aria-current')).toBe('page');
  });

  it('disables previous button on the first page and calls onPageChange on next click', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalCount={100} pageSize={20} onPageChange={onPageChange} />,
    );

    const prevBtn = screen.getByTestId('previous-page-button');
    expect((prevBtn as HTMLButtonElement).disabled).toBe(true);

    const nextBtn = screen.getByTestId('next-page-button');
    expect((nextBtn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when a numbered page is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalCount={100} pageSize={20} onPageChange={onPageChange} />,
    );

    const page3Btn = screen.getByRole('button', { name: 'Page 3' });
    fireEvent.click(page3Btn);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables next button on the last page', () => {
    render(
      <Pagination currentPage={5} totalCount={100} pageSize={20} onPageChange={vi.fn()} />,
    );

    const nextBtn = screen.getByTestId('next-page-button');
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
  });
});
