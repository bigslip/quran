import React from 'react';

import classNames from 'classnames';

import styles from './AuthInput.module.scss';

import Input, { InputSize, InputType } from '@/components/dls/Forms/Input';

export interface AuthInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'onChange' | 'value' | 'type' | 'onClick'
  > {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  htmlType?: 'text' | 'email' | 'password';
  name?: string;
  autoComplete?: string;
  className?: string;
  error?: any;
  isInvalid?: boolean;
  type?: InputType;
  dataTestId?: string;
}

/**
 * Specialized input component for authentication forms.
 * Provides consistent styling and behavior across all auth forms.
 * @param {AuthInputProps} props - The component props
 * @returns {React.FC<AuthInputProps>} - The AuthInput component
 */
const AuthInput: React.FC<AuthInputProps> = ({
  id,
  value,
  onChange,
  onClick,
  placeholder,
  disabled = false,
  htmlType = 'text',
  name,
  autoComplete,
  className,
  error,
  isInvalid,
  type,
  dataTestId,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  ...restProps
}) => {
  const hasError = isInvalid || !!error;

  return (
    <Input
      id={id}
      value={value}
      onChange={onChange}
      onClick={onClick}
      placeholder={placeholder}
      disabled={disabled}
      htmlType={htmlType}
      name={name}
      size={InputSize.Large}
      type={hasError ? InputType.Error : type}
      fixedWidth={false}
      shouldFlipOnRTL
      containerClassName={classNames(styles.authContainer, className, {
        [styles.disabled]: disabled,
      })}
      inputClassName={classNames(styles.authInput, {
        [styles.hasValue]: value,
      })}
      aria-invalid={ariaInvalid !== undefined ? ariaInvalid : hasError}
      aria-describedby={ariaDescribedby}
      data-testid={dataTestId}
      {...(autoComplete && { autoComplete })}
      {...restProps}
    />
  );
};

export default AuthInput;
