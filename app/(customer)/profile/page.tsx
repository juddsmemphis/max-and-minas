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
import { toast } from '@/components/Toast';

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-mm-pink flex items-center justify-center border-3 border-mm-black shadow-bold">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-mm-black mb-2">
            Join the Flavor Club
          </h1>
          <p className="text-mm-gray-600 mb-8 max-w-sm mx-auto">
            Create an account to track flavors, earn badges, and get notified
            when rare flavors appear
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <button className="px-6 py-3 bg-mm-red text-white font-heading font-bold text-sm uppercase tracking-wide rounded-lg border-2 border-mm-black shadow-bold hover:shadow-bold-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-6 py-3 bg-white text-mm-black font-heading font-bold text-sm uppercase tracking-wide rounded-lg border-2 border-mm-black shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                Create Account
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Preview Stats */}
        <motion.div
          className="mt-8 bg-white border-3 border-mm-black rounded-xl p-6 shadow-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-heading font-bold text-lg text-mm-black mb-4">
            Your Local Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatBlock
              icon={<Heart className="w-5 h-5" />}
              value={watchlistIds.length}
              label="Watching"
              color="mm-pink"
            />
            <StatBlock
              icon={<IceCream2 className="w-5 h-5" />}
              value={triedFlavorIds.length}
              label="Tried"
              color="mm-mint"
            />
          </div>
          <p className="text-xs text-mm-gray-500 mt-4 text-center">
            Sign in to save your progress across devices
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl p-6 mb-6 shadow-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-mm-yellow flex items-center justify-center border-2 border-mm-black">
              <User className="w-10 h-10 text-mm-black" />
            </div>
            <button
              onClick={() => toast.info('Profile photo upload coming soon!')}
              className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-white shadow-bold-sm border-2 border-mm-black hover:bg-mm-mint transition-colors"
            >
              <Camera className="w-4 h-4 text-mm-black" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-xl text-mm-black">
              {user.name || 'Ice Cream Lover'}
            </h1>
            <p className="text-sm text-mm-gray-600">{user.email}</p>
            {stats.memberSince && (
              <p className="text-xs text-mm-gray-500 mt-1">
                Member since {formatDate(stats.memberSince)}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBlock
          icon={<IceCream2 className="w-5 h-5" />}
          value={stats.flavorsTried}
          label="Tried"
          color="mm-pink"
          href="/check-in"
        />
        <StatBlock
          icon={<Heart className="w-5 h-5" />}
          value={stats.watchlistCount}
          label="Watching"
          color="mm-blue"
          href="/watchlist"
        />
        <StatBlock
          icon={<Award className="w-5 h-5" />}
          value={earnedBadges.length}
          label="Badges"
          color="mm-yellow"
        />
      </div>

      {/* Flavor Passport Progress */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl p-5 mb-6 shadow-bold-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-mm-black">Flavor Passport</h2>
          <span className="text-sm text-mm-pink font-heading font-bold">
            {stats.flavorsTried} / 15,000
          </span>
        </div>
        <div className="h-4 bg-mm-gray-100 rounded-full overflow-hidden border-2 border-mm-black">
          <motion.div
            className="h-full bg-mm-pink"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max((stats.flavorsTried / 15000) * 100, 1)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-mm-gray-500 mt-2 text-center font-medium">
          {((stats.flavorsTried / 15000) * 100).toFixed(2)}% of all flavors tried
        </p>
      </motion.div>

      {/* Badges */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl p-5 mb-6 shadow-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-heading font-bold text-mm-black mb-4">Badges</h2>

        {/* Earned */}
        {earnedBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-mm-gray-500 uppercase tracking-widest font-bold mb-2">
              Earned
            </p>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((badge) => (
                <motion.button
                  key={badge.id}
                  className="px-3 py-2 bg-mm-mint rounded-lg flex items-center gap-2 cursor-pointer border-2 border-mm-black hover:shadow-bold-sm transition-all"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toast.success(`${badge.emoji} ${badge.name}`, badge.description)}
                >
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-sm font-heading font-bold text-mm-black">
                    {badge.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {lockedBadges.length > 0 && (
          <div>
            <p className="text-xs text-mm-gray-500 uppercase tracking-widest font-bold mb-2">
              Locked
            </p>
            <div className="flex flex-wrap gap-2">
              {lockedBadges.map((badge) => (
                <motion.button
                  key={badge.id}
                  className="px-3 py-2 bg-mm-gray-100 rounded-lg flex items-center gap-2 opacity-60 hover:opacity-80 cursor-pointer border-2 border-mm-gray-300 transition-opacity"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toast.info(`${badge.emoji} ${badge.name}`, `To unlock: ${badge.description}`)}
                >
                  <span className="text-xl grayscale">{badge.emoji}</span>
                  <div className="text-left">
                    <span className="text-sm font-heading font-semibold text-mm-gray-600">
                      {badge.name}
                    </span>
                    <p className="text-xs text-mm-gray-500">
                      {badge.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Settings Menu */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl overflow-hidden shadow-bold-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
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
          className="w-full px-4 py-4 flex items-center gap-3 hover:bg-mm-red/10 text-mm-red transition-colors font-heading font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </motion.div>
    </div>
  );
}

function StatBlock({
  icon,
  value,
  label,
  color,
  href,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  href?: string;
}) {
  const content = (
    <>
      <div className={`w-10 h-10 rounded-lg bg-${color} flex items-center justify-center mb-2 border-2 border-mm-black mx-auto`}>
        <span className={color === 'mm-yellow' ? 'text-mm-black' : 'text-white'}>
          {icon}
        </span>
      </div>
      <span className="font-heading font-bold text-2xl text-mm-black">{value}</span>
      <p className="text-xs text-mm-gray-500 font-medium">{label}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="bg-white border-3 border-mm-black rounded-xl p-4 text-center shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white border-3 border-mm-black rounded-xl p-4 text-center shadow-bold-sm">
      {content}
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
      className="px-4 py-4 flex items-center gap-3 hover:bg-mm-gray-50 transition-colors border-b-2 border-mm-gray-100 last:border-0"
    >
      <span className="text-mm-blue">{icon}</span>
      <span className="flex-1 text-mm-black font-medium">{children}</span>
      <ChevronRight className="w-5 h-5 text-mm-gray-400" />
    </Link>
  );
}
