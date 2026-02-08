import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'text' | 'avatar';
}

export default function Skeleton({ className, variant = 'pulse' }: SkeletonProps) {
  const baseClasses = cn(
    'skeleton-shimmer animate-shimmer',
    'bg-gradient-to-r from-muted via-muted-hover to-muted',
    'bg-[length:200%_100%]',
  );

  const variantClasses = {
    pulse: 'rounded-lg',
    text: 'rounded h-4 w-full',
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
    <div className="space-y-4" data-testid="profile-card-skeleton">
      {/* Avatar + Name row */}
      <div className="flex items-start gap-3">
        <Skeleton variant="avatar" className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      {/* Stats row */}
      <div className="flex gap-4">
        <Skeleton variant="pulse" className="h-8 flex-1" />
        <Skeleton variant="pulse" className="h-8 flex-1" />
        <Skeleton variant="pulse" className="h-8 flex-1" />
      </div>
      {/* Bio section */}
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
    <div className="space-y-4" data-testid="message-card-skeleton">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/4 h-5" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton variant="pulse" className="h-8 flex-1" />
        <Skeleton variant="pulse" className="h-8 flex-1" />
        <Skeleton variant="pulse" className="h-8 flex-1" />
        <Skeleton variant="pulse" className="h-8 flex-1" />
      </div>
      {/* Message content */}
      <div className="space-y-2 pt-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-4/5" />
      </div>
    </div>
  );
}
