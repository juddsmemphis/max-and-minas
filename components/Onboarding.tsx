'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IceCream2,
  Bell,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { promptForNotifications } from '@/lib/onesignal';
import { toast } from '@/components/Toast';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: IceCream2,
    title: '15,000+ Unique Flavors',
    description:
      "Max & Mina's has been creating legendary ice cream flavors since 1997. From Black Sesame to Wasabi to Cookie Monster.",
    bgColor: 'bg-mm-pink',
    iconBg: 'bg-mm-yellow',
  },
  {
    icon: Sparkles,
    title: 'Some Appear Once & Never Return',
    description:
      "Many flavors are so rare they've only appeared once in 27 years. When they come back, you want to be ready.",
    bgColor: 'bg-mm-yellow',
    iconBg: 'bg-mm-pink',
  },
  {
    icon: Bell,
    title: 'Get Instant Alerts',
    description:
      'Add flavors to your watchlist and get notified the moment they appear. Never miss your favorites again.',
    bgColor: 'bg-mm-mint',
    iconBg: 'bg-mm-blue',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const { completeOnboarding, setNotificationsEnabled } = useStore();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setShowNotificationPrompt(true);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    onComplete();
  };

  const handleEnableNotifications = async () => {
    let granted = false;

    try {
      // Try OneSignal first, fall back to browser's Notification API
      if (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        granted = await promptForNotifications();
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        granted = permission === 'granted';

        if (granted) {
          toast.success('Notifications enabled!');
        } else if (permission === 'denied') {
          toast.error('Notifications blocked. Enable in browser settings.');
        }
      } else {
        toast.error('Your browser does not support notifications');
      }
    } catch (error) {
      console.error('Notification error:', error);
      toast.error('Could not enable notifications');
    }

    setNotificationsEnabled(granted);
    completeOnboarding();
    onComplete();
  };

  const handleSkipNotifications = () => {
    completeOnboarding();
    onComplete();
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] bg-mm-cream flex flex-col"
      style={{ height: '100dvh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {!showNotificationPrompt ? (
          <motion.div
            key="slides"
            className="flex flex-col flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Skip Button */}
            <div className="p-4 flex justify-end">
              <button
                onClick={handleSkip}
                className="text-mm-gray-500 hover:text-mm-black text-sm font-body font-medium border-2 border-mm-gray-300 rounded-lg px-4 py-1 hover:border-mm-black transition-colors bg-mm-cream"
              >
                Skip
              </button>
            </div>

            {/* Slide Content - Takes remaining space */}
            <div className="flex-1 flex items-center justify-center px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="text-center max-w-sm"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Icon */}
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-4 rounded-xl border-3 border-mm-black ${slides[currentSlide].iconBg} shadow-bold flex items-center justify-center`}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {(() => {
                      const Icon = slides[currentSlide].icon;
                      return <Icon className="w-10 h-10 text-mm-black" />;
                    })()}
                  </motion.div>

                  {/* Title */}
                  <h2 className="font-heading font-bold text-lg text-mm-black mb-2">
                    {slides[currentSlide].title}
                  </h2>

                  {/* Description */}
                  <p className="text-mm-gray-600 font-body leading-relaxed text-sm">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Dots & Button - Fixed height at bottom */}
            <div className="px-6 pb-6 pt-4 bg-mm-cream">
              {/* Progress Dots */}
              <div className="flex justify-center gap-3 mb-4">
                {slides.map((slide, index) => (
                  <motion.div
                    key={index}
                    className={`h-3 rounded-full border-2 border-mm-black transition-all duration-300 ${
                      index === currentSlide
                        ? `w-10 ${slide.iconBg}`
                        : 'w-3 bg-mm-gray-200'
                    }`}
                    animate={{
                      scale: index === currentSlide ? 1 : 0.9,
                    }}
                  />
                ))}
              </div>

              {/* Next Button */}
              <motion.button
                className="w-full py-4 text-lg font-heading font-bold flex items-center justify-center gap-2 bg-mm-red text-white border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                onClick={handleNext}
                whileTap={{ scale: 0.98 }}
              >
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="notifications"
            className="flex flex-col flex-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Content - Takes remaining space */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              {/* Bell Animation */}
              <motion.div
                className="w-20 h-20 mb-4 rounded-xl border-3 border-mm-black bg-mm-yellow shadow-bold-pink flex items-center justify-center"
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Bell className="w-10 h-10 text-mm-black" />
              </motion.div>

              <h2 className="font-heading font-bold text-lg text-mm-black mb-2 text-center">
                Never Miss a Rare Flavor
              </h2>

              <p className="text-mm-gray-600 font-body text-center max-w-sm text-sm">
                Some legendary flavors appeared once and never came back. Enable
                notifications so you never miss your favorites.
              </p>
            </div>

            {/* Buttons - Fixed at bottom */}
            <div className="px-6 pb-6 pt-4 bg-mm-cream">
              <div className="w-full max-w-sm mx-auto space-y-3">
                <motion.button
                  className="w-full py-4 text-lg font-heading font-bold flex items-center justify-center gap-2 bg-mm-red text-white border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  onClick={handleEnableNotifications}
                  whileTap={{ scale: 0.98 }}
                >
                  <Bell className="w-5 h-5" />
                  Enable Notifications
                </motion.button>

                <button
                  onClick={handleSkipNotifications}
                  className="w-full py-3 text-mm-gray-500 hover:text-mm-black font-body text-sm font-medium border-2 border-mm-gray-300 rounded-xl hover:border-mm-black transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
