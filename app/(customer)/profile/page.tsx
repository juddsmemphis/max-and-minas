'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Heart,
  IceCream2,
  Award,
  ChevronRight,
  LogOut,
  Camera,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

// Badge definitions
const BADGES = [
  {
    id: 'birthday',
    name: 'Birthday Club',
    emoji: '🎂',
    description: 'Signed up with birthday',
    condition: (stats: UserStats) => stats.hasBirthday,
  },
  {
    id: 'first_scoop',
    name: 'First Scoop',
    emoji: '🌱',
    description: 'Tried 1 flavor',
    condition: (stats: UserStats) => stats.flavorsTried >= 1,
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    emoji: '🌟',
    description: 'Tried 10 flavors',
    condition: (stats: UserStats) => stats.flavorsTried >= 10,
  },
  {
    id: 'connoisseur',
    name: 'Connoisseur',
    emoji: '🏆',
    description: 'Tried 50 flavors',
    condition: (stats: UserStats) => stats.flavorsTried >= 50,
  },
  {
    id: 'legend',
    name: 'Legend',
    emoji: '👑',
    description: 'Tried 100 flavors',
    condition: (stats: UserStats) => stats.flavorsTried >= 100,
  },
  {
    id: 'unicorn_hunter',
    name: 'Unicorn Hunter',
    emoji: '💎',
    description: 'Tried a legendary flavor',
    condition: (stats: UserStats) => stats.legendaryTried > 0,
  },
];

interface UserStats {
  flavorsTried: number;
  watchlistCount: number;
  legendaryTried: number;
  memberSince: string | null;
  hasBirthday: boolean;
}

export default function ProfilePage() {
  const { user, watchlistIds, triedFlavorIds, setUser } = useStore();
  const [stats, setStats] = useState<UserStats>({
    flavorsTried: 0,
    watchlistCount: 0,
    legendaryTried: 0,
    memberSince: null,
    hasBirthday: false,
  });
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserStats = async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowser();

    try {
      // Get tried flavors count and legendary count
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: triedData } = await (supabase as any)
          .from('user_flavors_tried')
          .select('flavor_id, flavors!inner(rarity_score)')
          .eq('user_id', user.id);

        const flavorsTried = triedData?.length || 0;
        const legendaryTried =
          triedData?.filter(
            (t: { flavors: { rarity_score: number } }) => t.flavors?.rarity_score >= 8
          ).length || 0;

        setStats({
          flavorsTried,
          watchlistCount: watchlistIds.length,
          legendaryTried,
          memberSince: user.created_at,
          hasBirthday: !!user.birthday,
        });
      } else {
        // Use local storage data
        setStats({
          flavorsTried: triedFlavorIds.length,
          watchlistCount: watchlistIds.length,
          legendaryTried: 0,
          memberSince: null,
          hasBirthday: false,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    // Clear manually saved session
    localStorage.removeItem('sb-lsqjkqmocjuldtvqaxtr-auth-token');
    setUser(null);
    // Redirect to home
    window.location.href = '/';
  };

  const earnedBadges = BADGES.filter((badge) => badge.condition(stats));
  const lockedBadges = BADGES.filter((badge) => !badge.condition(stats));

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-groovy-gradient flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-display text-2xl text-chocolate mb-2">
            Join the Flavor Club
          </h1>
          <p className="text-chocolate/60 mb-6 max-w-sm mx-auto">
            Create an account to track flavors, earn badges, and get notified
            when rare flavors appear
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <button className="btn-groovy">Sign In</button>
            </Link>
            <Link href="/signup">
              <button className="btn-outline-groovy">Create Account</button>
            </Link>
          </div>
        </div>

        {/* Preview Stats */}
        <div className="mt-8 groovy-card p-6">
          <h2 className="font-display text-lg text-chocolate mb-4">
            Your Local Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatBlock
              icon={<Heart className="w-5 h-5" />}
              value={watchlistIds.length}
              label="Watching"
            />
            <StatBlock
              icon={<IceCream2 className="w-5 h-5" />}
              value={triedFlavorIds.length}
              label="Tried"
            />
          </div>
          <p className="text-xs text-chocolate/50 mt-4 text-center">
            Sign in to save your progress across devices
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="groovy-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-groovy-gradient flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white shadow-lg border border-psychedelic-purple/20">
              <Camera className="w-4 h-4 text-psychedelic-purple" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl text-chocolate">
              {user.name || 'Ice Cream Lover'}
            </h1>
            <p className="text-sm text-chocolate/60">{user.email}</p>
            {stats.memberSince && (
              <p className="text-xs text-chocolate/50 mt-1">
                Member since {formatDate(stats.memberSince)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBlock
          icon={<IceCream2 className="w-5 h-5" />}
          value={stats.flavorsTried}
          label="Tried"
        />
        <StatBlock
          icon={<Heart className="w-5 h-5" />}
          value={stats.watchlistCount}
          label="Watching"
        />
        <StatBlock
          icon={<Award className="w-5 h-5" />}
          value={earnedBadges.length}
          label="Badges"
        />
      </div>

      {/* Flavor Passport Progress */}
      <div className="groovy-card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium text-chocolate">Flavor Passport</h2>
          <span className="text-sm text-psychedelic-purple font-medium">
            {stats.flavorsTried} / 15,000
          </span>
        </div>
        <div className="h-3 bg-psychedelic-purple/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-groovy-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.flavorsTried / 15000) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-chocolate/50 mt-2 text-center">
          {((stats.flavorsTried / 15000) * 100).toFixed(2)}% of all flavors tried
        </p>
      </div>

      {/* Badges */}
      <div className="groovy-card p-4 mb-6">
        <h2 className="font-medium text-chocolate mb-4">Badges</h2>

        {/* Earned */}
        {earnedBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-chocolate/50 uppercase tracking-wide mb-2">
              Earned
            </p>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  className="px-3 py-2 bg-psychedelic-purple/10 rounded-xl flex items-center gap-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-sm font-medium text-chocolate">
                    {badge.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {lockedBadges.length > 0 && (
          <div>
            <p className="text-xs text-chocolate/50 uppercase tracking-wide mb-2">
              Locked
            </p>
            <div className="flex flex-wrap gap-2">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="px-3 py-2 bg-gray-100 rounded-xl flex items-center gap-2 opacity-50"
                >
                  <span className="text-xl grayscale">{badge.emoji}</span>
                  <div>
                    <span className="text-sm font-medium text-chocolate/70">
                      {badge.name}
                    </span>
                    <p className="text-xs text-chocolate/50">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Menu */}
      <div className="groovy-card overflow-hidden">
        <MenuLink href="/profile/settings" icon={<Settings />}>
          Settings
        </MenuLink>
        <MenuLink href="/profile/notifications" icon={<Bell />}>
          Notifications
        </MenuLink>
        <MenuLink href="/check-in" icon={<IceCream2 />}>
          Check In
        </MenuLink>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function StatBlock({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="groovy-card p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-psychedelic-purple mb-1">
        {icon}
        <span className="font-display text-2xl">{value}</span>
      </div>
      <p className="text-xs text-chocolate/60">{label}</p>
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-3 flex items-center gap-3 hover:bg-psychedelic-purple/5 transition-colors border-b border-psychedelic-purple/10 last:border-0"
    >
      <span className="text-psychedelic-purple">{icon}</span>
      <span className="flex-1 text-chocolate">{children}</span>
      <ChevronRight className="w-5 h-5 text-chocolate/30" />
    </Link>
  );
}
