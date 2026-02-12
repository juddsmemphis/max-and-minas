'use client';

import { useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useStore();

  // Hydrate the persisted store on mount (fixes hydration mismatch)
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    // Check current session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthProvider: checking session', session ? 'found' : 'none');

      if (session?.user) {
        console.log('AuthProvider: session user id', session.user.id);
        // Fetch user profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userData, error } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('AuthProvider: profile fetch result', { userData, error });

        if (userData) {
          setUser(userData);
        } else if (session.user) {
          // Fallback: create a minimal user object from session if profile fetch fails
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            is_admin: false,
            created_at: session.user.created_at,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: auth state changed', event);
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: userData, error } = await (supabase as any)
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('AuthProvider: onAuthStateChange profile fetch', { userData, error });

          if (userData) {
            setUser(userData);
          } else {
            // Fallback: create minimal user from session
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'User',
              is_admin: false,
              created_at: session.user.created_at,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}
