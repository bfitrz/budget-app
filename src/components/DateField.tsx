import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';
import { CalendarMonth as CalendarIcon, Clear as ClearIcon } from '@mui/icons-material';
import { forwardRef } from 'react';

type DateFieldProps = Omit<TextFieldProps, 'type' | 'InputProps' | 'InputLabelProps'> & {
  onClear?: () => void;
};

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField({ onClear, value, onChange, ...props }, ref) {
    const hasValue = !!value;

    return (
      <TextField
        {...props}
        ref={ref}
        value={value}
        onChange={onChange}
        type="date"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: hasValue ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  // Trigger onChange with empty value
                  if (onClear) {
                    onClear();
                  } else if (onChange) {
                    const syntheticEvent = {
                      target: { value: '', name: (props as { name?: string }).name || '' },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                  }
                }}
                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          '& input[type="date"]::-webkit-calendar-picker-indicator': {
            filter: 'invert(0.5)',
            cursor: 'pointer',
          },
          ...((props.sx || {}) as object),
        }}
      />
    );
  }
);
