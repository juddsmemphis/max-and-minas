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
        <p className="text-mm-gray-600 font-body">Please log in to manage notifications.</p>
        <Link
          href="/login"
          className="mt-4 inline-block px-6 py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
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
          className="p-2 rounded-xl bg-mm-cream border-2 border-mm-black text-mm-black hover:bg-mm-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading font-bold text-2xl text-mm-black">Notifications</h1>
      </div>

      {/* Enable Notifications Banner */}
      {!notificationsEnabled && (
        <motion.div
          className="bg-white border-3 border-mm-blue rounded-xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-mm-blue flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-heading font-bold text-mm-black mb-1">
                Enable Push Notifications
              </h3>
              <p className="text-sm text-mm-gray-600 font-body mb-3">
                Get instant alerts when your favorite flavors appear on the menu!
              </p>
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-lg shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-sm"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notification Settings */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl shadow-bold p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-heading font-bold text-mm-black">Notification Preferences</h2>

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
          className="w-full py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      <p className="text-xs text-mm-gray-500 font-body text-center mt-6">
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
      <div className="text-mm-blue">{icon}</div>
      <div className="flex-1">
        <h3 className="font-heading font-bold text-mm-black">{title}</h3>
        <p className="text-sm text-mm-gray-600 font-body">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-7 rounded-full transition-colors border-2 border-mm-black ${
          enabled ? 'bg-mm-blue' : 'bg-mm-gray-200'
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
