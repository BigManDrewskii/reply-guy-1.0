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
          // Base styles
          'relative inline-flex items-center justify-center font-semibold',
          'transition-all duration-150 ease-out',
          'rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary/50',
          'active:scale-95 data-[state=pressed]:scale-95 active:duration-100 active:ease-in',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',

          // Sizes using spacing tokens
          {
            'h-7 px-3 text-xs gap-1.5': size === 'xs',
            'h-8 px-4 text-sm gap-2': size === 'sm',
            'h-9 px-5 text-base gap-2': size === 'md',
            'h-11 px-6 text-lg gap-3': size === 'lg',
            'h-12 px-7 text-xl gap-3': size === 'xl',
          },

          // Icon button sizing (square buttons)
          icon && hasChildren === false && {
            'h-7 w-7': size === 'xs',
            'h-8 w-8': size === 'sm',
            'h-9 w-9': size === 'md',
            'h-11 w-11': size === 'lg',
            'h-12 w-12': size === 'xl',
          },

          // Variants using design tokens
          {
            // Primary & CTA - inverted CTA style (white bg, black text)
            'bg-cta text-cta-foreground hover:bg-cta-hover active:bg-cta-active border border-transparent':
              variant === 'primary' || variant === 'cta',

            // Secondary - card background
            'bg-card text-card-foreground border border-border hover:bg-card-hover active:bg-accent':
              variant === 'secondary',

            // Ghost - transparent with hover
            'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground active:bg-muted-hover':
              variant === 'ghost',

            // Danger
            'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:opacity-80 border border-transparent':
              variant === 'danger',

            // Success
            'bg-success text-success-foreground hover:bg-success-hover active:opacity-80 border border-transparent':
              variant === 'success',

            // Warning
            'bg-warning text-warning-foreground hover:bg-warning-hover active:opacity-80 border border-transparent':
              variant === 'warning',

            // Info
            'bg-info text-info-foreground hover:bg-info-hover active:opacity-80 border border-transparent':
              variant === 'info',

            // Outline - transparent with border
            'bg-transparent text-foreground border border-border hover:bg-muted hover:border-border active:bg-muted-hover':
              variant === 'outline',
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
                'bg-cta': variant === 'primary' || variant === 'cta',
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
                size === 'xs'
                  ? 12
                  : size === 'sm'
                    ? 14
                    : size === 'lg'
                      ? 20
                      : size === 'xl'
                        ? 24
                        : 16
              }
              className="animate-spin"
            />
          </span>
        )}
        <span className={cn('transition-opacity', loading && 'opacity-0')}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
