'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RarityInfo } from '@/lib/rarity';

interface RarityBadgeProps {
  rarity: RarityInfo;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RarityBadge({
  rarity,
  size = 'md',
  showLabel = true,
  className,
}: RarityBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full text-white whitespace-nowrap',
        rarity.className,
        sizeClasses[size],
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <span>{rarity.emoji}</span>
      {showLabel && <span>{rarity.label}</span>}
    </motion.span>
  );
}

interface RarityBadgeSimpleProps {
  level: 'legendary' | 'rare' | 'uncommon' | 'regular';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const rarityData = {
  legendary: {
    emoji: '🔥',
    label: 'Legendary',
    className: 'badge-legendary',
  },
  rare: {
    emoji: '⭐',
    label: 'Rare',
    className: 'badge-rare',
  },
  uncommon: {
    emoji: '🌟',
    label: 'Uncommon',
    className: 'badge-uncommon',
  },
  regular: {
    emoji: '✨',
    label: 'Regular',
    className: 'badge-regular',
  },
};

export function RarityBadgeSimple({
  level,
  size = 'md',
  className,
}: RarityBadgeSimpleProps) {
  const data = rarityData[level];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full text-white whitespace-nowrap',
        data.className,
        sizeClasses[size],
        className
      )}
    >
      <span>{data.emoji}</span>
      <span>{data.label}</span>
    </span>
  );
}
