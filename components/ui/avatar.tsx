import { forwardRef, HTMLAttributes, useState } from 'react';
import { Loader2, AlertCircle } from '@/lib/icons';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string; // initials
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  loading?: boolean;
  error?: boolean;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      fallback,
      size = 'md',
      variant = 'circle',
      status,
      loading = false,
      error = false,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = useState(false);

    const sizeStyles = {
      xs: 'w-5 h-5 text-xs',
      sm: 'w-8 h-8 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    const loaderSize = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
    }[size];

    const statusColors = {
      online: 'hsl(var(--success))',
      offline: 'hsl(var(--muted-foreground))',
      away: 'hsl(var(--warning))',
      busy: 'hsl(var(--destructive))',
    };

    const hasError = error || imgError;

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex flex-shrink-0', sizeStyles[size], className)}
        {...props}
      >
        <div
          className={cn(
            'relative inline-flex items-center justify-center overflow-hidden',
            'bg-card text-card-foreground font-semibold',
            {
              'rounded-full': variant === 'circle',
              'rounded-lg': variant === 'square',
            }
          )}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
              <Loader2 size={loaderSize} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {!hasError && src ? (
            <img
              src={src}
              alt={alt || ''}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : hasError && !fallback ? (
            <div className="w-full h-full flex items-center justify-center bg-destructive/10">
              <AlertCircle size={loaderSize} className="text-destructive" />
            </div>
          ) : (
            <span aria-label={alt || fallback || 'Avatar'}>{fallback}</span>
          )}
        </div>

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background',
              'border-2 border-background'
            )}
            style={{ backgroundColor: statusColors[status] }}
            role="status"
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
