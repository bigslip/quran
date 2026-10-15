import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FormBuilder from './FormBuilder';

import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';

vi.mock('@/icons/close.svg', () => ({
  default: () => <span data-testid="clear-icon" />,
}));

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
  }),
}));

describe('FormBuilder', () => {
  afterEach(cleanup);

  it('renders form fields with labels and submit action button', () => {
    const fields = [
      {
        field: 'username',
        type: FormFieldType.Text,
        label: 'Username',
        placeholder: 'Enter username',
      },
    ];

    render(
      <FormBuilder
        formFields={fields}
        onSubmit={vi.fn()}
        actionText="Submit Form"
      />,
    );

    expect(screen.getByText('Username')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter username')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Submit Form' })).toBeDefined();
  });

  it('submits form data when valid and user types', async () => {
    const handleSubmit = vi.fn();
    const fields = [
      {
        field: 'email',
        type: FormFieldType.Text,
        label: 'Email',
        placeholder: 'Enter email',
      },
    ];

    render(
      <FormBuilder
        formFields={fields}
        onSubmit={handleSubmit}
        actionText="Send"
        shouldSkipValidation
      />,
    );

    const input = screen.getByPlaceholderText('Enter email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    const submitBtn = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
    });
  });

  it('displays validation error when field is invalid', async () => {
    const handleSubmit = vi.fn();
    const fields = [
      {
        field: 'requiredField',
        type: FormFieldType.Text,
        label: 'Required Field',
        placeholder: 'Fill me',
        rules: [
          {
            type: RuleType.MinimumLength,
            value: 5,
            errorMessage: 'Too short',
          },
        ],
      },
    ];

    render(
      <FormBuilder
        formFields={fields}
        onSubmit={handleSubmit}
        actionText="Submit"
      />,
    );

    const input = screen.getByPlaceholderText('Fill me');
    fireEvent.change(input, { target: { value: 'ab' } });

    await waitFor(() => {
      expect(screen.getByText('Too short')).toBeDefined();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
