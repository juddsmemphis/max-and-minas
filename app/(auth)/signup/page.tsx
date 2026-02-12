'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  Gift,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const { completeOnboarding } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      alert('Please agree to the terms');
      return;
    }

    if (!email || !password || !name) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const supabase = createSupabaseBrowser();

    try {
      // Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        alert('Auth error: ' + authError.message);
        throw authError;
      }

      // Auth signup succeeded - the database trigger will create the profile
      // Try to update with birthday if provided, but don't fail if it doesn't work
      if (authData.user && birthday) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('users')
            .update({ birthday })
            .eq('id', authData.user.id);
        } catch {
          // Profile update failed - that's okay, trigger created basic profile
          console.log('Profile update skipped - will update after email confirmation');
        }
      }

      completeOnboarding();
      alert('Account created! Check your email to confirm.');
      router.push('/login');
    } catch (error: unknown) {
      console.error('Signup error:', error);
      alert('Signup failed: ' + (error instanceof Error ? error.message : 'Please try again'));
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
            className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src="/icons/android/android-launchericon-192-192.png"
              alt="Max & Mina's"
              width={80}
              height={80}
              className="object-contain"
            />
          </motion.div>
          <h1 className="font-groovy text-3xl text-psychedelic-purple mb-1">
            Join the Club
          </h1>
          <p className="text-chocolate/60">Never miss a flavor drop</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="groovy-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-chocolate mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-groovy w-full"
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

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
                placeholder="Min. 8 characters"
                className="input-groovy w-full"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                minLength={8}
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

          <div>
            <label className="block text-sm font-medium text-chocolate mb-1">
              <span className="flex items-center gap-2">
                Birthday <Gift className="w-4 h-4 text-psychedelic-pink" />
                <span className="text-chocolate/50 font-normal">(optional)</span>
              </span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="input-groovy w-full"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
            <p className="text-xs text-chocolate/50 mt-1">
              Share your birthday for a special surprise!
            </p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-psychedelic-purple/30 text-psychedelic-purple focus:ring-psychedelic-purple"
            />
            <span className="text-sm text-chocolate/70">
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-psychedelic-purple hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-psychedelic-purple hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading || !agreeToTerms}
            className="btn-groovy w-full py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-chocolate/60">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-psychedelic-purple font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
