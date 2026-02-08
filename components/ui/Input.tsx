import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-bg-100 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary',
          'transition-colors duration-150',
          'focus:border-accent focus:ring-2 focus:ring-accent/50',
          error && 'border-destructive animate-shake',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
