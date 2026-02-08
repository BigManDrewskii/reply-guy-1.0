import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  color?: string; // Override auto-color
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant,
  showValue = false,
  label,
  color,
  className,
  ...props
}: ProgressProps) {
  // Normalize value to 0-100
  const normalizedValue = Math.min(Math.max((value / max) * 100, 0), 100);

  // Auto-coloring based on value
  const autoVariant =
    variant ||
    (normalizedValue >= 60 ? 'success' : normalizedValue >= 30 ? 'warning' : 'error');

  const colorClasses = {
    default: 'bg-muted-foreground',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  };

  const progressColor = color;

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          )}
          {showValue && (
            <span
              className={cn(
                'text-sm font-semibold font-numerical',
                colorClasses[autoVariant]
              )}
            >
              {Math.round(normalizedValue)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={Math.round(normalizedValue)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('w-full bg-muted rounded-full overflow-hidden', {
          'h-1': size === 'sm',
          'h-2': size === 'md',
          'h-3': size === 'lg',
        })}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            color ? '' : colorClasses[autoVariant]
          )}
          style={{
            width: `${normalizedValue}%`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            ...(color && { backgroundColor: color }),
          }}
        />
      </div>
    </div>
  );
}
