'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRarityInfo, getFlavorStats } from '@/lib/rarity';
import { RarityBadge } from './RarityBadge';
import type { Flavor, DailyMenuWithFlavor } from '@/lib/database.types';
import { useStore } from '@/lib/store';

interface FlavorCardProps {
  flavor: Flavor;
  menuItem?: DailyMenuWithFlavor;
  showWatchlistButton?: boolean;
  showShareButton?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FlavorCard({
  flavor,
  menuItem,
  showWatchlistButton = true,
  showShareButton = true,
  onClick,
  className,
}: FlavorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useStore();
  const inWatchlist = isInWatchlist(flavor.id);

  const rarityInfo = getRarityInfo(flavor);
  const stats = getFlavorStats(flavor);
  const isSoldOut = menuItem?.sold_out_at != null;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(flavor.id);
    } else {
      addToWatchlist(flavor.id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Check out ${flavor.name} at Max & Mina's! ${rarityInfo.emoji} ${rarityInfo.label}`;
    const url = `${window.location.origin}/flavor/${flavor.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: flavor.name, text, url });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  return (
    <motion.div
      className={cn(
        'groovy-card p-3 cursor-pointer relative overflow-hidden',
        isSoldOut && 'opacity-75',
        className
      )}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      layout
    >
      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-2xl">
          <span className="font-display text-lg text-red-400 tracking-wider">
            SOLD OUT
          </span>
        </div>
      )}

      {/* Top Row: Name, Rarity Badge, and Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="font-display text-lg text-chocolate leading-tight truncate">
            {flavor.name}
          </h3>
          <RarityBadge rarity={rarityInfo} size="sm" />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showWatchlistButton && (
            <motion.button
              className={cn(
                'p-1.5 rounded-full transition-colors',
                inWatchlist
                  ? 'bg-psychedelic-pink text-white'
                  : 'text-psychedelic-pink/50 hover:text-psychedelic-pink hover:bg-psychedelic-pink/10'
              )}
              onClick={handleWatchlistToggle}
              whileTap={{ scale: 0.9 }}
              aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Heart
                className={cn('w-4 h-4', inWatchlist && 'fill-current')}
              />
            </motion.button>
          )}
          {showShareButton && (
            <motion.button
              className="p-1.5 rounded-full text-psychedelic-blue/50 hover:text-psychedelic-blue hover:bg-psychedelic-blue/10 transition-colors"
              onClick={handleShare}
              whileTap={{ scale: 0.9 }}
              aria-label="Share flavor"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Tags, Stats, and Dietary - all in one compact row */}
      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
        {flavor.category && (
          <span className="px-1.5 py-0.5 bg-psychedelic-purple/10 text-psychedelic-purple font-medium rounded-full">
            {flavor.category}
          </span>
        )}
        {flavor.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 bg-psychedelic-pink/10 text-psychedelic-pink font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
        {stats.daysSinceLastSeen !== null && stats.daysSinceLastSeen > 0 && (
          <span className="text-chocolate/50 flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {stats.daysSinceLastSeen}d ago
          </span>
        )}
        {!flavor.hide_appearances && (
          <span className="text-chocolate/50">
            #{flavor.total_appearances} appearances
          </span>
        )}
        {/* Dietary badges */}
        {flavor.is_gluten_free && (
          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">GF</span>
        )}
        {flavor.contains_nuts === false && (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">NF</span>
        )}
        {flavor.contains_nuts === true && (
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">🥜</span>
        )}
      </div>

      {/* Hover Gradient Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.05), rgba(255, 105, 180, 0.05))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
