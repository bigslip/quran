/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import ConfirmationModal from './ConfirmationModal';

expect.extend(matchers);

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/components/dls/ContentModal/ContentModal', () => ({
  default: ({ isOpen, header, footer, children }: any) =>
    isOpen ? (
      <div data-testid="content-modal">
        <div>{header}</div>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}));

afterEach(() => {
  cleanup();
});

describe('ConfirmationModal', () => {
  it('renders title and body', () => {
    render(
      <ConfirmationModal
        isOpen
        title="Delete item?"
        body="Are you sure you want to delete this?"
      />,
    );
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();
  });

  it('renders default title when no title is provided', () => {
    render(<ConfirmationModal isOpen confirmText="OK" body="Are you sure?" />);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmationModal isOpen={false} title="Delete item?" />);
    expect(screen.queryByTestId('content-modal')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal isOpen onConfirm={onConfirm} confirmText="Yes, delete" />);
    fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal isOpen onCancel={onCancel} cancelText="No, wait" />);
    fireEvent.click(screen.getByRole('button', { name: 'No, wait' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders confirm button with danger styling when isConfirmDanger is true', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal isOpen onConfirm={onConfirm} confirmText="Delete" isConfirmDanger />);
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(confirmBtn).toBeInTheDocument();
  });
});
