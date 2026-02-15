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
      <div className="mb-8">
        <h1 className="font-display text-3xl text-chocolate mb-2">
          Admin Dashboard
        </h1>
        <p className="text-chocolate/60">
          Manage today&apos;s menu and track flavor data
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/upload">
          <motion.div
            className="groovy-card p-6 flex items-center gap-4 bg-gradient-to-br from-dead-red/10 to-dead-orange/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-groovy-gradient flex items-center justify-center">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg text-chocolate">
                Upload Today&apos;s Menu
              </h2>
              <p className="text-sm text-chocolate/60">
                Snap a photo of the flavor board
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-dead-red" />
          </motion.div>
        </Link>

        <Link href="/admin/flavors">
          <motion.div
            className="groovy-card p-6 flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-dead-purple flex items-center justify-center">
              <IceCream2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg text-chocolate">
                Manage Flavors
              </h2>
              <p className="text-sm text-chocolate/60">
                Edit rarity, descriptions, categories
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-dead-red" />
          </motion.div>
        </Link>

        <Link href="/admin/suggestions">
          <motion.div
            className="groovy-card p-6 flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-dead-orange flex items-center justify-center">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg text-chocolate">
                View Suggestions
              </h2>
              <p className="text-sm text-chocolate/60">
                {stats.pendingSuggestions} customer ideas
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-dead-red" />
          </motion.div>
        </Link>

        <Link href="/admin/hours">
          <motion.div
            className="groovy-card p-6 flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg text-chocolate">
                Hours of Operation
              </h2>
              <p className="text-sm text-chocolate/60">
                Set daily open/close times
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-dead-red" />
          </motion.div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<IceCream2 className="w-6 h-6" />}
          label="Today's Flavors"
          value={stats.todaysFlavors}
          color="purple"
          isLoading={isLoading}
          href="/"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Total Flavors"
          value={stats.totalFlavors.toLocaleString()}
          color="pink"
          isLoading={isLoading}
          href="/admin/flavors"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value={stats.totalUsers}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Suggestions"
          value={stats.pendingSuggestions}
          color="orange"
          isLoading={isLoading}
          href="/admin/suggestions"
        />
      </div>

      {/* Status Banner */}
      {stats.todaysFlavors === 0 && !isLoading && (
        <motion.div
          className="bg-psychedelic-orange/10 border border-psychedelic-orange/30 rounded-2xl p-4 flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-psychedelic-orange flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-chocolate">
              Today&apos;s menu hasn&apos;t been posted yet
            </p>
            <p className="text-sm text-chocolate/60">
              Upload a photo of the flavor board to publish today&apos;s menu
            </p>
          </div>
          <Link href="/admin/upload">
            <button className="btn-groovy text-sm">Upload Now</button>
          </Link>
        </motion.div>
      )}

      {/* Last Updated */}
      {stats.lastUpdated && (
        <div className="text-center text-sm text-chocolate/50">
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
  color: 'purple' | 'pink' | 'blue' | 'orange';
  isLoading: boolean;
  href?: string;
}) {
  const colorClasses = {
    purple: 'bg-psychedelic-purple/10 text-psychedelic-purple',
    pink: 'bg-psychedelic-pink/10 text-psychedelic-pink',
    blue: 'bg-psychedelic-blue/10 text-psychedelic-blue',
    orange: 'bg-psychedelic-orange/10 text-psychedelic-orange',
  };

  const content = (
    <>
      <div
        className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <div className="text-2xl font-display text-chocolate mb-1">
        {isLoading ? (
          <div className="h-8 w-16 bg-chocolate/10 rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-chocolate/60">{label}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <motion.div
          className="groovy-card p-4 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  return (
    <div className="groovy-card p-4">
      {content}
    </div>
  );
}
