'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Clock, Sparkles } from 'lucide-react';
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

  // Card accent color based on rarity
  const rarityAccent = {
    legendary: 'border-mm-yellow shadow-bold-yellow',
    rare: 'border-mm-pink shadow-bold-pink',
    uncommon: 'border-mm-blue shadow-bold-blue',
    common: 'border-mm-black shadow-bold',
    regular: 'border-mm-black shadow-bold',
  }[rarityInfo.level] || 'border-mm-black shadow-bold';

  return (
    <motion.div
      className={cn(
        'bg-white border-3 rounded-xl p-3 cursor-pointer relative overflow-hidden transition-all card-bouncy',
        isSoldOut ? 'border-mm-gray-300 shadow-none opacity-80' : rarityAccent,
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={!isSoldOut ? { x: -3, y: -3, scale: 1.02 } : {}}
      whileTap={!isSoldOut ? { x: 2, y: 2, scale: 0.98 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      layout
      style={{
        boxShadow: isHovered && !isSoldOut
          ? '6px 6px 0px 0px var(--mm-black)'
          : undefined
      }}
    >
      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-mm-black/70 flex items-center justify-center z-10 rounded-lg">
          <div className="bg-mm-red text-white px-3 py-1 rounded-lg border-2 border-white font-heading font-bold text-sm tracking-wider transform -rotate-3">
            SOLD OUT
          </div>
        </div>
      )}

      {/* Top Row: Badge, Name, and Action Buttons - All inline */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <RarityBadge rarity={rarityInfo} size="sm" showLabel={false} />
          <h3 className="font-heading font-bold text-base text-mm-black leading-tight truncate">
            {flavor.name}
          </h3>
          {rarityInfo.level === 'legendary' && (
            <Sparkles className="w-3.5 h-3.5 text-mm-yellow flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {showWatchlistButton && (
            <motion.button
              className={cn(
                'p-1.5 rounded-lg border-2 border-mm-black transition-all',
                inWatchlist
                  ? 'bg-mm-pink text-white'
                  : 'bg-white text-mm-black'
              )}
              onClick={handleWatchlistToggle}
              whileTap={{ scale: 0.85 }}
              aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Heart
                className={cn(
                  'w-3.5 h-3.5',
                  inWatchlist && 'fill-current'
                )}
              />
            </motion.button>
          )}
          {showShareButton && (
            <motion.button
              className="p-1.5 rounded-lg border-2 border-mm-black bg-white text-mm-black transition-all"
              onClick={handleShare}
              whileTap={{ scale: 0.95 }}
              aria-label="Share flavor"
            >
              <Share2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Bottom Row: Stats, Tags, Dietary - All inline */}
      <div className="flex items-center gap-2 mt-2 text-xs text-mm-gray-500 flex-wrap">
        {stats.daysSinceLastSeen !== null && stats.daysSinceLastSeen > 0 && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {stats.daysSinceLastSeen}d
          </span>
        )}
        {!flavor.hide_appearances && (
          <span>{flavor.total_appearances}x</span>
        )}
        {flavor.category && (
          <span className="px-1.5 py-0.5 bg-mm-blue/10 text-mm-blue font-semibold text-[10px] uppercase rounded">
            {flavor.category}
          </span>
        )}
        {flavor.tags?.slice(0, 1).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 bg-mm-pink/10 text-mm-pink text-[10px] rounded"
          >
            {tag}
          </span>
        ))}

        {/* Dietary badges - pushed to right */}
        <div className="flex items-center gap-1 ml-auto">
          {flavor.is_gluten_free && (
            <span className="px-1 py-0.5 bg-mm-mint text-mm-black rounded border border-mm-black font-bold text-[10px]">
              GF
            </span>
          )}
          {flavor.contains_nuts === false && (
            <span className="px-1 py-0.5 bg-mm-blue text-white rounded border border-mm-black font-bold text-[10px]">
              NF
            </span>
          )}
          {flavor.contains_nuts === true && (
            <span className="text-[10px]">🥜</span>
          )}
        </div>
      </div>

      {/* Hover accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-mm-yellow via-mm-pink to-mm-blue"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  );
}
