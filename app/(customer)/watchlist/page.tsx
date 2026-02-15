'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bell, Trash2, AlertCircle, Search } from 'lucide-react';
import { FlavorCard } from '@/components/FlavorCard';
import { LoadingCard } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import type { Flavor } from '@/lib/database.types';

export default function WatchlistPage() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { watchlistIds, removeFromWatchlist, user } = useStore();

  useEffect(() => {
    loadWatchlistFlavors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistIds]);

  const loadWatchlistFlavors = async () => {
    if (watchlistIds.length === 0) {
      setFlavors([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const supabase = createSupabaseBrowser();

    try {
      const { data, error } = await supabase
        .from('flavors')
        .select('*')
        .in('id', watchlistIds)
        .order('rarity_score', { ascending: false });

      if (error) throw error;
      setFlavors(data || []);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (flavorId: string) => {
    removeFromWatchlist(flavorId);
    setFlavors((prev) => prev.filter((f) => f.id !== flavorId));
  };

  const handleClearAll = () => {
    if (confirm('Remove all flavors from your watchlist?')) {
      watchlistIds.forEach((id) => removeFromWatchlist(id));
      setFlavors([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-heading font-bold text-3xl text-mm-black">My Watchlist</h1>
          {flavors.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-mm-red hover:underline flex items-center gap-1 font-body"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
        <p className="text-mm-gray-500 font-body">
          Get alerts when your favorite flavors appear
        </p>
      </div>

      {/* Notification Status */}
      {!user && flavors.length > 0 && (
        <motion.div
          className="bg-mm-blue/10 border-3 border-mm-blue rounded-xl p-4 flex items-start gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Bell className="w-5 h-5 text-mm-blue flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-heading font-bold text-mm-black">
              Enable push notifications
            </p>
            <p className="text-sm text-mm-gray-600 font-body mb-3">
              Sign up to get instant alerts when watched flavors appear
            </p>
            <Link href="/login">
              <button className="px-4 py-2 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-lg shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-sm">
                Sign Up Free
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {flavors.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            className="bg-white border-3 border-mm-black rounded-xl shadow-bold-pink p-4 text-center card-bouncy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-2 text-mm-pink">
              <Heart className="w-5 h-5 fill-current animate-heart-pop" />
              <span className="font-heading font-bold text-2xl">{flavors.length}</span>
            </div>
            <p className="text-sm text-mm-gray-500 font-body">Watching</p>
          </motion.div>
          <motion.div
            className="bg-white border-3 border-mm-black rounded-xl shadow-bold-blue p-4 text-center card-bouncy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 text-mm-blue">
              <Bell className="w-5 h-5" />
              <span className="font-heading font-bold text-2xl">
                {user ? 'On' : 'Off'}
              </span>
            </div>
            <p className="text-sm text-mm-gray-500 font-body">Alerts</p>
          </motion.div>
        </div>
      )}

      {/* Watchlist */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : flavors.length === 0 ? (
        <EmptyState
          type="watchlist"
          action={
            <Link href="/archive">
              <button className="px-6 py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-2">
                <Search className="w-4 h-4" />
                Browse Flavors
              </button>
            </Link>
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          <AnimatePresence>
            {flavors.map((flavor) => (
              <motion.div
                key={flavor.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 },
                }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                layout
              >
                <div className="relative group">
                  <FlavorCard
                    flavor={flavor}
                    showWatchlistButton={false}
                  />
                  {/* Remove Button */}
                  <motion.button
                    className="absolute top-3 right-3 p-2 rounded-full bg-mm-red text-white opacity-0 group-hover:opacity-100 transition-opacity border-2 border-mm-black"
                    onClick={() => handleRemove(flavor.id)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Tips */}
      {flavors.length > 0 && (
        <motion.div
          className="mt-8 p-4 bg-mm-mint/20 border-3 border-mm-mint rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-heading font-bold text-mm-black mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-mm-mint" />
            Pro Tip
          </h3>
          <p className="text-sm text-mm-gray-600 font-body">
            Some legendary flavors only appear once every few years. Keep them
            on your watchlist and be ready to visit when they drop!
          </p>
        </motion.div>
      )}
    </div>
  );
}
