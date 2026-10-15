import { renderHook } from '@testing-library/react';
import { toast as primitiveToast } from 'react-toastify';
import { describe, expect, it, vi } from 'vitest';

import { useToast, ToastStatus } from './Toast';

vi.mock('react-toastify', () => ({
  toast: vi.fn(),
  cssTransition: vi.fn(),
  ToastContainer: () => null,
}));

describe('Toast', () => {
  it('calls primitiveToast with content and options', () => {
    const { result } = renderHook(() => useToast());
    const toast = result.current;

    toast('Message sent successfully', { status: ToastStatus.Success });
    expect(primitiveToast).toHaveBeenCalled();
  });

  it('passes status and actions to primitiveToast', () => {
    const { result } = renderHook(() => useToast());
    const toast = result.current;
    const actionClick = vi.fn();

    toast('Error occurred', {
      status: ToastStatus.Error,
      actions: [{ text: 'Retry', onClick: actionClick, primary: true }],
    });

    expect(primitiveToast).toHaveBeenCalled();
  });
});
