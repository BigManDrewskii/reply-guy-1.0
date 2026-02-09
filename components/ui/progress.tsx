import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  color?: string;
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
  const normalizedValue = Math.min(Math.max((value / max) * 100, 0), 100);

  const autoVariant =
    variant ||
    (normalizedValue >= 60 ? 'success' : normalizedValue >= 30 ? 'warning' : 'error');

  const barColors = {
    default: 'bg-muted-foreground',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  };

  const textColors = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  };

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
                'text-xs font-semibold font-numerical tabular-nums',
                textColors[autoVariant]
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
        className={cn('w-full bg-muted/70 rounded-full overflow-hidden', {
          'h-1': size === 'sm',
          'h-1.5': size === 'md',
          'h-2.5': size === 'lg',
        })}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            color ? '' : barColors[autoVariant]
          )}
          style={{
            width: `${normalizedValue}%`,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(color && { backgroundColor: color }),
          }}
        />
      </div>
    </div>
  );
}
