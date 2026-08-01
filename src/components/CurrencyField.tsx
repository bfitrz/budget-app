import { TextField, InputAdornment, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

type CurrencyFieldProps = Omit<TextFieldProps, 'type' | 'InputProps'> & {
  currency?: string;
};

export const CurrencyField = forwardRef<HTMLInputElement, CurrencyFieldProps>(
  function CurrencyField({ currency = 'PLN', ...props }, ref) {
    return (
      <TextField
        {...props}
        ref={ref}
        type="number"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.6 }}>
                {currency}
              </span>
            </InputAdornment>
          ),
          inputProps: { min: 0, step: 0.01 },
        }}
      />
    );
  }
);
