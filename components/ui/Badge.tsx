import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'platform';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2',
          {
            'border-border bg-bg-100 text-text-secondary': variant === 'default',
            'border-border bg-bg-150 text-text-primary': variant === 'platform',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
