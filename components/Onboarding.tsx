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

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: IceCream2,
    title: '15,000+ Unique Flavors',
    description:
      "Max & Mina's has been creating legendary ice cream flavors since 1997. From Black Sesame to Wasabi to Cookie Monster.",
    color: 'from-psychedelic-purple to-psychedelic-pink',
  },
  {
    icon: Sparkles,
    title: 'Some Appear Once & Never Return',
    description:
      "Many flavors are so rare they've only appeared once in 27 years. When they come back, you want to be ready.",
    color: 'from-psychedelic-pink to-psychedelic-orange',
  },
  {
    icon: Bell,
    title: 'Get Instant Alerts',
    description:
      'Add flavors to your watchlist and get notified the moment they appear. Never miss your favorites again.',
    color: 'from-psychedelic-orange to-psychedelic-lime',
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

    // Try OneSignal first, fall back to browser's Notification API
    if (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      granted = await promptForNotifications();
    } else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      granted = permission === 'granted';
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
      className="fixed inset-0 z-50 bg-cream flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {!showNotificationPrompt ? (
          <motion.div
            key="slides"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Skip Button */}
            <div className="p-4 flex justify-end">
              <button
                onClick={handleSkip}
                className="text-chocolate/50 hover:text-chocolate text-sm font-medium"
              >
                Skip
              </button>
            </div>

            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center px-8">
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
                    className={`w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center`}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {(() => {
                      const Icon = slides[currentSlide].icon;
                      return <Icon className="w-16 h-16 text-white" />;
                    })()}
                  </motion.div>

                  {/* Title */}
                  <h2 className="font-display text-2xl text-chocolate mb-4">
                    {slides[currentSlide].title}
                  </h2>

                  {/* Description */}
                  <p className="text-chocolate/70 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-psychedelic-purple'
                      : 'w-2 bg-psychedelic-purple/30'
                  }`}
                  animate={{
                    scale: index === currentSlide ? 1 : 0.8,
                  }}
                />
              ))}
            </div>

            {/* Next Button */}
            <div className="p-8">
              <motion.button
                className="btn-groovy w-full py-4 text-lg flex items-center justify-center gap-2"
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
            className="flex-1 flex flex-col items-center justify-center px-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Bell Animation */}
            <motion.div
              className="w-32 h-32 mb-8 rounded-full bg-gradient-to-br from-psychedelic-purple to-psychedelic-blue flex items-center justify-center"
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <Bell className="w-16 h-16 text-white" />
            </motion.div>

            <h2 className="font-display text-2xl text-chocolate mb-4 text-center">
              Never Miss a Rare Flavor
            </h2>

            <p className="text-chocolate/70 text-center mb-8 max-w-sm">
              Some legendary flavors appeared once and never came back. Enable
              notifications so you never miss your favorites.
            </p>

            <div className="w-full max-w-sm space-y-3">
              <motion.button
                className="btn-groovy w-full py-4 text-lg flex items-center justify-center gap-2"
                onClick={handleEnableNotifications}
                whileTap={{ scale: 0.98 }}
              >
                <Bell className="w-5 h-5" />
                Enable Notifications
              </motion.button>

              <button
                onClick={handleSkipNotifications}
                className="w-full py-3 text-chocolate/50 hover:text-chocolate text-sm font-medium"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
