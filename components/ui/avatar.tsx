import { forwardRef, HTMLAttributes, useState, useMemo } from 'react';
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

/**
 * Generate a deterministic gradient from a string (name/initial).
 * Uses oklch hue rotation for consistent, pleasant colors.
 */
function getGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, oklch(0.55 0.15 ${hue1}), oklch(0.45 0.18 ${hue2}))`;
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
      xs: 'w-5 h-5 text-[9px]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
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
      online: 'var(--color-success)',
      offline: 'var(--color-muted-foreground)',
      away: 'var(--color-warning)',
      busy: 'var(--color-destructive)',
    };

    const hasError = error || imgError;
    const showFallback = hasError || !src;

    const gradient = useMemo(
      () => getGradient(fallback || alt || '?'),
      [fallback, alt]
    );

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex flex-shrink-0', sizeStyles[size], className)}
        {...props}
      >
        <div
          className={cn(
            'relative w-full h-full inline-flex items-center justify-center overflow-hidden',
            'font-semibold text-white',
            {
              'rounded-full': variant === 'circle',
              'rounded-lg': variant === 'square',
            }
          )}
          style={showFallback ? { background: gradient } : undefined}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
              <Loader2 size={loaderSize} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {!showFallback ? (
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
            <span className="select-none" aria-label={alt || fallback || 'Avatar'}>
              {fallback}
            </span>
          )}
        </div>

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
              {
                'h-1.5 w-1.5': size === 'xs' || size === 'sm',
                'h-2.5 w-2.5': size === 'md' || size === 'lg',
                'h-3 w-3': size === 'xl',
              }
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
