'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Heart, IceCream2, AlertCircle, Save, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { toast } from '@/components/Toast';

export default function NotificationsPage() {
  const { user, notificationsEnabled, setNotificationsEnabled } = useStore();
  const [dailyDrops, setDailyDrops] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(true);
  const [soldOutAlerts, setSoldOutAlerts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate save - in real app would save to user preferences
    await new Promise(resolve => setTimeout(resolve, 500));

    toast.success('Notification preferences saved!');
    setIsSaving(false);
  };

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
      } else {
        toast.error('Please allow notifications in your browser settings');
      }
    } else {
      toast.error('Your browser does not support notifications');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 text-center">
        <p className="text-chocolate/60">Please log in to manage notifications.</p>
        <Link href="/login" className="btn-groovy mt-4 inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/profile"
          className="p-2 rounded-xl bg-white/50 text-psychedelic-purple hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl text-chocolate">Notifications</h1>
      </div>

      {/* Enable Notifications Banner */}
      {!notificationsEnabled && (
        <motion.div
          className="groovy-card p-4 mb-6 bg-psychedelic-purple/10 border-2 border-psychedelic-purple/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-psychedelic-purple flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-chocolate mb-1">
                Enable Push Notifications
              </h3>
              <p className="text-sm text-chocolate/60 mb-3">
                Get instant alerts when your favorite flavors appear on the menu!
              </p>
              <button
                onClick={handleEnableNotifications}
                className="btn-groovy text-sm"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notification Settings */}
      <motion.div
        className="groovy-card p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-medium text-chocolate">Notification Preferences</h2>

        {/* Daily Drops */}
        <ToggleOption
          icon={<IceCream2 className="w-5 h-5" />}
          title="Daily Menu Updates"
          description="Get notified when today's flavors are posted"
          enabled={dailyDrops}
          onChange={setDailyDrops}
        />

        {/* Watchlist */}
        <ToggleOption
          icon={<Heart className="w-5 h-5" />}
          title="Watchlist Alerts"
          description="Get notified when a flavor on your watchlist appears"
          enabled={watchlistAlerts}
          onChange={setWatchlistAlerts}
        />

        {/* Sold Out */}
        <ToggleOption
          icon={<AlertCircle className="w-5 h-5" />}
          title="Sold Out Alerts"
          description="Get notified when a flavor you tried to get sells out"
          enabled={soldOutAlerts}
          onChange={setSoldOutAlerts}
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-groovy w-full py-3 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </motion.div>

      {/* Info */}
      <p className="text-xs text-chocolate/50 text-center mt-6">
        Push notifications require browser permission and may not work on all devices.
      </p>
    </div>
  );
}

function ToggleOption({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-psychedelic-purple">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-chocolate">{title}</h3>
        <p className="text-sm text-chocolate/60">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-psychedelic-purple' : 'bg-gray-200'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
