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
        <p className="text-mm-gray-500 font-body">Please log in to access settings.</p>
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
        <h1 className="font-heading font-bold text-2xl text-mm-black">Settings</h1>
      </div>

      {/* Settings Form */}
      <motion.div
        className="bg-white border-3 border-mm-black rounded-xl shadow-bold p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-heading font-bold text-mm-black mb-2">
            Display Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full pl-11 pr-4 py-3 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-heading font-bold text-mm-black mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full pl-11 pr-4 py-3 border-2 border-mm-gray-300 rounded-lg font-body bg-mm-gray-100 text-mm-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-mm-gray-500 mt-1 font-body">
            Email cannot be changed
          </p>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-heading font-bold text-mm-black mb-2">
            Birthday
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
            />
          </div>
          <p className="text-xs text-mm-gray-500 mt-1 font-body">
            Get a special surprise on your birthday!
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-bold disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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
        className="mt-6 bg-white border-3 border-mm-red rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-heading font-bold text-mm-red mb-2">Danger Zone</h2>
        <p className="text-sm text-mm-gray-600 font-body mb-4">
          Once you delete your account, there is no going back.
        </p>
        <button
          onClick={() => toast.error('Contact support to delete your account')}
          className="text-sm text-mm-red hover:underline font-body"
        >
          Delete Account
        </button>
      </motion.div>
    </div>
  );
}
