'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-mm-gray-200 border-t-mm-red animate-spin',
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
      <p className="font-heading font-bold text-mm-gray-500 animate-pulse">Loading...</p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white border-3 border-mm-black rounded-xl shadow-bold p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-6 w-6 skeleton rounded" />
          <div className="h-5 skeleton rounded flex-1 max-w-[150px]" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-7 w-7 skeleton rounded-lg" />
          <div className="h-7 w-7 skeleton rounded-lg" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-4 w-10 skeleton rounded" />
        <div className="h-4 w-8 skeleton rounded" />
        <div className="h-4 w-14 skeleton rounded" />
      </div>
    </div>
  );
}
