'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Eye, Clock } from 'lucide-react';
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
        'groovy-card p-4 cursor-pointer relative overflow-hidden',
        isSoldOut && 'opacity-75',
        className
      )}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      layout
    >
      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-3xl">
          <span className="font-display text-2xl text-red-400 tracking-wider">
            SOLD OUT
          </span>
        </div>
      )}

      {/* Top Row: Name and Badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-display text-xl text-chocolate leading-tight flex-1">
          {flavor.name}
        </h3>
        <RarityBadge rarity={rarityInfo} size="sm" />
      </div>

      {/* Category and Tags */}
      {(flavor.category || (flavor.tags && flavor.tags.length > 0)) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {flavor.category && (
            <span className="px-2 py-0.5 bg-psychedelic-purple/10 text-psychedelic-purple text-xs font-medium rounded-full">
              {flavor.category}
            </span>
          )}
          {flavor.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-psychedelic-pink/10 text-psychedelic-pink text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-sm text-chocolate/70 mb-3">
        {stats.daysSinceLastSeen !== null && stats.daysSinceLastSeen > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {stats.daysSinceLastSeen === 0
                ? 'Today'
                : `${stats.daysSinceLastSeen}d ago`}
            </span>
          </div>
        )}
        {!flavor.hide_appearances && (
          <div className="flex items-center gap-1">
            <span className="text-psychedelic-purple">#{flavor.total_appearances}</span>
            <span>appearances</span>
          </div>
        )}
        {/* Dietary badges */}
        {flavor.is_gluten_free && (
          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">GF</span>
        )}
        {flavor.contains_nuts === false && (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">NF</span>
        )}
        {flavor.contains_nuts === true && (
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">🥜</span>
        )}
      </div>

      {/* Appearance Info (for today's menu) */}
      {menuItem && (
        <div className="text-xs text-chocolate/60 mb-3 italic">
          Appearance #{menuItem.appearance_number}
          {menuItem.days_since_last && menuItem.days_since_last > 0 && (
            <> • {menuItem.days_since_last} days since last</>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-psychedelic-purple/10">
        <div className="flex items-center gap-2">
          {showWatchlistButton && (
            <motion.button
              className={cn(
                'p-2 rounded-full transition-colors',
                inWatchlist
                  ? 'bg-psychedelic-pink text-white'
                  : 'bg-psychedelic-pink/10 text-psychedelic-pink hover:bg-psychedelic-pink/20'
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
              className="p-2 rounded-full bg-psychedelic-blue/10 text-psychedelic-blue hover:bg-psychedelic-blue/20 transition-colors"
              onClick={handleShare}
              whileTap={{ scale: 0.9 }}
              aria-label="Share flavor"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Watch Count (placeholder) */}
        <div className="flex items-center gap-1 text-xs text-chocolate/50">
          <Eye className="w-3.5 h-3.5" />
          <span>-</span>
        </div>
      </div>

      {/* Hover Gradient Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1), rgba(255, 105, 180, 0.1))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
