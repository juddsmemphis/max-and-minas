'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { toast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createSupabaseBrowser();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Redirect immediately - auth state will be picked up by AuthProvider
      window.location.href = '/';
    } catch (error: unknown) {
      console.error('Login error:', error);
      setIsLoading(false);
      toast.error(
        'Login failed',
        error instanceof Error ? error.message : 'Please check your credentials'
      );
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
            Welcome Back
          </h1>
          <p className="text-mm-gray-500 font-body">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border-3 border-mm-black rounded-xl shadow-bold p-6 space-y-4">
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
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-mm-gray-300 text-mm-red focus:ring-mm-red"
              />
              <span className="text-mm-gray-600 font-body">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-mm-blue hover:underline font-body"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-mm-red text-white font-heading font-bold border-3 border-mm-black rounded-xl shadow-bold hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <p className="text-center mt-6 text-mm-gray-500 font-body">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-mm-blue font-medium hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
