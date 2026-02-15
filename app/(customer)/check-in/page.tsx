'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IceCream2,
  Check,
  Star,
  ChevronRight,
  Loader2,
  Award,
  PartyPopper,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { toast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import { getRarityInfo } from '@/lib/rarity';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { DailyMenuWithFlavor } from '@/lib/database.types';

type Step = 'select' | 'rate' | 'success';

interface SelectedFlavor {
  id: string;
  name: string;
  rating?: number;
  review?: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const { user, markAsTried } = useStore();
  const [todaysMenu, setTodaysMenu] = useState<DailyMenuWithFlavor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<Step>('select');
  const [selectedFlavors, setSelectedFlavors] = useState<SelectedFlavor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);

  useEffect(() => {
    loadTodaysMenu();
  }, []);

  const loadTodaysMenu = async () => {
    const supabase = createSupabaseBrowser();
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('daily_menu')
        .select('*, flavors(*)')
        .eq('menu_date', today)
        .is('sold_out_at', null);

      if (error) throw error;
      setTodaysMenu((data as DailyMenuWithFlavor[]) || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlavor = (flavor: { id: string; name: string }) => {
    setSelectedFlavors((prev) => {
      const exists = prev.find((f) => f.id === flavor.id);
      if (exists) {
        return prev.filter((f) => f.id !== flavor.id);
      }
      return [...prev, { id: flavor.id, name: flavor.name }];
    });
  };

  const updateRating = (flavorId: string, rating: number) => {
    setSelectedFlavors((prev) =>
      prev.map((f) => (f.id === flavorId ? { ...f, rating } : f))
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.info('Sign in to save', 'Create an account to track your flavors');
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowser();
    const today = new Date().toISOString().split('T')[0];

    try {
      // Insert all tried flavors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('user_flavors_tried').insert(
        selectedFlavors.map((f) => ({
          user_id: user.id,
          flavor_id: f.id,
          tried_date: today,
          rating: f.rating || null,
          review: f.review || null,
        }))
      );

      if (error) throw error;

      // Update local state
      selectedFlavors.forEach((f) => markAsTried(f.id));

      // Check for new badges
      const { count } = await supabase
        .from('user_flavors_tried')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const totalTried = count || 0;

      // Check badge thresholds
      if (totalTried === 1) {
        setEarnedBadge('First Scoop');
      } else if (totalTried === 10) {
        setEarnedBadge('Adventurer');
      } else if (totalTried === 50) {
        setEarnedBadge('Connoisseur');
      } else if (totalTried === 100) {
        setEarnedBadge('Legend');
      }

      setStep('success');
      toast.success(
        'Check-in complete!',
        `${selectedFlavors.length} flavor${selectedFlavors.length > 1 ? 's' : ''} added`
      );
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Check-in failed', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-3xl text-mm-black mb-2">Check In</h1>
        <p className="text-mm-gray-600 font-body">
          {step === 'select' && "Select the flavors you tried today"}
          {step === 'rate' && "Rate your flavors (optional)"}
          {step === 'success' && "Thanks for visiting!"}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['select', 'rate', 'success'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2',
                step === s || ['select', 'rate', 'success'].indexOf(step) > i
                  ? 'bg-mm-blue text-white border-mm-black'
                  : 'bg-mm-blue/20 text-mm-blue border-mm-blue/30'
              )}
            >
              {['select', 'rate', 'success'].indexOf(step) > i ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && (
              <div
                className={cn(
                  'w-12 h-1 mx-1 rounded-full transition-colors',
                  ['select', 'rate', 'success'].indexOf(step) > i
                    ? 'bg-mm-blue'
                    : 'bg-mm-blue/20'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Select Step */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {todaysMenu.length === 0 ? (
              <div className="text-center py-12">
                <IceCream2 className="w-16 h-16 mx-auto mb-4 text-mm-blue/30" />
                <p className="text-mm-gray-600 font-body">
                  No flavors available to check in today
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {todaysMenu.map((item) => {
                    const isSelected = selectedFlavors.some(
                      (f) => f.id === item.flavors.id
                    );
                    const rarity = getRarityInfo(item.flavors);

                    return (
                      <motion.button
                        key={item.id}
                        className={cn(
                          'bg-white border-3 border-mm-black rounded-xl shadow-bold p-4 text-left transition-all',
                          isSelected &&
                            'ring-2 ring-mm-blue bg-mm-blue/5'
                        )}
                        onClick={() =>
                          toggleFlavor({
                            id: item.flavors.id,
                            name: item.flavors.name,
                          })
                        }
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                              isSelected
                                ? 'bg-mm-blue border-mm-black'
                                : 'border-mm-gray-300'
                            )}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-heading font-bold text-mm-black">
                              {item.flavors.name}
                            </p>
                            <p className="text-xs text-mm-gray-500 font-body">
                              {rarity.label}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep('rate')}
                  disabled={selectedFlavors.length === 0}
                  className="w-full py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue with {selectedFlavors.length} flavor
                  {selectedFlavors.length !== 1 && 's'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Rate Step */}
        {step === 'rate' && (
          <motion.div
            key="rate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="space-y-4 mb-6">
              {selectedFlavors.map((flavor) => (
                <div key={flavor.id} className="bg-white border-3 border-mm-black rounded-xl shadow-bold p-4">
                  <p className="font-heading font-bold text-mm-black mb-3">
                    {flavor.name}
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateRating(flavor.id, star)}
                        className="p-1"
                      >
                        <Star
                          className={cn(
                            'w-8 h-8 transition-colors',
                            (flavor.rating || 0) >= star
                              ? 'text-mm-orange fill-mm-orange'
                              : 'text-mm-orange/30'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-3 bg-white text-mm-black font-heading font-bold border-3 border-mm-black rounded-xl hover:bg-mm-gray-100 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Complete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <PartyPopper className="w-20 h-20 mx-auto mb-4 text-mm-blue" />
            </motion.div>

            <h2 className="font-heading font-bold text-2xl text-mm-black mb-2">
              Check-in Complete!
            </h2>
            <p className="text-mm-gray-600 font-body mb-6">
              {selectedFlavors.length} flavor
              {selectedFlavors.length !== 1 && 's'} added to your passport
            </p>

            {/* Badge Earned */}
            {earnedBadge && (
              <motion.div
                className="bg-white border-3 border-mm-black rounded-xl shadow-bold-yellow p-6 mb-6 mx-auto max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Award className="w-12 h-12 mx-auto mb-3 text-mm-orange" />
                <p className="text-sm text-mm-gray-600 font-body mb-1">Badge Earned!</p>
                <p className="font-heading font-bold text-xl text-mm-black">
                  {earnedBadge}
                </p>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-white text-mm-black font-heading font-bold border-3 border-mm-black rounded-xl hover:bg-mm-gray-100 transition-all"
              >
                View Profile
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
              >
                Back to Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
