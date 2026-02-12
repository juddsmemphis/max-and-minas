import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseBrowser() {
  if (browserClient) return browserClient;

  const isBrowser = typeof window !== 'undefined';

  browserClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: isBrowser ? window.localStorage : undefined,
        storageKey: 'sb-lsqjkqmocjuldtvqaxtr-auth-token',
      },
    }
  );

  return browserClient;
}

export function createSupabaseServer() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export function createSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
