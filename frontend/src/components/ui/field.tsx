import { Field as ChakraField } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface FieldProps extends ChakraField.RootProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  function Field(props, ref) {
    const { label, children, helperText, errorText, required, ...rest } = props;
    return (
      <ChakraField.Root ref={ref} {...rest}>
        {label && (
          <ChakraField.Label>
            {label}
            {required && <ChakraField.RequiredIndicator />}
          </ChakraField.Label>
        )}
        {children}
        {helperText && <ChakraField.HelperText>{helperText}</ChakraField.HelperText>}
        {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
      </ChakraField.Root>
    );
  }
);
