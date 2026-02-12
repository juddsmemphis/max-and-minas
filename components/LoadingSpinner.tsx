'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        'spinner-groovy',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="font-display text-chocolate/60 animate-pulse">Loading...</p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="groovy-card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-6 bg-psychedelic-purple/20 rounded-lg flex-1" />
        <div className="h-6 w-20 bg-psychedelic-pink/20 rounded-full" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-psychedelic-purple/10 rounded-full" />
        <div className="h-5 w-12 bg-psychedelic-pink/10 rounded-full" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="h-4 w-20 bg-chocolate/10 rounded" />
        <div className="h-4 w-24 bg-chocolate/10 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-psychedelic-purple/10">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-psychedelic-pink/20 rounded-full" />
          <div className="h-8 w-8 bg-psychedelic-blue/20 rounded-full" />
        </div>
        <div className="h-4 w-8 bg-chocolate/10 rounded" />
      </div>
    </div>
  );
}
