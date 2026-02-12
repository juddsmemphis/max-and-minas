'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Save, Loader2 } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { toast } from '@/components/Toast';

export default function SettingsPage() {
  const { user, setUser } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    const supabase = createSupabaseBrowser();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('users')
        .update({ name, birthday: birthday || null })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, name, birthday: birthday || null });
      toast.success('Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 text-center">
        <p className="text-chocolate/60">Please log in to access settings.</p>
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
        <h1 className="font-display text-2xl text-chocolate">Settings</h1>
      </div>

      {/* Settings Form */}
      <motion.div
        className="groovy-card p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-chocolate mb-2">
            Display Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-groovy w-full"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-chocolate mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="input-groovy w-full bg-gray-100 cursor-not-allowed"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <p className="text-xs text-chocolate/50 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-chocolate mb-2">
            Birthday
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="input-groovy w-full"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <p className="text-xs text-chocolate/50 mt-1">
            Get a special surprise on your birthday!
          </p>
        </div>

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
              Save Changes
            </>
          )}
        </button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="mt-6 groovy-card p-6 border-2 border-red-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-medium text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-chocolate/60 mb-4">
          Once you delete your account, there is no going back.
        </p>
        <button
          onClick={() => toast.error('Contact support to delete your account')}
          className="text-sm text-red-500 hover:text-red-600 hover:underline"
        >
          Delete Account
        </button>
      </motion.div>
    </div>
  );
}
