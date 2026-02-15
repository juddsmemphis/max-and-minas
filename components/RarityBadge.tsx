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
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  // New bold badge styles based on rarity level
  const rarityStyles = {
    legendary: 'bg-mm-yellow text-mm-black border-mm-black',
    rare: 'bg-mm-pink text-white border-mm-black',
    uncommon: 'bg-mm-blue text-white border-mm-black',
    common: 'bg-mm-mint text-mm-black border-mm-black',
    regular: 'bg-mm-mint text-mm-black border-mm-black',
  };

  const level = rarity.level as keyof typeof rarityStyles;
  const style = rarityStyles[level] || rarityStyles.regular;

  return (
    <motion.span
      className={cn(
        'inline-flex items-center font-heading font-bold rounded border-2 whitespace-nowrap uppercase tracking-wider hover-wiggle',
        style,
        sizeClasses[size],
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={rarity.level === 'legendary' ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {rarity.emoji}
      </motion.span>
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
  },
  rare: {
    emoji: '⭐',
    label: 'Rare',
  },
  uncommon: {
    emoji: '🌟',
    label: 'Uncommon',
  },
  regular: {
    emoji: '✨',
    label: 'Regular',
  },
};

export function RarityBadgeSimple({
  level,
  size = 'md',
  className,
}: RarityBadgeSimpleProps) {
  const data = rarityData[level];

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const rarityStyles = {
    legendary: 'bg-mm-yellow text-mm-black border-mm-black',
    rare: 'bg-mm-pink text-white border-mm-black',
    uncommon: 'bg-mm-blue text-white border-mm-black',
    regular: 'bg-mm-mint text-mm-black border-mm-black',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-heading font-bold rounded border-2 whitespace-nowrap uppercase tracking-wider hover-wiggle cursor-default',
        rarityStyles[level],
        sizeClasses[size],
        className
      )}
    >
      <span>{data.emoji}</span>
      <span>{data.label}</span>
    </span>
  );
}
