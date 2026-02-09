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
          'rounded-lg px-3 py-2.5 text-xs leading-relaxed',
          {
            'bg-muted/50 text-muted-foreground border border-border/60': variant === 'default',
            'bg-destructive/10 text-destructive border border-destructive/20': variant === 'error',
            'bg-warning/10 text-warning border border-warning/20': variant === 'warning',
            'bg-info/10 text-info border border-info/20': variant === 'info',
            'bg-success/10 text-success border border-success/20': variant === 'success',
          },
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-2">
          <Icon size={14} className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-medium text-xs mb-0.5">{title}</p>
            )}
            <div className="text-xs opacity-90">{children}</div>
            {action && (
              <button
                onClick={action.onClick}
                className="text-xs font-medium underline underline-offset-2 hover:no-underline mt-1"
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
