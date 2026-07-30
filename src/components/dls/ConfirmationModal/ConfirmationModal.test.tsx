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
  default: ({ isOpen, header, footer, children, onClose, hasCloseButton }: any) =>
    isOpen ? (
      <div data-testid="content-modal">
        <div>{header}</div>
        <div>{children}</div>
        <div>{footer}</div>
        {hasCloseButton && (
          <button type="button" data-testid="close-btn" onClick={onClose}>
            Close
          </button>
        )}
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

  it('does not throw when closed or rendered without onCancel in prop mode', () => {
    expect(() => {
      render(<ConfirmationModal isOpen onConfirm={vi.fn()} />);
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('close-btn')).not.toBeInTheDocument();
    }).not.toThrow();
  });

  it('renders close button when onCancel is provided', () => {
    const onCancel = vi.fn();
    render(<ConfirmationModal isOpen onCancel={onCancel} />);
    expect(screen.getByTestId('close-btn')).toBeInTheDocument();
  });

  it('renders confirm button with danger styling when isConfirmDanger is true', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal isOpen onConfirm={onConfirm} confirmText="Delete" isConfirmDanger />);
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn.className).toContain('error');
  });

  it('does not render body paragraph when body is not provided', () => {
    render(<ConfirmationModal isOpen title="No body" />);
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    const contentModal = screen.getByTestId('content-modal');
    expect(contentModal.querySelector('p')).toBeNull();
  });
});
