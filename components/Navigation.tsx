'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Archive, Heart, Lightbulb, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Today', color: 'mm-mint' },
  { href: '/archive', icon: Archive, label: 'Archive', color: 'mm-blue' },
  { href: '/watchlist', icon: Heart, label: 'Watchlist', color: 'mm-pink' },
  { href: '/suggestions', icon: Lightbulb, label: 'Suggest', color: 'mm-yellow' },
  { href: '/our-story', icon: BookOpen, label: 'Story', color: 'mm-orange' },
  { href: '/profile', icon: User, label: 'Profile', color: 'mm-red' },
];

export function Navigation() {
  const pathname = usePathname();

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-mm-cream border-t-3 border-mm-black safe-bottom md:hidden">
      <div className="flex items-center justify-around h-18 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 py-2"
            >
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-mm-black text-white animate-jelly'
                    : 'text-mm-gray-500 hover:text-mm-black'
                )}
                whileTap={{ scale: 0.85 }}
                whileHover={!isActive ? { y: -3, scale: 1.05 } : {}}
              >
                <motion.div
                  animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                </motion.div>
                <span className={cn(
                  'text-[10px] font-heading font-semibold tracking-wide',
                  isActive && 'text-white'
                )}>
                  {item.label}
                </span>
              </motion.div>

              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-mm-black rounded-full"
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
