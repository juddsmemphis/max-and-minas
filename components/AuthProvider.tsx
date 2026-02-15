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

    // Function to fetch user profile including admin status and birthday
    const fetchUserProfile = async (userId: string, email: string, name: string, createdAt: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('users')
          .select('is_admin, name, birthday')
          .eq('id', userId)
          .single();

        setUser({
          id: userId,
          email: email,
          name: profile?.name || name,
          is_admin: profile?.is_admin || false,
          birthday: profile?.birthday || null,
          created_at: createdAt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      } catch {
        // Fallback if profile fetch fails
        setUser({
          id: userId,
          email: email,
          name: name,
          is_admin: false,
          birthday: null,
          created_at: createdAt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.name || 'User',
          session.user.created_at
        );
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          fetchUserProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.name || 'User',
            session.user.created_at
          );
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
