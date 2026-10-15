import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Modal from './Modal';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <span data-testid="close-icon" />,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
  }),
}));

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

describe('Modal', () => {
  afterEach(cleanup);

  it('renders modal content when isOpen is true', () => {
    render(
      <Modal isOpen>
        <Modal.Body>
          <p>Modal Body Content</p>
        </Modal.Body>
      </Modal>,
    );

    expect(screen.getByText('Modal Body Content')).toBeDefined();
  });

  it('renders modal header, title, and footer', () => {
    render(
      <Modal isOpen>
        <Modal.Header>
          <Modal.Title>Modal Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>Body text</Modal.Body>
        <Modal.Footer>
          <Modal.Action>Save</Modal.Action>
        </Modal.Footer>
      </Modal>,
    );

    expect(screen.getByText('Modal Title')).toBeDefined();
    expect(screen.getByText('Save')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen hasCloseButton onClose={handleClose}>
        <Modal.Body>Content</Modal.Body>
      </Modal>,
    );

    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
