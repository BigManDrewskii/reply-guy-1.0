import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from '@/lib/icons';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'warning' | 'info' | 'success';
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, action, children, ...props }, ref) => {
    const icons = {
      default: Info,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      success: CheckCircle,
    };

  const Icon = icons[variant];

  return (
    <div
      ref={ref}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'border rounded-lg p-4 relative',
        {
          'border-border bg-card': variant === 'default',
          'border-destructive bg-card': variant === 'error',
          'border-warning bg-card': variant === 'warning',
          'border-info bg-card': variant === 'info',
          'border-success bg-card': variant === 'success',
        },
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <div className={cn('flex-shrink-0', {
          'text-muted-foreground': variant === 'default',
          'text-destructive': variant === 'error',
          'text-warning': variant === 'warning',
          'text-info': variant === 'info',
          'text-success': variant === 'success',
        })}>
          <Icon size={18} />
        </div>

        <div className="flex-1 space-y-1">
          {title && (
            <div className="font-semibold text-sm text-foreground">{title}</div>
          )}
          <div className={cn('text-sm', {
            'text-muted-foreground': variant === 'default',
            'text-destructive': variant === 'error',
            'text-warning': variant === 'warning',
            'text-info': variant === 'info',
            'text-success': variant === 'success',
          })}>
            {children}
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'text-sm font-medium underline underline-offset-2 hover:no-underline',
                {
                  'text-primary': variant === 'default',
                  'text-destructive': variant === 'error',
                  'text-warning': variant === 'warning',
                  'text-info': variant === 'info',
                  'text-success': variant === 'success',
                }
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';
