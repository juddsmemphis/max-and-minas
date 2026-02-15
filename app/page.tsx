'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Clock, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { FlavorCard } from '@/components/FlavorCard';
import { LoadingCard } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Onboarding } from '@/components/Onboarding';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { getRarityInfo } from '@/lib/rarity';
import type { DailyMenuWithFlavor } from '@/lib/database.types';

type FilterType = 'available' | 'rare' | 'soldOut' | null;

interface BusinessHours {
  day_of_week: number;
  day_name: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [menu, setMenu] = useState<DailyMenuWithFlavor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { setTodaysMenu, hasCompletedOnboarding } = useStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [showAllHours, setShowAllHours] = useState(false);

  // Wait for store hydration before checking onboarding status
  useEffect(() => {
    const unsubscribe = useStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    // Check if already hydrated
    if (useStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return () => unsubscribe();
  }, []);

  // Show onboarding only after hydration and only for new users
  useEffect(() => {
    if (isHydrated && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [isHydrated, hasCompletedOnboarding]);

  useEffect(() => {
    loadTodaysMenu();
    loadHours();

    // Set up realtime subscription for sold out updates
    const supabase = createSupabaseBrowser();
    const channel = supabase
      .channel('daily-menu-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'daily_menu' },
        (payload) => {
          if (payload.new.sold_out_at) {
            setMenu((prev) =>
              prev.map((item) =>
                item.id === payload.new.id
                  ? { ...item, sold_out_at: payload.new.sold_out_at }
                  : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTodaysMenu = async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowser();
    const today = new Date().toISOString().split('T')[0];

    try {
      console.log('Fetching menu for date:', today);

      // Fetch today's menu items
      const { data: menuData, error: menuError } = await supabase
        .from('daily_menu')
        .select(
          `
          *,
          flavors (*)
        `
        )
        .eq('menu_date', today)
        .order('created_at', { ascending: true });

      if (menuError) throw menuError;

      // Fetch always-available flavors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: alwaysData, error: alwaysError } = await (supabase as any)
        .from('flavors')
        .select('*')
        .eq('always_available', true);

      if (alwaysError) throw alwaysError;

      console.log('Menu fetch result:', { menuData, alwaysData });

      const menuItems = (menuData || []) as DailyMenuWithFlavor[];

      // Get IDs of flavors already in today's menu
      const menuFlavorIds = new Set(menuItems.map(item => item.flavor_id));

      // Create synthetic menu entries for always-available flavors not already in menu
      const alwaysAvailableItems: DailyMenuWithFlavor[] = (alwaysData || [])
        .filter((flavor: { id: string }) => !menuFlavorIds.has(flavor.id))
        .map((flavor: { id: string }) => ({
          id: `always-${flavor.id}`,
          flavor_id: flavor.id,
          menu_date: today,
          sold_out_at: null,
          created_at: new Date().toISOString(),
          flavors: flavor,
        }));

      const allMenuItems = [...menuItems, ...alwaysAvailableItems];
      setMenu(allMenuItems);
      setTodaysMenu(allMenuItems);

      // Get last update time
      if (menuItems.length > 0) {
        setLastUpdated(menuItems[0].created_at);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      console.log('Menu fetch complete, setting isLoading=false');
      setIsLoading(false);
    }
  };

  const loadHours = async () => {
    const supabase = createSupabaseBrowser();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('business_hours')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      if (data) setHours(data);
    } catch (error) {
      console.error('Error loading hours:', error);
    }
  };

  const formatTimeForDisplay = (time: string | null) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const getTodayHours = () => {
    const todayIndex = new Date().getDay();
    return hours.find(h => h.day_of_week === todayIndex);
  };

  const todayHours = getTodayHours();

  // Calculate stats
  const availableCount = menu.filter((item) => !item.sold_out_at).length;
  const soldOutCount = menu.filter((item) => item.sold_out_at).length;
  const rareCount = menu.filter((item) => {
    const rarity = getRarityInfo(item.flavors);
    return rarity.level === 'legendary' || rarity.level === 'rare';
  }).length;

  // Filter menu based on active filter
  const filteredMenu = menu.filter((item) => {
    if (!activeFilter) return true;
    if (activeFilter === 'available') return !item.sold_out_at;
    if (activeFilter === 'soldOut') return item.sold_out_at;
    if (activeFilter === 'rare') {
      const rarity = getRarityInfo(item.flavors);
      return rarity.level === 'legendary' || rarity.level === 'rare';
    }
    return true;
  });

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-3xl text-chocolate">Today&apos;s Flavors</h1>
          <motion.button
            className="p-2 rounded-xl bg-white/50 text-psychedelic-purple hover:bg-white/80 transition-colors"
            onClick={loadTodaysMenu}
            whileTap={{ scale: 0.95, rotate: 180 }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-chocolate/60">
          {formatDate(new Date())} • Flushing, Queens
        </p>
      </div>

      {/* Stats Bar */}
      {menu.length > 0 && (
        <motion.div
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatChip
            icon={<Sparkles className="w-4 h-4" />}
            value={availableCount}
            label="Available"
            color="lime"
            active={activeFilter === 'available'}
            onClick={() => handleFilterClick('available')}
          />
          <StatChip
            icon={<TrendingUp className="w-4 h-4" />}
            value={rareCount}
            label="Rare"
            color="purple"
            active={activeFilter === 'rare'}
            onClick={() => handleFilterClick('rare')}
          />
          <StatChip
            icon={<Clock className="w-4 h-4" />}
            value={soldOutCount}
            label="Sold Out"
            color="pink"
            active={activeFilter === 'soldOut'}
            onClick={() => handleFilterClick('soldOut')}
          />
        </motion.div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-sm text-chocolate/50 mb-4 text-center">
          Updated {formatRelativeTime(lastUpdated)}
        </p>
      )}

      {/* Flavor Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : menu.length === 0 ? (
        <EmptyState type="menu" />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {/* Sort: available first, then sold out */}
          {[...filteredMenu]
            .sort((a, b) => {
              if (a.sold_out_at && !b.sold_out_at) return 1;
              if (!a.sold_out_at && b.sold_out_at) return -1;
              // Then by rarity
              const rarityA = getRarityInfo(a.flavors);
              const rarityB = getRarityInfo(b.flavors);
              return rarityB.score - rarityA.score;
            })
            .map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <FlavorCard
                  flavor={item.flavors}
                  menuItem={item}
                  onClick={() => router.push(`/flavor/${item.flavors.id}`)}
                />
              </motion.div>
            ))}
        </motion.div>
      )}

      {/* Shop Info */}
      <motion.div
        className="mt-8 groovy-card p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Image
          src="/icons/logo.png"
          alt="Max & Mina's"
          width={160}
          height={64}
          className="mx-auto mb-2"
        />
        <p className="text-chocolate/70 mb-1">
          71-26 Main Street, Flushing, NY 11367
        </p>
        <p className="text-chocolate/50 text-sm mb-4">
          Serving 15,000+ unique flavors since 1997
        </p>

        {/* Hours Display */}
        {hours.length > 0 && (
          <div className="mb-4 py-3 px-4 bg-cream/50 rounded-xl">
            {/* Today's Hours - Prominent */}
            {todayHours && (
              <div className="flex items-center justify-center gap-2 text-chocolate">
                <Clock className="w-4 h-4 text-dead-red" />
                <span className="font-medium">Today:</span>
                <span>
                  {todayHours.is_closed
                    ? 'Closed'
                    : `${formatTimeForDisplay(todayHours.open_time)} - ${formatTimeForDisplay(todayHours.close_time)}`}
                </span>
              </div>
            )}

            {/* Toggle for full week */}
            <button
              onClick={() => setShowAllHours(!showAllHours)}
              className="mt-2 text-xs text-dead-red hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              {showAllHours ? 'Hide' : 'See all'} hours
              {showAllHours ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Full Week Hours */}
            {showAllHours && (
              <motion.div
                className="mt-3 pt-3 border-t border-chocolate/10 text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-w-xs mx-auto text-left">
                  {hours.map((h) => (
                    <div key={h.day_of_week} className="contents">
                      <span className={`${h.day_of_week === new Date().getDay() ? 'font-medium text-dead-red' : 'text-chocolate/70'}`}>
                        {h.day_name}
                      </span>
                      <span className={`text-right ${h.is_closed ? 'text-chocolate/50 italic' : 'text-chocolate'}`}>
                        {h.is_closed ? 'Closed' : `${formatTimeForDisplay(h.open_time)} - ${formatTimeForDisplay(h.close_time)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="flex justify-center items-stretch gap-4">
          <a
            href="https://maps.google.com/?q=Max+and+Minas+Flushing"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-groovy text-sm flex items-center justify-center"
          >
            Directions
          </a>
          <a
            href="https://www.ubereats.com/store/max-%26-minas-ice-cream/3XtTzTt3Xl2YCN-yOfT0QA?diningMode=DELIVERY&sc=SEARCH_SUGGESTION"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#06C167] hover:bg-[#05a857] text-white font-medium rounded-xl transition-colors text-sm text-center flex flex-col items-center justify-center"
          >
            <span className="text-white/80 text-xs">Want it delivered?</span>
            <span>Order UberEats</span>
          </a>
          <a href="tel:+17184281168" className="btn-groovy text-sm flex items-center justify-center">
            Call Shop
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function StatChip({
  icon,
  value,
  label,
  color,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'lime' | 'purple' | 'pink';
  active?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    lime: active
      ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-2'
      : 'bg-psychedelic-lime/20 text-green-700 hover:bg-psychedelic-lime/40',
    purple: active
      ? 'bg-psychedelic-purple text-white ring-2 ring-psychedelic-purple ring-offset-2'
      : 'bg-psychedelic-purple/20 text-psychedelic-purple hover:bg-psychedelic-purple/40',
    pink: active
      ? 'bg-psychedelic-pink text-white ring-2 ring-psychedelic-pink ring-offset-2'
      : 'bg-psychedelic-pink/20 text-psychedelic-pink hover:bg-psychedelic-pink/40',
  };

  return (
    <motion.button
      className={`rounded-xl p-3 text-center transition-all cursor-pointer ${colorClasses[color]}`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="font-display text-lg">{value}</span>
      </div>
      <span className={`text-xs ${active ? 'opacity-90' : 'opacity-70'}`}>{label}</span>
    </motion.button>
  );
}
