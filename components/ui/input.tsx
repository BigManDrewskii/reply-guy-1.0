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
          'flex w-full rounded-lg bg-input text-foreground placeholder:text-muted-foreground/60',
          'border transition-all duration-[180ms] ease-out',
          'focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-border-hover focus:bg-input-hover',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'hover:border-border-hover',
          {
            'border-border/50': variant === 'default' && !error,
            'border-border/70': variant === 'bordered' && !error,
            'border-destructive/60 focus:ring-destructive/20': error,
          },
          {
            'h-8 px-2.5 text-xs': size === 'sm',
            'h-9 px-3 text-sm': size === 'md',
            'h-10 px-4 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
