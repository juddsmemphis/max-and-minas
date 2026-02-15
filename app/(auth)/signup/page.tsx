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
import { toast } from '@/components/Toast';

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
      toast.error('Please agree to the terms');
      return;
    }

    if (!email || !password || !name) {
      toast.error('Please fill in all required fields');
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
        toast.error('Auth error: ' + authError.message);
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
      toast.success('Account created! Check your email to confirm.');
      router.push('/login');
    } catch (error: unknown) {
      console.error('Signup error:', error);
      toast.error('Signup failed: ' + (error instanceof Error ? error.message : 'Please try again'));
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
            className="mx-auto mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src="/icons/logo.png"
              alt="Max & Mina's"
              width={180}
              height={72}
              className="object-contain mx-auto"
            />
          </motion.div>
          <h1 className="font-heading font-bold text-3xl text-mm-black mb-1">
            Join the Club
          </h1>
          <p className="text-mm-gray-500 font-body">Never miss a flavor drop</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border-3 border-mm-black rounded-xl shadow-bold p-6 space-y-4">
          <div>
            <label className="block text-sm font-heading font-bold text-mm-black mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-11 pr-4 py-3 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-heading font-bold text-mm-black mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-heading font-bold text-mm-black mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-11 pr-11 py-3 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mm-gray-400 hover:text-mm-black"
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
            <label className="block text-sm font-heading font-bold text-mm-black mb-1">
              <span className="flex items-center gap-2">
                Birthday <Gift className="w-4 h-4 text-mm-pink" />
                <span className="text-mm-gray-400 font-body font-normal">(optional)</span>
              </span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
              />
            </div>
            <p className="text-xs text-mm-gray-500 mt-1 font-body">
              Share your birthday for a special surprise!
            </p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-mm-gray-300 text-mm-red focus:ring-mm-red"
            />
            <span className="text-sm text-mm-gray-600 font-body">
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-mm-blue hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-mm-blue hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading || !agreeToTerms}
            className="w-full py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <p className="text-center mt-6 text-mm-gray-500 font-body">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-mm-blue font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
