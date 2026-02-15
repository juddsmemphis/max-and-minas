'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Menu, X, Bell, User, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, notificationsEnabled } = useStore();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-mm-cream border-b-3 border-mm-black safe-top">
      {/* Marquee Banner */}
      <div className="bg-mm-black text-white overflow-hidden">
        <div className="flex animate-marquee py-1.5">
          {/* First copy */}
          <div className="flex shrink-0">
            <span className="px-8 text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              OGs of Cereal Ice Cream
            </span>
            <span className="px-8 text-mm-yellow text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              ★ Since 1997 ★
            </span>
            <span className="px-8 text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              15,000+ Unique Flavors
            </span>
            <span className="px-8 text-mm-mint text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              Flushing, Queens
            </span>
          </div>
          {/* Second copy for seamless loop */}
          <div className="flex shrink-0">
            <span className="px-8 text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              OGs of Cereal Ice Cream
            </span>
            <span className="px-8 text-mm-yellow text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              ★ Since 1997 ★
            </span>
            <span className="px-8 text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              15,000+ Unique Flavors
            </span>
            <span className="px-8 text-mm-mint text-xs font-heading font-semibold tracking-widest uppercase whitespace-nowrap">
              Flushing, Queens
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <motion.div
            className="hover-wiggle"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Image
              src="/icons/logo.png"
              alt="Max & Mina's"
              width={110}
              height={44}
              className="object-contain"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
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
          <NavLink href="/our-story" active={isActive('/our-story')}>
            Our Story
          </NavLink>
          {isAdmin && (
            <NavLink href="/admin" active={pathname.startsWith('/admin')}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/maxandminas"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              className="p-2.5 rounded-lg border-2 border-mm-black bg-mm-pink text-white shadow-bold-sm hover:shadow-bold transition-all"
              whileHover={{ y: -2, x: -2 }}
              whileTap={{ y: 2, x: 2, boxShadow: 'none' }}
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </motion.div>
          </a>

          {/* Notification Bell */}
          <Link href="/profile/notifications">
            <motion.div
              className={cn(
                'p-2.5 rounded-lg border-2 border-mm-black transition-all relative',
                notificationsEnabled
                  ? 'bg-mm-mint text-mm-black shadow-bold-sm'
                  : 'bg-white text-mm-black shadow-bold-sm hover:shadow-bold'
              )}
              whileHover={{ y: -2, x: -2 }}
              whileTap={{ y: 2, x: 2, boxShadow: 'none' }}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationsEnabled && (
                <motion.span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-mm-red border-2 border-mm-black rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.div>
          </Link>

          {/* Profile / Login */}
          <Link href={user ? '/profile' : '/login'}>
            <motion.div
              className="p-2.5 rounded-lg border-2 border-mm-black bg-mm-yellow text-mm-black shadow-bold-sm hover:shadow-bold transition-all"
              whileHover={{ y: -2, x: -2 }}
              whileTap={{ y: 2, x: 2, boxShadow: 'none' }}
            >
              <User className="w-5 h-5" />
            </motion.div>
          </Link>

          {/* Mobile Menu Toggle */}
          <motion.button
            className={cn(
              'p-2.5 rounded-lg border-2 border-mm-black md:hidden transition-all',
              isMenuOpen
                ? 'bg-mm-black text-white'
                : 'bg-white text-mm-black shadow-bold-sm'
            )}
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
            className="md:hidden absolute top-full left-0 right-0 bg-mm-cream border-b-3 border-mm-black py-4 shadow-soft-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
                href="/our-story"
                active={isActive('/our-story')}
                onClick={() => setIsMenuOpen(false)}
              >
                Our Story
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
        'px-4 py-2 rounded-lg font-heading font-semibold text-sm transition-all border-2',
        active
          ? 'bg-mm-black text-white border-mm-black shadow-none'
          : 'bg-white text-mm-black border-mm-black shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5'
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
        'px-5 py-3.5 rounded-lg font-heading font-semibold text-base transition-all border-2 border-mm-black',
        active
          ? 'bg-mm-black text-white'
          : 'bg-white text-mm-black shadow-bold-sm active:shadow-none active:translate-x-1 active:translate-y-1'
      )}
    >
      {children}
    </Link>
  );
}
