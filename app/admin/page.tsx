'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  IceCream2,
  Users,
  TrendingUp,
  Calendar,
  Lightbulb,
  ChevronRight,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

interface DashboardStats {
  todaysFlavors: number;
  totalFlavors: number;
  totalUsers: number;
  pendingSuggestions: number;
  lastUpdated: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaysFlavors: 0,
    totalFlavors: 0,
    totalUsers: 0,
    pendingSuggestions: 0,
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const supabase = createSupabaseBrowser();
    const today = new Date().toISOString().split('T')[0];

    try {
      // Get today's menu count
      const { count: todayCount } = await supabase
        .from('daily_menu')
        .select('*', { count: 'exact', head: true })
        .eq('menu_date', today);

      // Get total flavors count
      const { count: flavorCount } = await supabase
        .from('flavors')
        .select('*', { count: 'exact', head: true });

      // Get total users count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get pending suggestions count
      const { count: suggestionCount } = await supabase
        .from('flavor_suggestions')
        .select('*', { count: 'exact', head: true });

      // Get last photo upload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lastPhoto } = await (supabase as any)
        .from('flavor_photos')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        todaysFlavors: todayCount || 0,
        totalFlavors: flavorCount || 0,
        totalUsers: userCount || 0,
        pendingSuggestions: suggestionCount || 0,
        lastUpdated: lastPhoto?.created_at || null,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="inline-block px-3 py-1 bg-mm-red text-white font-heading font-bold text-xs uppercase tracking-widest rounded-full border-2 border-mm-black mb-3">
          Admin
        </span>
        <h1 className="font-heading font-bold text-3xl text-mm-black mb-2">
          Dashboard
        </h1>
        <p className="text-mm-gray-600">
          Manage today&apos;s menu and track flavor data
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/upload">
          <motion.div
            className="bg-white border-3 border-mm-black rounded-xl p-6 flex items-center gap-4 shadow-bold hover:shadow-bold-lg hover:-translate-x-1 hover:-translate-y-1 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-xl bg-mm-red flex items-center justify-center border-2 border-mm-black">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading font-bold text-lg text-mm-black">
                Upload Today&apos;s Menu
              </h2>
              <p className="text-sm text-mm-gray-500">
                Snap a photo of the flavor board
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-mm-black" />
          </motion.div>
        </Link>

        <Link href="/admin/flavors">
          <motion.div
            className="bg-white border-3 border-mm-black rounded-xl p-6 flex items-center gap-4 shadow-bold hover:shadow-bold-lg hover:-translate-x-1 hover:-translate-y-1 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-xl bg-mm-pink flex items-center justify-center border-2 border-mm-black">
              <IceCream2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading font-bold text-lg text-mm-black">
                Manage Flavors
              </h2>
              <p className="text-sm text-mm-gray-500">
                Edit rarity, descriptions, categories
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-mm-black" />
          </motion.div>
        </Link>

        <Link href="/admin/suggestions">
          <motion.div
            className="bg-white border-3 border-mm-black rounded-xl p-6 flex items-center gap-4 shadow-bold hover:shadow-bold-lg hover:-translate-x-1 hover:-translate-y-1 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-xl bg-mm-yellow flex items-center justify-center border-2 border-mm-black">
              <Lightbulb className="w-7 h-7 text-mm-black" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading font-bold text-lg text-mm-black">
                View Suggestions
              </h2>
              <p className="text-sm text-mm-gray-500">
                {stats.pendingSuggestions} customer ideas
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-mm-black" />
          </motion.div>
        </Link>

        <Link href="/admin/hours">
          <motion.div
            className="bg-white border-3 border-mm-black rounded-xl p-6 flex items-center gap-4 shadow-bold hover:shadow-bold-lg hover:-translate-x-1 hover:-translate-y-1 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-xl bg-mm-mint flex items-center justify-center border-2 border-mm-black">
              <Clock className="w-7 h-7 text-mm-black" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading font-bold text-lg text-mm-black">
                Hours of Operation
              </h2>
              <p className="text-sm text-mm-gray-500">
                Set daily open/close times
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-mm-black" />
          </motion.div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<IceCream2 className="w-6 h-6" />}
          label="Today's Flavors"
          value={stats.todaysFlavors}
          color="mm-pink"
          isLoading={isLoading}
          href="/"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Total Flavors"
          value={stats.totalFlavors.toLocaleString()}
          color="mm-blue"
          isLoading={isLoading}
          href="/admin/flavors"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value={stats.totalUsers}
          color="mm-mint"
          isLoading={isLoading}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Suggestions"
          value={stats.pendingSuggestions}
          color="mm-yellow"
          isLoading={isLoading}
          href="/admin/suggestions"
        />
      </div>

      {/* Status Banner */}
      {stats.todaysFlavors === 0 && !isLoading && (
        <motion.div
          className="bg-mm-orange/10 border-3 border-mm-orange rounded-xl p-4 flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-6 h-6 text-mm-orange flex-shrink-0" />
          <div className="flex-1">
            <p className="font-heading font-bold text-mm-black">
              Today&apos;s menu hasn&apos;t been posted yet
            </p>
            <p className="text-sm text-mm-gray-600">
              Upload a photo of the flavor board to publish today&apos;s menu
            </p>
          </div>
          <Link href="/admin/upload">
            <button className="px-4 py-2 bg-mm-red text-white font-heading font-bold text-sm uppercase tracking-wide rounded-lg border-2 border-mm-black shadow-bold-sm hover:shadow-bold transition-all">
              Upload Now
            </button>
          </Link>
        </motion.div>
      )}

      {/* Last Updated */}
      {stats.lastUpdated && (
        <div className="text-center text-sm text-mm-gray-500">
          Last menu update: {formatDate(stats.lastUpdated)}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  isLoading,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  isLoading: boolean;
  href?: string;
}) {
  const content = (
    <>
      <div
        className={`w-12 h-12 rounded-lg bg-${color} flex items-center justify-center mb-3 border-2 border-mm-black`}
      >
        <span className={color === 'mm-yellow' ? 'text-mm-black' : 'text-white'}>
          {icon}
        </span>
      </div>
      <div className="font-heading font-bold text-2xl text-mm-black mb-1">
        {isLoading ? (
          <div className="h-8 w-16 bg-mm-gray-200 rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-mm-gray-500 font-medium">{label}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <motion.div
          className="bg-white border-3 border-mm-black rounded-xl p-4 shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
          whileTap={{ scale: 0.98 }}
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  return (
    <div className="bg-white border-3 border-mm-black rounded-xl p-4 shadow-bold-sm">
      {content}
    </div>
  );
}
