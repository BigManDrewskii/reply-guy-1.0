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
    pulse: 'rounded-xl',
    text: 'rounded-md h-3 w-full',
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
    <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4" data-testid="profile-card-skeleton">
      {/* Avatar + Name row */}
      <div className="flex items-center gap-3.5">
        <Skeleton variant="avatar" className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <Skeleton variant="text" className="w-2/3 h-4" />
          <Skeleton variant="text" className="w-1/3 h-3" />
        </div>
      </div>
      {/* Bio */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

export function MessageCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4" data-testid="message-card-skeleton">
      {/* Section label */}
      <Skeleton variant="text" className="w-16 h-3" />
      {/* Tabs */}
      <div className="flex gap-1.5 rounded-xl bg-muted/40 p-1">
        <Skeleton variant="pulse" className="h-8 flex-1 rounded-lg" />
        <Skeleton variant="pulse" className="h-8 flex-1 rounded-lg" />
        <Skeleton variant="pulse" className="h-8 flex-1 rounded-lg" />
        <Skeleton variant="pulse" className="h-8 flex-1 rounded-lg" />
      </div>
      {/* Message content */}
      <div className="space-y-2 pt-1">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-4/5" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/5" />
      </div>
      {/* Button */}
      <Skeleton variant="pulse" className="h-10 w-full rounded-xl" />
    </div>
  );
}
