'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Menu, X, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, notificationsEnabled } = useStore();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-lg border-b border-psychedelic-purple/10 safe-top">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Image
              src="/icons/max and minas logo - Edited.png"
              alt="Max & Mina's"
              width={100}
              height={40}
              className="object-contain"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/" active={isActive('/')}>
            Today
          </NavLink>
          <NavLink href="/archive" active={isActive('/archive')}>
            Archive
          </NavLink>
          <NavLink href="/watchlist" active={isActive('/watchlist')}>
            Watchlist
          </NavLink>
          <NavLink href="/suggestions" active={isActive('/suggestions')}>
            Suggest
          </NavLink>
          {isAdmin && (
            <NavLink href="/admin" active={pathname.startsWith('/admin')}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Link href="/profile/notifications">
            <motion.div
              className={cn(
                'p-2 rounded-full transition-colors relative',
                notificationsEnabled
                  ? 'bg-psychedelic-purple text-white'
                  : 'bg-psychedelic-purple/10 text-psychedelic-purple'
              )}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationsEnabled && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-psychedelic-lime rounded-full" />
              )}
            </motion.div>
          </Link>

          {/* Profile / Login */}
          <Link href={user ? '/profile' : '/login'}>
            <motion.div
              className="p-2 rounded-full bg-psychedelic-pink/10 text-psychedelic-pink hover:bg-psychedelic-pink/20 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-5 h-5" />
            </motion.div>
          </Link>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="p-2 rounded-full bg-psychedelic-purple/10 text-psychedelic-purple md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="md:hidden absolute top-full left-0 right-0 bg-cream/95 backdrop-blur-lg border-b border-psychedelic-purple/10 py-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex flex-col px-4 gap-2">
              <MobileNavLink
                href="/"
                active={isActive('/')}
                onClick={() => setIsMenuOpen(false)}
              >
                Today&apos;s Menu
              </MobileNavLink>
              <MobileNavLink
                href="/archive"
                active={isActive('/archive')}
                onClick={() => setIsMenuOpen(false)}
              >
                Flavor Archive
              </MobileNavLink>
              <MobileNavLink
                href="/watchlist"
                active={isActive('/watchlist')}
                onClick={() => setIsMenuOpen(false)}
              >
                My Watchlist
              </MobileNavLink>
              <MobileNavLink
                href="/suggestions"
                active={isActive('/suggestions')}
                onClick={() => setIsMenuOpen(false)}
              >
                Suggest a Flavor
              </MobileNavLink>
              <MobileNavLink
                href="/profile"
                active={isActive('/profile')}
                onClick={() => setIsMenuOpen(false)}
              >
                My Profile
              </MobileNavLink>
              {isAdmin && (
                <MobileNavLink
                  href="/admin"
                  active={pathname.startsWith('/admin')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </MobileNavLink>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-full font-medium text-sm transition-colors',
        active
          ? 'bg-psychedelic-purple text-white'
          : 'text-chocolate hover:bg-psychedelic-purple/10'
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'px-4 py-3 rounded-xl font-medium transition-colors',
        active
          ? 'bg-psychedelic-purple text-white'
          : 'text-chocolate hover:bg-psychedelic-purple/10'
      )}
    >
      {children}
    </Link>
  );
}
