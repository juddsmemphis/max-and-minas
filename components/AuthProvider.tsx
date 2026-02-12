'use client';

import { useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useStore();

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    // Check current session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userData } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser(userData);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: userData } = await (supabase as any)
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            setUser(userData);
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
