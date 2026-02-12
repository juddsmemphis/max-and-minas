import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Only cache client on the browser, never during SSR
let browserClient: SupabaseClient<Database> | null = null;

export function createSupabaseBrowser(): SupabaseClient<Database> {
  // Always check if we're in browser
  if (typeof window === 'undefined') {
    // SSR - create fresh client without caching
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Browser - use cached client
  if (browserClient) {
    return browserClient;
  }

  console.log('Creating Supabase browser client...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  browserClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
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
