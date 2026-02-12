'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, IceCream2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { toast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createSupabaseBrowser();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log('Login result:', { authData, authError });

      if (authError) throw authError;

      // Manually save session to localStorage (backup in case Supabase client doesn't)
      const storageKey = 'sb-lsqjkqmocjuldtvqaxtr-auth-token';
      if (authData.session) {
        localStorage.setItem(storageKey, JSON.stringify(authData.session));
        console.log('Session manually saved to localStorage');
      }

      // Set user in store immediately from auth data
      setUser({
        id: authData.user.id,
        email: authData.user.email || '',
        name: authData.user.user_metadata?.name || 'User',
        is_admin: false,
        created_at: authData.user.created_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      toast.success('Welcome back!');

      // Redirect immediately - don't wait for profile fetch
      window.location.href = '/';
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error(
        'Login failed',
        error instanceof Error ? error.message : 'Please check your credentials'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-groovy-gradient flex items-center justify-center"
            whileHover={{ rotate: 15 }}
          >
            <IceCream2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="font-groovy text-3xl text-psychedelic-purple mb-1">
            Welcome Back
          </h1>
          <p className="text-chocolate/60">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="groovy-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-chocolate mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-groovy w-full"
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-chocolate mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-groovy w-full"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-psychedelic-purple/50 hover:text-psychedelic-purple"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-psychedelic-purple/30 text-psychedelic-purple focus:ring-psychedelic-purple"
              />
              <span className="text-chocolate/70">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-psychedelic-purple hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-groovy w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-chocolate/60">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-psychedelic-purple font-medium hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
