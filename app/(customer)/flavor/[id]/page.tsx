'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  TrendingUp,
  Clock,
  Star,
} from 'lucide-react';
import { RarityBadge } from '@/components/RarityBadge';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ShareToInstagram } from '@/components/ShareToInstagram';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import { getRarityInfo, getFlavorStats } from '@/lib/rarity';
import type { Flavor } from '@/lib/database.types';

export default function FlavorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [flavor, setFlavor] = useState<Flavor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useStore();

  const flavorId = params.id as string;
  const inWatchlist = flavor ? isInWatchlist(flavor.id) : false;

  useEffect(() => {
    loadFlavor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavorId]);

  const loadFlavor = async () => {
    const supabase = createSupabaseBrowser();

    try {
      const { data, error } = await supabase
        .from('flavors')
        .select('*')
        .eq('id', flavorId)
        .single();

      if (error) throw error;
      setFlavor(data);
    } catch (error) {
      console.error('Error loading flavor:', error);
      router.push('/archive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!flavor) return;
    if (inWatchlist) {
      removeFromWatchlist(flavor.id);
    } else {
      addToWatchlist(flavor.id);
    }
  };

  const handleShare = async () => {
    if (!flavor) return;

    const rarityInfo = getRarityInfo(flavor);
    const text = `Check out ${flavor.name} at Max & Mina's! ${rarityInfo.emoji} ${rarityInfo.label}`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: flavor.name, text, url });
      } catch {
        // User cancelled
      }
    } else {
      setShowShare(true);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!flavor) {
    return null;
  }

  const rarityInfo = getRarityInfo(flavor);
  const stats = getFlavorStats(flavor);

  // Accent color based on rarity
  const rarityAccent = {
    legendary: 'border-mm-yellow',
    rare: 'border-mm-pink',
    uncommon: 'border-mm-blue',
    common: 'border-mm-mint',
    regular: 'border-mm-mint',
  }[rarityInfo.level] || 'border-mm-black';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link href="/archive">
        <motion.button
          className="mb-6 px-4 py-2 rounded-lg border-2 border-mm-black bg-white text-mm-black font-heading font-semibold text-sm shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
        </motion.button>
      </Link>

      {/* Hero Section */}
      <motion.div
        className={cn(
          "bg-white border-3 rounded-xl p-6 mb-6 shadow-bold",
          rarityAccent
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <RarityBadge rarity={rarityInfo} size="lg" className="mb-3" />
            <h1 className="font-heading font-bold text-3xl text-mm-black">
              {flavor.name}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              className={cn(
                'p-3 rounded-lg border-2 border-mm-black transition-all',
                inWatchlist
                  ? 'bg-mm-pink text-white shadow-bold-sm'
                  : 'bg-white text-mm-black hover:bg-mm-pink hover:text-white'
              )}
              onClick={handleWatchlistToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={cn('w-6 h-6', inWatchlist && 'fill-current')} />
            </motion.button>
            <motion.button
              className="p-3 rounded-lg border-2 border-mm-black bg-white text-mm-black hover:bg-mm-blue hover:text-white transition-all"
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Description */}
        {flavor.description && (
          <p className="text-mm-gray-600 text-lg mb-4 leading-relaxed">{flavor.description}</p>
        )}

        {/* Tags */}
        {(flavor.category || (flavor.tags && flavor.tags.length > 0)) && (
          <div className="flex flex-wrap gap-2">
            {flavor.category && (
              <span className="px-3 py-1.5 bg-mm-blue/10 text-mm-blue text-sm font-heading font-semibold uppercase tracking-wide rounded-full border border-mm-blue/30">
                {flavor.category}
              </span>
            )}
            {flavor.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-mm-pink/10 text-mm-pink text-sm font-medium rounded-full border border-mm-pink/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="First Appeared"
          value={formatDate(flavor.first_appeared)}
          color="mm-yellow"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Last Seen"
          value={
            flavor.last_appeared
              ? formatRelativeTime(flavor.last_appeared)
              : 'Never'
          }
          color="mm-mint"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Appearances"
          value={`${flavor.total_appearances}`}
          color="mm-blue"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Rarity Score"
          value={`${rarityInfo.score.toFixed(1)} / 10`}
          color="mm-pink"
        />
      </div>

      {/* Additional Stats */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl p-6 mb-6 shadow-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-heading font-bold text-xl text-mm-black mb-4">Statistics</h2>
        <div className="space-y-3">
          <StatRow
            label="Years Tracked"
            value={`${stats.yearsTracking} years`}
          />
          <StatRow
            label="Avg. Appearances/Year"
            value={`${stats.avgAppearancesPerYear}`}
          />
          {stats.daysSinceLastSeen !== null && (
            <StatRow
              label="Days Since Last Seen"
              value={`${stats.daysSinceLastSeen} days`}
            />
          )}
          <StatRow
            label="Total Days Available"
            value={`${flavor.total_days_available} days`}
          />
        </div>
      </motion.div>

      {/* Rarity Explanation */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl p-6 shadow-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-heading font-bold text-xl text-mm-black mb-4">
          Rarity Explained
        </h2>
        <div className={cn(
          'p-4 rounded-lg border-2 border-mm-black',
          rarityInfo.level === 'legendary' ? 'bg-mm-yellow text-mm-black' :
          rarityInfo.level === 'rare' ? 'bg-mm-pink text-white' :
          rarityInfo.level === 'uncommon' ? 'bg-mm-blue text-white' :
          'bg-mm-mint text-mm-black'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{rarityInfo.emoji}</span>
            <span className="font-heading font-bold text-xl uppercase tracking-wide">{rarityInfo.label}</span>
          </div>
          <p className="text-sm opacity-90">{rarityInfo.description}</p>
        </div>
        <p className="text-sm text-mm-gray-500 mt-4">
          Rarity is calculated based on how often a flavor appears relative to
          how long it&apos;s been tracked. Legendary flavors may only appear once
          every few years, while regular flavors show up frequently.
        </p>
      </motion.div>

      {/* Share Modal */}
      {showShare && (
        <ShareToInstagram
          flavor={flavor}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      className="bg-white border-3 border-mm-black rounded-xl p-4 shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
      whileHover={{ scale: 1.02 }}
    >
      <div className={cn('flex items-center gap-2 mb-2', `text-${color}`)}>
        {icon}
      </div>
      <p className="font-heading font-bold text-lg text-mm-black">{value}</p>
      <p className="text-xs text-mm-gray-500 font-medium">{label}</p>
    </motion.div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b-2 border-mm-gray-100 last:border-0">
      <span className="text-mm-gray-600">{label}</span>
      <span className="font-heading font-semibold text-mm-black">{value}</span>
    </div>
  );
}
