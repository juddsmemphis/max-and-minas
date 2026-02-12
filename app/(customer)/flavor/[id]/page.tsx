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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link href="/archive">
        <motion.button
          className="mb-6 p-2 -ml-2 rounded-xl text-chocolate/60 hover:text-chocolate hover:bg-white/50 transition-colors flex items-center gap-1"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Archive</span>
        </motion.button>
      </Link>

      {/* Hero Section */}
      <div className="groovy-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-display text-3xl text-chocolate mb-2">
              {flavor.name}
            </h1>
            <RarityBadge rarity={rarityInfo} size="lg" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              className={cn(
                'p-3 rounded-xl transition-colors',
                inWatchlist
                  ? 'bg-psychedelic-pink text-white'
                  : 'bg-psychedelic-pink/10 text-psychedelic-pink hover:bg-psychedelic-pink/20'
              )}
              onClick={handleWatchlistToggle}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={cn('w-6 h-6', inWatchlist && 'fill-current')} />
            </motion.button>
            <motion.button
              className="p-3 rounded-xl bg-psychedelic-blue/10 text-psychedelic-blue hover:bg-psychedelic-blue/20 transition-colors"
              onClick={handleShare}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Description */}
        {flavor.description && (
          <p className="text-chocolate/70 mb-4">{flavor.description}</p>
        )}

        {/* Tags */}
        {(flavor.category || (flavor.tags && flavor.tags.length > 0)) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {flavor.category && (
              <span className="px-3 py-1 bg-psychedelic-purple/10 text-psychedelic-purple text-sm font-medium rounded-full">
                {flavor.category}
              </span>
            )}
            {flavor.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-psychedelic-pink/10 text-psychedelic-pink text-sm font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="First Appeared"
          value={formatDate(flavor.first_appeared)}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Last Seen"
          value={
            flavor.last_appeared
              ? formatRelativeTime(flavor.last_appeared)
              : 'Never'
          }
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Appearances"
          value={`${flavor.total_appearances}`}
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Rarity Score"
          value={`${rarityInfo.score.toFixed(1)} / 10`}
        />
      </div>

      {/* Additional Stats */}
      <div className="groovy-card p-6 mb-6">
        <h2 className="font-display text-lg text-chocolate mb-4">Statistics</h2>
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
      </div>

      {/* Rarity Explanation */}
      <div className="groovy-card p-6">
        <h2 className="font-display text-lg text-chocolate mb-4">
          Rarity Explained
        </h2>
        <div className={cn('p-4 rounded-xl', rarityInfo.className)}>
          <div className="flex items-center gap-2 text-white mb-2">
            <span className="text-2xl">{rarityInfo.emoji}</span>
            <span className="font-display text-xl">{rarityInfo.label}</span>
          </div>
          <p className="text-white/90 text-sm">{rarityInfo.description}</p>
        </div>
        <p className="text-sm text-chocolate/60 mt-4">
          Rarity is calculated based on how often a flavor appears relative to
          how long it&apos;s been tracked. Legendary flavors may only appear once
          every few years, while regular flavors show up frequently.
        </p>
      </div>

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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="groovy-card p-4">
      <div className="flex items-center gap-2 text-psychedelic-purple mb-2">
        {icon}
      </div>
      <p className="font-display text-lg text-chocolate">{value}</p>
      <p className="text-xs text-chocolate/60">{label}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-psychedelic-purple/10 last:border-0">
      <span className="text-chocolate/70">{label}</span>
      <span className="font-medium text-chocolate">{value}</span>
    </div>
  );
}
