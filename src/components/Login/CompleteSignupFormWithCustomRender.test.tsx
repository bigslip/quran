import { describe, it, expect, vi } from 'vitest';
import addCustomRenderToCompleteSignupFormFields from './CompleteSignupFormWithCustomRender';
import { FormBuilderFormField } from '../FormBuilder/FormBuilderTypes';
import { FormFieldType } from 'types/FormField';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('./AuthInput', () => ({
  default: ({ htmlType, ...props }: any) => (
    <input 
      data-testid="auth-input" 
      type={htmlType}
      {...props} 
    />
  )
}));

describe('addCustomRenderToCompleteSignupFormFields', () => {
  it('adds customRender that propagates all props to AuthInput', () => {
    const fields: FormBuilderFormField[] = [
      { field: 'firstName', type: FormFieldType.Text, label: 'First Name' }
    ];

    const result = addCustomRenderToCompleteSignupFormFields(fields, undefined, {});
    
    expect(result[0].customRender).toBeDefined();
    
    const CustomRender = result[0].customRender as any;
    
    render(
      <CustomRender 
        value="test" 
        onChange={() => {}} 
        aria-invalid="true" 
        data-custom="custom-value"
      />
    );
    
    const input = screen.getByTestId('auth-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('data-custom', 'custom-value');
    expect(input).toHaveAttribute('id', 'firstName');
    expect(input).toHaveValue('test');
  });
});
