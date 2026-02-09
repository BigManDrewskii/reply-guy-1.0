import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors',
        {
          // Variants
          'bg-muted text-muted-foreground': variant === 'default',
          'bg-success/15 text-success': variant === 'success',
          'bg-warning/15 text-warning': variant === 'warning',
          'bg-destructive/15 text-destructive': variant === 'error',
          'bg-info/15 text-info': variant === 'info',
          'border border-border text-muted-foreground': variant === 'outline',

          // Sizes
          'px-1.5 py-0.5 text-[10px]': size === 'sm',
          'px-2 py-0.5 text-xs': size === 'md',
        },
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            {
              'bg-muted-foreground': variant === 'default' || variant === 'outline',
              'bg-success': variant === 'success',
              'bg-warning': variant === 'warning',
              'bg-destructive': variant === 'error',
              'bg-info': variant === 'info',
            }
          )}
        />
      )}
      {children}
    </span>
  );
}
