# Max & Mina's PWA - Project Status

## Last Updated: February 12, 2026 (Morning)

## Project Overview
Building a Progressive Web App (PWA) for Max & Mina's Ice Cream in Flushing, Queens - a flavor tracking app with 15,000+ legendary flavors.

## Current Status: AUTH WORKING - TESTING DATA LOADING

### Live URLs
- **Production App**: https://max-and-minas.vercel.app
- **GitHub Repo**: https://github.com/juddsmemphis/max-and-minas
- **Supabase Project**: https://supabase.com/dashboard/project/lsqjkqmocjuldtvqaxtr

### What's Working
- App loads and displays correctly
- Login works and redirects to home page
- Session persists across refreshes (fixed localStorage issue)
- Profile icon goes to profile page when logged in
- Sign out functionality works
- "Today's Flavors" heading (changed from "Today's Drops")
- Vercel auto-deploys on git push (fixed connection issue)

### Current Issue: Data Not Loading on Pages

**Problem**: After logging in, pages show skeleton loaders indefinitely instead of content.

**Latest Fix (Feb 12)**:
- Added 10-second timeout to all Supabase queries to prevent infinite hanging
- Added debug console logging to track query execution
- Applied fix to: home page, watchlist, archive

**How to Debug**:
1. Open browser DevTools (F12) → Console tab
2. Navigate to home page
3. Look for these logs:
   - `Fetching menu for date: 2026-02-12`
   - `Menu fetch result: { data: [...], error: null }`
   - `Menu fetch complete, setting isLoading=false`

**Possible Causes**:
1. **Empty database** - If no flavors/daily_menu data exists for today
2. **Query timeout** - Should now show empty state after 10s instead of infinite loading

### Test User Account
- **Email**: yjoffre@gmail.com
- **Status**: Login working, session persisting

## Completed This Session (Feb 11-12)

### Auth Fixes (RESOLVED)
1. ✅ Fixed Supabase client to persist sessions properly
2. ✅ Fixed login to not fail when profile fetch fails
3. ✅ Added AuthProvider to persist login state across page refreshes
4. ✅ Fixed signup to not fail when profile update is blocked by RLS
5. ✅ Fixed sign out to clear localStorage token and redirect
6. ✅ Fixed Vercel deployment connection (repo was private, needed to be public)
7. ✅ Changed "Today's Drops" to "Today's Flavors"

### Data Loading Fixes (IN PROGRESS)
1. ✅ Added query timeouts to prevent infinite loading states
2. ✅ Added debug logging to diagnose query results
3. ⏳ Need to verify if database has data for today's menu

## Known Issues

### Data Loading Shows Skeleton Loaders
- May be due to empty database or query issues
- Check console for debug logs after latest deploy

## Environment Variables (Vercel & .env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://lsqjkqmocjuldtvqaxtr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcWprcW1vY2p1bGR0dnFheHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTE4MjEsImV4cCI6MjA4NjQyNzgyMX0.R1pYlySd5G5zMSTjQs4rU8DklaQYs5L5ozvU9dyqGU8
NEXT_PUBLIC_APP_URL=https://max-and-minas.vercel.app
```

## Next Steps (Priority Order)

1. **Verify database has data** - Check if flavors and daily_menu tables have entries
2. **Check console logs** - See what the debug logging shows
3. **Add sample data if needed** - Use admin upload or SQL to add test flavors
4. **OneSignal Push Notifications** - Set up OneSignal for flavor alerts

## Key Files Modified This Session

- `lib/supabase.ts` - Explicit localStorage config for session persistence
- `app/(auth)/login/page.tsx` - Manual session save, immediate redirect
- `app/(auth)/signup/page.tsx` - Fixed profile update handling
- `app/(customer)/profile/page.tsx` - Fixed sign out with localStorage clear
- `components/AuthProvider.tsx` - Session checking with fallback user
- `app/page.tsx` - Changed to "Today's Flavors", added query timeout
- `app/(customer)/watchlist/page.tsx` - Added query timeout
- `app/(customer)/archive/page.tsx` - Added query timeout

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

## Database Schema Notes

RLS policies allow:
- `flavors` table: Public read (everyone can view)
- `daily_menu` table: Public read (everyone can view)
- Data must be added via admin upload feature or directly in Supabase

To add sample data, uncomment the seed section in `supabase/schema.sql` or run:
```sql
INSERT INTO flavors (name, category, first_appeared, rarity_score) VALUES
  ('Cookie Monster', 'creamy', '2001-08-20', 3.2),
  ('Black Sesame', 'creamy', '2005-03-15', 6.5);

-- Then add to today's menu
INSERT INTO daily_menu (flavor_id, menu_date)
SELECT id, CURRENT_DATE FROM flavors WHERE name = 'Cookie Monster';
```
