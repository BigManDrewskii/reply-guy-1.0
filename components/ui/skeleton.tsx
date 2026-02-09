import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'text' | 'avatar';
}

export default function Skeleton({ className, variant = 'pulse' }: SkeletonProps) {
  const baseClasses = cn(
    'skeleton-shimmer animate-shimmer',
    'bg-[length:200%_100%]',
  );

  const variantClasses = {
    pulse: 'rounded-lg',
    text: 'rounded h-3 w-full',
    avatar: 'rounded-full'
  };

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn(baseClasses, variantClasses[variant], className)}
    />
  );
}

// Pre-configured skeleton components for common use cases
export function ProfileCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3" data-testid="profile-card-skeleton">
      {/* Avatar + Name row */}
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-2/3 h-4" />
          <Skeleton variant="text" className="w-1/3 h-3" />
        </div>
      </div>
      {/* Bio */}
      <div className="space-y-1.5">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

export function MessageCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3" data-testid="message-card-skeleton">
      {/* Section label */}
      <Skeleton variant="text" className="w-16 h-3" />
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/40 p-0.5">
        <Skeleton variant="pulse" className="h-7 flex-1 rounded-md" />
        <Skeleton variant="pulse" className="h-7 flex-1 rounded-md" />
        <Skeleton variant="pulse" className="h-7 flex-1 rounded-md" />
        <Skeleton variant="pulse" className="h-7 flex-1 rounded-md" />
      </div>
      {/* Message content */}
      <div className="space-y-1.5 pt-1">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-4/5" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/5" />
      </div>
      {/* Button */}
      <Skeleton variant="pulse" className="h-9 w-full rounded-lg" />
    </div>
  );
}
