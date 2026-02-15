'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Save,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { toast } from '@/components/Toast';

interface BusinessHours {
  id: string;
  day_of_week: number;
  day_name: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function HoursManagementPage() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowser();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('business_hours')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      // If no data, create default entries
      if (!data || data.length === 0) {
        const defaultHours: BusinessHours[] = DAY_NAMES.map((name, index) => ({
          id: `temp-${index}`,
          day_of_week: index,
          day_name: name,
          open_time: '12:00',
          close_time: '22:00',
          is_closed: false,
        }));
        setHours(defaultHours);
      } else {
        setHours(data);
      }
    } catch (error) {
      console.error('Error loading hours:', error);
      toast.error('Failed to load hours');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (dayIndex: number, field: 'open_time' | 'close_time', value: string) => {
    setHours(prev => prev.map(h =>
      h.day_of_week === dayIndex ? { ...h, [field]: value } : h
    ));
    setHasChanges(true);
  };

  const handleClosedToggle = (dayIndex: number) => {
    setHours(prev => prev.map(h =>
      h.day_of_week === dayIndex ? { ...h, is_closed: !h.is_closed } : h
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createSupabaseBrowser();

    try {
      for (const hour of hours) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('business_hours')
          .upsert({
            day_of_week: hour.day_of_week,
            day_name: hour.day_name,
            open_time: hour.is_closed ? null : hour.open_time,
            close_time: hour.is_closed ? null : hour.close_time,
            is_closed: hour.is_closed,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'day_of_week' });

        if (error) throw error;
      }

      setHasChanges(false);
      toast.success('Hours saved!');
    } catch (error) {
      console.error('Error saving hours:', error);
      toast.error('Failed to save hours');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeForDisplay = (time: string | null) => {
    if (!time) return '';
    // Convert 24h to 12h format for display
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const getTodayIndex = () => new Date().getDay();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="p-2 rounded-xl bg-white/50 text-dead-red hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-chocolate">Hours of Operation</h1>
          <p className="text-chocolate/60 text-sm">Set your daily hours</p>
        </div>
        <button
          onClick={loadHours}
          className="p-2 rounded-xl bg-white/50 text-chocolate/60 hover:bg-white/80 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-dead-red" />
          <p className="text-chocolate/60 mt-2">Loading hours...</p>
        </div>
      ) : (
        <>
          {/* Hours List */}
          <div className="space-y-3 mb-6">
            {hours.map((hour) => (
              <motion.div
                key={hour.day_of_week}
                className={`groovy-card p-4 ${hour.day_of_week === getTodayIndex() ? 'ring-2 ring-dead-red' : ''}`}
                layout
              >
                <div className="flex items-center gap-4">
                  {/* Day Name */}
                  <div className="w-28">
                    <span className={`font-medium ${hour.day_of_week === getTodayIndex() ? 'text-dead-red' : 'text-chocolate'}`}>
                      {hour.day_name}
                    </span>
                    {hour.day_of_week === getTodayIndex() && (
                      <span className="block text-xs text-dead-red">Today</span>
                    )}
                  </div>

                  {/* Closed Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hour.is_closed}
                      onChange={() => handleClosedToggle(hour.day_of_week)}
                      className="w-4 h-4 rounded border-chocolate/30 accent-dead-red"
                    />
                    <span className="text-sm text-chocolate/70">Closed</span>
                  </label>

                  {/* Time Inputs */}
                  {!hour.is_closed && (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1">
                        <label className="text-xs text-chocolate/50 block mb-1">Open</label>
                        <input
                          type="time"
                          value={hour.open_time || ''}
                          onChange={(e) => handleTimeChange(hour.day_of_week, 'open_time', e.target.value)}
                          className="input-groovy w-full text-sm"
                        />
                      </div>
                      <span className="text-chocolate/40 mt-5">to</span>
                      <div className="flex-1">
                        <label className="text-xs text-chocolate/50 block mb-1">Close</label>
                        <input
                          type="time"
                          value={hour.close_time || ''}
                          onChange={(e) => handleTimeChange(hour.day_of_week, 'close_time', e.target.value)}
                          className="input-groovy w-full text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {hour.is_closed && (
                    <div className="flex-1 text-center">
                      <span className="text-chocolate/50 italic">Closed all day</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`btn-groovy w-full flex items-center justify-center gap-2 ${!hasChanges ? 'opacity-50' : ''}`}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
          </button>

          {/* Preview */}
          <div className="mt-8 groovy-card p-4">
            <h3 className="font-display text-lg text-chocolate mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-dead-red" />
              Preview (as shown to customers)
            </h3>
            <div className="space-y-1 text-sm">
              {hours.map((hour) => (
                <div key={hour.day_of_week} className="flex justify-between">
                  <span className={hour.day_of_week === getTodayIndex() ? 'font-medium text-dead-red' : 'text-chocolate/70'}>
                    {hour.day_name}
                  </span>
                  <span className={hour.is_closed ? 'text-chocolate/50 italic' : 'text-chocolate'}>
                    {hour.is_closed ? 'Closed' : `${formatTimeForDisplay(hour.open_time)} - ${formatTimeForDisplay(hour.close_time)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Google Sync Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Google Business Profile Sync</h4>
            <p className="text-sm text-blue-700">
              To sync hours with Google Maps, you&apos;ll need to set up API credentials.
              Ask your developer to configure the Google Business Profile API integration.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
