import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { forwardRef } from 'react';

type DateFieldProps = Omit<TextFieldProps, 'type' | 'InputProps' | 'InputLabelProps'>;

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField(props, ref) {
    return (
      <TextField
        {...props}
        ref={ref}
        type="date"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarIcon sx={{ fontSize: 18, opacity: 0.5 }} />
            </InputAdornment>
          ),
        }}
      />
    );
  }
);
