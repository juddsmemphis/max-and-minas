'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Archive, Heart, Lightbulb, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Today' },
  { href: '/archive', icon: Archive, label: 'Archive' },
  { href: '/watchlist', icon: Heart, label: 'Watchlist' },
  { href: '/suggestions', icon: Lightbulb, label: 'Suggest' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function Navigation() {
  const pathname = usePathname();

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-lg border-t border-psychedelic-purple/10 safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-colors',
                  isActive ? 'text-psychedelic-purple' : 'text-chocolate/60'
                )}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>

              {isActive && (
                <motion.div
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-groovy-gradient"
                  layoutId="nav-indicator"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
