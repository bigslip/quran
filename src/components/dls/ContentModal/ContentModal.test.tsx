/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import ContentModal from './ContentModal';

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

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="close-icon" />,
}));

afterEach(() => {
  cleanup();
});

describe('ContentModal', () => {
  it('renders header, body, and footer', () => {
    render(
      <ContentModal isOpen header="My Header" footer={<span>My Footer</span>}>
        My Body
      </ContentModal>,
    );
    expect(screen.getByText('My Header')).toBeInTheDocument();
    expect(screen.getByText('My Body')).toBeInTheDocument();
    expect(screen.getByText('My Footer')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ContentModal isOpen={false} header="My Header">
        My Body
      </ContentModal>,
    );
    expect(screen.queryByText('My Header')).toBeNull();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ContentModal isOpen onClose={onClose} hasCloseButton />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
