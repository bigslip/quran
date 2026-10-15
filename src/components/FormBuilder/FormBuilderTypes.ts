import { ReactNode } from 'react';

import FieldRule from 'types/FieldRule';
import FormField from 'types/FormField';

export type FormBuilderFieldRule = Pick<FieldRule, 'type' | 'value' | 'name'> & {
  errorMessage: string;
};

export type FormBuilderCustomRenderProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dataTestId?: string;
  error?: any;
  isInvalid?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  id?: string;
  name?: string;
};

export type FormBuilderFormField = Pick<FormField, 'field' | 'type'> & {
  defaultValue?: any;
  label?: string | ReactNode;
  placeholder?: string;
  rules?: FormBuilderFieldRule[];
  containerClassName?: string;
  errorClassName?: string;
  checked?: boolean;
  fieldSetLegend?: string;
  onChange?: (value: unknown) => void;
  extraSection?: ReactNode | ((value: string) => ReactNode);
  shouldShowValidationErrors?: boolean;
  customRender?: (props: FormBuilderCustomRenderProps) => ReactNode;
  dataTestId?: string;
};
