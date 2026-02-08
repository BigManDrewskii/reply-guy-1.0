interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'text' | 'avatar';
}

export default function Skeleton({ className = '', variant = 'pulse' }: SkeletonProps) {
  const baseClasses = 'bg-muted animate-shimmer';
  const variantClasses = {
    pulse: 'rounded-lg',
    text: 'rounded h-4 w-full',
    avatar: 'rounded-full'
  };

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
}
