import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from '@/lib/icons';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info'
    | 'cta'
    | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const hasChildren = children !== undefined && children !== null;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center font-medium',
          'transition-all duration-[180ms] ease-out',
          'rounded-lg',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:ring-ring',
          'active:scale-[0.98] active:duration-75',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',

          // Sizes
          {
            'h-7 px-2.5 text-xs gap-1.5 rounded-md': size === 'xs',
            'h-8 px-3 text-xs gap-1.5 rounded-md': size === 'sm',
            'h-9 px-4 text-sm gap-2': size === 'md',
            'h-10 px-5 text-sm gap-2': size === 'lg',
            'h-11 px-6 text-base gap-2.5 rounded-xl': size === 'xl',
          },

          // Icon button
          icon && hasChildren === false && {
            'h-7 w-7 px-0': size === 'xs',
            'h-8 w-8 px-0': size === 'sm',
            'h-9 w-9 px-0': size === 'md',
            'h-10 w-10 px-0': size === 'lg',
            'h-11 w-11 px-0': size === 'xl',
          },

          // Variants
          {
            // Primary / CTA — high contrast, clean
            'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active':
              variant === 'primary' || variant === 'cta',

            // Secondary — subtle surface
            'bg-card text-card-foreground border border-border/50 hover:bg-card-hover hover:border-border-hover':
              variant === 'secondary',

            // Ghost — invisible until hover
            'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground':
              variant === 'ghost',

            // Outline — border emphasis
            'bg-transparent text-foreground border border-border hover:bg-muted/50 hover:border-border-hover':
              variant === 'outline',

            // Danger
            'bg-destructive text-destructive-foreground hover:bg-destructive-hover':
              variant === 'danger',

            // Success
            'bg-success text-success-foreground hover:bg-success-hover':
              variant === 'success',

            // Warning
            'bg-warning text-warning-foreground hover:bg-warning-hover':
              variant === 'warning',

            // Info
            'bg-info text-info-foreground hover:bg-info-hover':
              variant === 'info',
          },

          className
        )}
        {...props}
      >
        {loading && (
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-lg',
              {
                'bg-primary': variant === 'primary' || variant === 'cta',
                'bg-card': variant === 'secondary',
                'bg-transparent': variant === 'ghost' || variant === 'outline',
                'bg-destructive': variant === 'danger',
                'bg-success': variant === 'success',
                'bg-warning': variant === 'warning',
                'bg-info': variant === 'info',
              }
            )}
            aria-hidden="true"
          >
            <Loader2
              size={
                size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : size === 'xl' ? 20 : 16
              }
              className="animate-spin"
            />
          </span>
        )}
        <span className={cn('inline-flex items-center gap-1.5 transition-opacity duration-150', loading && 'opacity-0')}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
