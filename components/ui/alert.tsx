import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from '@/lib/icons';

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
          'rounded-xl px-4 py-3 text-sm leading-relaxed',
          {
            'bg-muted/60 text-muted-foreground border border-border/30': variant === 'default',
            'bg-destructive-subtle text-destructive border border-destructive/15': variant === 'error',
            'bg-warning-subtle text-warning border border-warning/15': variant === 'warning',
            'bg-info-subtle text-info border border-info/15': variant === 'info',
            'bg-success-subtle text-success border border-success/15': variant === 'success',
          },
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-2.5">
          <Icon size={15} className="shrink-0 mt-0.5 opacity-80" />
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-medium text-sm mb-0.5">{title}</p>
            )}
            <div className="text-xs opacity-80 leading-relaxed">{children}</div>
            {action && (
              <button
                onClick={action.onClick}
                className="text-xs font-medium underline underline-offset-2 hover:no-underline mt-1.5 opacity-90 hover:opacity-100 transition-opacity"
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
