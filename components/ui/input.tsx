import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  variant?: 'default' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'flex w-full rounded-lg bg-background text-foreground placeholder:text-muted-foreground',
          'border transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          {
            'border-border': variant === 'default' && !error,
            'border-border/80': variant === 'bordered' && !error,
            'border-destructive focus:ring-destructive/30': error,
          },
          {
            'h-8 px-2.5 text-xs': size === 'sm',
            'h-9 px-3 text-sm': size === 'md',
            'h-10 px-3.5 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
