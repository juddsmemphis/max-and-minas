'use client';

import { motion } from 'framer-motion';
import { IceCream2, Search, Heart, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType = 'menu' | 'search' | 'watchlist' | 'suggestions' | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const emptyStates: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  menu: {
    icon: <IceCream2 className="w-16 h-16 text-mm-blue/40" />,
    title: "No flavors today... yet!",
    description: "Check back soon - the shop owner will post today's menu shortly.",
  },
  search: {
    icon: <Search className="w-16 h-16 text-mm-blue/40" />,
    title: "No flavors found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
  watchlist: {
    icon: <Heart className="w-16 h-16 text-mm-pink/40" />,
    title: "Your watchlist is empty",
    description: "Tap the heart on any flavor to add it to your watchlist and get alerts when it appears!",
  },
  suggestions: {
    icon: <Lightbulb className="w-16 h-16 text-mm-orange/40" />,
    title: "No suggestions yet",
    description: "Be the first to suggest a new flavor idea!",
  },
  generic: {
    icon: <IceCream2 className="w-16 h-16 text-mm-blue/40" />,
    title: "Nothing here",
    description: "Check back later for updates.",
  },
};

export function EmptyState({
  type = 'generic',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const state = emptyStates[type];

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="mb-4"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {state.icon}
      </motion.div>
      <h3 className="font-heading font-bold text-xl text-mm-black mb-2">
        {title || state.title}
      </h3>
      <p className="text-mm-gray-600 font-body max-w-sm mb-4">
        {description || state.description}
      </p>
      {action}
    </motion.div>
  );
}
