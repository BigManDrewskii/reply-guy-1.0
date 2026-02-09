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
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
        {
          // Variants — muted, refined tints
          'bg-muted text-muted-foreground': variant === 'default',
          'bg-success-subtle text-success': variant === 'success',
          'bg-warning-subtle text-warning': variant === 'warning',
          'bg-destructive-subtle text-destructive': variant === 'error',
          'bg-info-subtle text-info': variant === 'info',
          'border border-border/50 text-muted-foreground': variant === 'outline',

          // Sizes
          'px-2 py-0.5 text-[10px]': size === 'sm',
          'px-2.5 py-0.5 text-[11px]': size === 'md',
        },
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
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
