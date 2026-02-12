'use client';

import { useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useStore();

  useEffect(() => {
    // Hydrate persisted store
    useStore.persist.rehydrate();

    const supabase = createSupabaseBrowser();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Set user from session data (don't fetch profile to avoid blocking)
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          is_admin: false,
          created_at: session.user.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            is_admin: false,
            created_at: session.user.created_at,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
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
