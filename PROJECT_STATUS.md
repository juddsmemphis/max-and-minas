# Max & Mina's PWA - Project Status

## Last Updated: February 12, 2026 (Afternoon)

## Project Overview
Building a Progressive Web App (PWA) for Max & Mina's Ice Cream in Flushing, Queens - a flavor tracking app with 15,000+ legendary flavors.

## Current Status: FULLY FUNCTIONAL - ADMIN FEATURES COMPLETE

### Live URLs
- **Production App**: https://max-and-minas.vercel.app
- **GitHub Repo**: https://github.com/juddsmemphis/max-and-minas
- **Supabase Project**: https://supabase.com/dashboard/project/lsqjkqmocjuldtvqaxtr

### What's Working
- App loads and displays correctly
- Login/signup works with session persistence
- Profile page with badges and stats
- Admin dashboard with full flavor management
- Today's menu display with filtering (Available/Rare/Sold Out)
- Watchlist functionality
- Flavor suggestions page
- Real-time sold out updates
- Onboarding flow (shows once for new users)
- Kosher certification footer on all pages

### Admin User
- **Email**: yjoffre@gmail.com
- **User ID**: ca8c1c06-9bf7-4ff6-af51-b3e0bf21ce1e
- **Status**: Admin access enabled (is_admin = true in users table)

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Grateful Dead themed color palette (dead-red #C84536)
- **Deployment**: Vercel (auto-deploys on git push)
- **PWA**: next-pwa with service worker

## Design System

### Grateful Dead Color Palette
```css
--dead-red: #C84536      /* Primary - matches logo */
--dead-orange: #E8833A   /* Secondary */
--dead-gold: #F4C430     /* Accent */
--dead-green: #22C55E    /* Success */
--dead-teal: #14B8A6     /* Info */
--dead-blue: #3B82F6     /* Links */
--dead-purple: #8B5CF6   /* Highlight */
--dead-pink: #EC4899     /* Special */
```

### Logo
- Located at: `public/icons/logo.png`
- Transparent background PNG
- Used in Header, Login, Signup, and Shop Info section

## Admin Features

### Admin Dashboard (`/admin`)
- Upload Today's Menu (photo recognition)
- Manage Flavors (full CRUD)
- View Suggestions
- Stats cards (clickable, link to relevant pages)

### Flavor Management (`/admin/flavors`)
Full editing capabilities for each flavor:
- **Name** and **Description**
- **Category** (creamy, fruity, chocolate, nutty, unique, savory, seasonal, vegan, floral)
- **Rarity Score** (0-10 slider)
- **Total Appearances** count
- **First/Last Appeared** dates
- **Hide Appearances** toggle (hides appearance count from public)
- **Gluten Free** (Yes/No/Unknown)
- **Contains Nuts** (Yes/No/Unknown)

### Dietary Badges
Displayed on FlavorCard and admin list:
- **GF** (green) - Gluten Free
- **NF** (blue) - Nut Free
- **Peanut emoji** (amber) - Contains Nuts

## Database Schema

### Required Columns for `flavors` Table
If starting fresh or columns missing, run this SQL:
```sql
ALTER TABLE flavors
ADD COLUMN IF NOT EXISTS hide_appearances BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contains_nuts BOOLEAN DEFAULT NULL;
```

### Making a User Admin
```sql
INSERT INTO users (id, email, name, is_admin)
VALUES ('USER_UUID_HERE', 'email@example.com', 'Name', true)
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

### Adding Sample Flavors
```sql
INSERT INTO flavors (name, category, first_appeared, rarity_score, total_appearances) VALUES
  ('Cookie Monster', 'creamy', '2001-08-20', 3.2, 150),
  ('Black Sesame', 'unique', '2005-03-15', 6.5, 45),
  ('Lox', 'savory', '1998-06-01', 9.2, 8);

-- Add to today's menu
INSERT INTO daily_menu (flavor_id, menu_date)
SELECT id, CURRENT_DATE FROM flavors WHERE name = 'Cookie Monster';
```

## Key Files Reference

### Core App Files
- `app/layout.tsx` - Root layout with Header, Navigation, Footer, AuthProvider
- `app/page.tsx` - Home page with today's flavors, stat chips, filtering
- `app/globals.css` - Grateful Dead themed styles, button/card classes

### Admin Pages
- `app/admin/page.tsx` - Admin dashboard with stats and quick actions
- `app/admin/flavors/page.tsx` - Full flavor CRUD management
- `app/admin/upload/page.tsx` - Photo upload for menu recognition
- `app/admin/suggestions/page.tsx` - View customer flavor suggestions

### Components
- `components/Header.tsx` - Logo and navigation
- `components/Navigation.tsx` - Bottom nav bar
- `components/FlavorCard.tsx` - Flavor display with dietary badges
- `components/AuthProvider.tsx` - Session management, fetches is_admin from DB

### Library Files
- `lib/supabase.ts` - Supabase client with SSR support
- `lib/store.ts` - Zustand store with persistence
- `lib/database.types.ts` - TypeScript types for all tables
- `lib/rarity.ts` - Rarity calculation logic

## TypeScript Notes

### Supabase Type Workaround
Since database types aren't auto-generated, queries use type casting:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data, error } = await (supabase as any)
  .from('flavors')
  .select('*');
```

This pattern is used in:
- `app/admin/flavors/page.tsx` (all CRUD operations)
- `app/admin/page.tsx` (dashboard stats)
- `components/AuthProvider.tsx` (user profile fetch)

## Environment Variables

### Required in Vercel & `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://lsqjkqmocjuldtvqaxtr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcWprcW1vY2p1bGR0dnFheHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTE4MjEsImV4cCI6MjA4NjQyNzgyMX0.R1pYlySd5G5ozvU9dyqGU8
NEXT_PUBLIC_APP_URL=https://max-and-minas.vercel.app
```

## Commands

```bash
# Navigate to project
cd "C:\Users\yjoff\OneDrive\Documents\max and minas app\max-and-minas"

# Run locally
npm run dev

# Build (clears cache first to avoid issues)
rm -rf .next && npm run build

# Deploy (auto-deploys on git push)
git add -A && git commit -m "message" && git push
```

## Completed Features (All Sessions)

### Session 1 (Feb 11-12 Morning)
- Initial auth implementation
- Supabase client setup with SSR
- Session persistence fixes
- Login/signup flows

### Session 2 (Feb 12 Afternoon)
- Interactive stat chips on home page (filter by Available/Rare/Sold Out)
- Interactive badges on profile page
- Max & Mina's logo integration (replaced IceCream2 icons)
- Grateful Dead color scheme (dead-red primary color)
- Fixed onboarding to only show once (hydration fix)
- Admin dashboard with clickable stat cards
- Full flavor management page (`/admin/flavors`)
- User admin setup (yjoffre@gmail.com)
- Fixed AuthProvider to fetch is_admin from database
- TypeScript build error fixes (Supabase type casts)
- Added dietary info fields (gluten-free, contains nuts)
- Added hide_appearances toggle
- Added "Kosher Certified Under the Vaad of Queens" footer

## Known Issues / Gotchas

1. **OneDrive Path**: Project is in OneDrive, paths have spaces - always quote paths
2. **Dev Server Locks .next**: Must kill dev server before `rm -rf .next`
3. **Type Casting Required**: Supabase queries need `(supabase as any)` cast
4. **Database Columns**: New flavor columns must be added via SQL (see above)

## Next Steps (Future Features)

1. **OneSignal Push Notifications** - Flavor alerts
2. **Photo Upload for Menu** - AI recognition of flavor board
3. **User Reviews/Ratings** - Let users rate flavors
4. **Social Sharing** - Share favorite flavors
5. **Historical Analytics** - Flavor appearance trends
