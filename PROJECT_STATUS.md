# Max & Mina's PWA - Project Status

## Last Updated: February 11, 2026 (Evening)

## Project Overview
Building a Progressive Web App (PWA) for Max & Mina's Ice Cream in Flushing, Queens - a flavor tracking app with 15,000+ legendary flavors.

## Current Status: DEPLOYED - AUTH TESTING IN PROGRESS

### Live URLs
- **Production App**: https://max-and-minas.vercel.app
- **GitHub Repo**: https://github.com/juddsmemphis/max-and-minas
- **Supabase Project**: https://supabase.com/dashboard/project/lsqjkqmocjuldtvqaxtr

### What's Working
- App loads and displays flavors from Supabase
- Flavor cards are clickable and navigate to detail pages
- Flavor archive with search and filtering
- Watchlist (heart icon) works locally
- Suggestions can be submitted
- PWA icons are set up (except icon-144x144.png - see issues)
- Signup creates user in Supabase auth (email confirmation works)

### Current Issue: Login Session Not Persisting (Testing Latest Fix)

**Problem**: After logging in, the session token was not being saved to localStorage. When you click the profile icon, it goes to /login instead of /profile because the app doesn't recognize you're logged in.

**Latest Fix (Feb 11 evening)**:
Updated `lib/supabase.ts` with:
- Explicit `storage: window.localStorage` for browser clients
- Correct `storageKey` matching Supabase's expected format
- Added `detectSessionInUrl: true`
- Added debug console.log in login page to trace session storage

**How to Test**:
1. Go to https://max-and-minas.vercel.app/login
2. Open DevTools (F12) → Console tab
3. Log in with: `yjoffre@gmail.com` (password user knows)
4. Check console for:
   - `Login result: { authData: {...}, authError: null }`
   - `Session in localStorage: Found`
5. If localStorage shows "Found", clicking profile icon should go to /profile
6. Manual check: `localStorage.getItem('sb-lsqjkqmocjuldtvqaxtr-auth-token')`

**If Still Not Working**: Check console for errors. May need to investigate CORS or third-party cookie issues.

### Test User Account
- **Email**: yjoffre@gmail.com
- **User ID**: ca8c1c06-9bf7-4ff6-af51-b3e0bf21ce1e
- **Status**: Email confirmed (manually via SQL)
- **Profile**: Exists in `users` table

## Completed This Session

### Infrastructure Setup
1. ✅ Created Supabase project and ran schema.sql
2. ✅ Added sample flavor data (10 flavors with rarity scores)
3. ✅ Created .env.local with Supabase credentials
4. ✅ Initialized Git and pushed to GitHub
5. ✅ Deployed to Vercel with environment variables
6. ✅ Added Vercel URL to Supabase redirect URLs

### Bug Fixes
1. ✅ FlavorCard not navigating - added onClick with router.push
2. ✅ Suggestions failing - updated RLS policy to allow anonymous submissions
3. ✅ Signup failing - changed insert to upsert, then simplified to rely on database trigger
4. ✅ Input icon overlap - added inline styles with paddingLeft: 2.75rem
5. ✅ Login flow breaking on profile fetch - wrapped in try-catch
6. ✅ React hydration error - added skipHydration to Zustand persist + manual rehydration

### Features Added
1. ✅ PWA icons generated from Max & Mina's logo (including 144x144)
2. ✅ AuthProvider component for session management
3. ✅ Supabase client singleton with explicit localStorage config
4. ✅ Debug logging for login session tracking

## Known Issues

### ~~Missing Icon~~ ✅ FIXED
- icon-144x144.png now exists in public/icons/

### ~~React Hydration Error~~ ✅ FIXED
- Was caused by Zustand persist middleware loading localStorage before hydration
- Fixed by adding `skipHydration: true` and manual rehydration in AuthProvider

## Environment Variables (Vercel & .env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://lsqjkqmocjuldtvqaxtr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcWprcW1vY2p1bGR0dnFheHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTE4MjEsImV4cCI6MjA4NjQyNzgyMX0.R1pYlySd5G5zMSTjQs4rU8DklaQYs5L5ozvU9dyqGU8
NEXT_PUBLIC_APP_URL=https://max-and-minas.vercel.app
```

## Next Steps (Priority Order)

1. **Test Login Session Persistence** - After latest deploy, verify localStorage token is saved
2. ~~**Fix Missing icon-144x144.png**~~ ✅ DONE
3. ~~**Fix React Hydration Error**~~ ✅ DONE
4. **Complete Auth Flow Testing** - Test full signup → confirm → login → profile flow
5. **OneSignal Push Notifications** - Set up OneSignal for flavor alerts

## Key Files Modified This Session

- `lib/supabase.ts` - Changed to standard client with persistSession
- `app/(auth)/login/page.tsx` - Fixed input overlap, wrapped profile fetch in try-catch
- `app/(auth)/signup/page.tsx` - Fixed input overlap, simplified to rely on trigger
- `app/layout.tsx` - Added AuthProvider wrapper
- `components/AuthProvider.tsx` - NEW: Listens for auth state changes
- `app/page.tsx` - Added router and onClick to FlavorCard
- `app/(customer)/archive/page.tsx` - Added router and onClick to FlavorCard

## Commands

```bash
# Navigate to project
cd "C:\Users\yjoff\OneDrive\Documents\max and minas app\max-and-minas"

# Run locally
npm run dev

# Build
npm run build

# Deploy (auto-deploys on git push)
git add -A && git commit -m "message" && git push
```

## Supabase SQL Commands Run

```sql
-- Confirm user email manually
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'yjoffre@gmail.com';

-- Check user exists
SELECT * FROM users WHERE email = 'yjoffre@gmail.com';
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'yjoffre@gmail.com';

-- RLS policy updates for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
```
