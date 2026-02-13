# Max & Mina's PWA - Project Status

## Last Updated: February 13, 2026 (Early Morning)

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
- **Our Story page** with owners photo and history
- **Instagram link** in header
- **UberEats order button** on home page
- **Tags editor** in admin flavors
- **Add to Today's Menu** button in admin flavors

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
- **Tags** (add/remove custom tags like "kids-favorite", "unique", etc.)
- **Rarity Score** (0-10 slider)
- **Total Appearances** count
- **First/Last Appeared** dates
- **Hide Appearances** toggle (hides appearance count from public)
- **Gluten Free** (Yes/No/Unknown)
- **Contains Nuts** (Yes/No/Unknown)
- **Add to Today's Menu** button (calendar icon - blue to add, green if on menu)

### Dietary Badges
Displayed on FlavorCard and admin list:
- **GF** (green) - Gluten Free
- **NF** (blue) - Nut Free
- **Peanut emoji** (amber) - Contains Nuts

## Database Schema

### RLS Status
Row Level Security has been **disabled** on these tables for easier admin access:
```sql
ALTER TABLE flavors DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Required Columns for `flavors` Table
If starting fresh or columns missing, run this SQL:
```sql
ALTER TABLE flavors
ADD COLUMN IF NOT EXISTS description TEXT,
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

### Adding Flavors to Today's Menu
```sql
INSERT INTO daily_menu (flavor_id, menu_date)
VALUES ('FLAVOR_UUID_HERE', CURRENT_DATE);
```

## Key Files Reference

### Core App Files
- `app/layout.tsx` - Root layout with Header, Navigation, Footer, AuthProvider
- `app/page.tsx` - Home page with today's flavors, stat chips, UberEats button
- `app/globals.css` - Grateful Dead themed styles, button/card classes

### Customer Pages
- `app/(customer)/our-story/page.tsx` - Our Story page with owners photo
- `app/(customer)/flavor/[id]/page.tsx` - Flavor detail page with description display
- `app/(customer)/profile/settings/page.tsx` - User settings (name, birthday)

### Admin Pages
- `app/admin/page.tsx` - Admin dashboard with stats and quick actions
- `app/admin/flavors/page.tsx` - Full flavor CRUD with tags editor and menu management
- `app/admin/upload/page.tsx` - Photo upload for menu recognition
- `app/admin/suggestions/page.tsx` - View customer flavor suggestions

### Components
- `components/Header.tsx` - Logo, navigation, Instagram icon, notifications bell
- `components/Navigation.tsx` - Bottom nav bar (mobile)
- `components/FlavorCard.tsx` - Flavor display with dietary badges
- `components/AuthProvider.tsx` - Session management, fetches is_admin from DB

### Library Files
- `lib/supabase.ts` - Supabase client with SSR support
- `lib/store.ts` - Zustand store with persistence
- `lib/database.types.ts` - TypeScript types for all tables
- `lib/rarity.ts` - Rarity calculation logic

### Static Assets
- `public/icons/logo.png` - Max & Mina's logo
- `public/images/owners.jpg` - Bruce and Mark Becker photo for Our Story page

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

### Session 3 (Feb 13 Early Morning)
- **Our Story page** (`/our-story`) with owners photo and shop history
- Added Our Story tab to header navigation (desktop and mobile)
- Added description field to flavors table (SQL: `ALTER TABLE flavors ADD COLUMN description TEXT`)
- Flavor descriptions now display on flavor detail page (below rarity badge)
- **Add to Today's Menu** functionality in admin flavors page
  - Blue calendar+ icon = add to today's menu
  - Green calendar-check icon = already on menu (click to remove)
  - "On Menu Today" badge shows on flavor rows
- **UberEats order button** on home page (green, links to Max & Mina's UberEats)
- **Instagram icon** in header (left of notifications bell, links to @maxandminas)
- Fixed button heights on mobile (Directions/UberEats/Call Shop all same height)
- **Tags editor** in admin flavors:
  - Add/remove tags when creating or editing flavors
  - Tags display as pink bubbles on flavor detail page
  - Click X to remove a tag
- Disabled RLS on `flavors`, `daily_menu`, and `users` tables for easier admin operations

## Known Issues / Gotchas

1. **OneDrive Path**: Project is in OneDrive, paths have spaces - always quote paths
2. **Dev Server Locks .next**: Must kill dev server before `rm -rf .next`
3. **Type Casting Required**: Supabase queries need `(supabase as any)` cast
4. **Database Columns**: New flavor columns must be added via SQL (see above)
5. **RLS Disabled**: For admin operations to work, RLS must be disabled on relevant tables
6. **Birthday persistence**: User birthday saves to `users` table - requires RLS disabled

## External Links

- **UberEats**: https://www.ubereats.com/store/max-%26-minas-ice-cream/3XtTzTt3Xl2YCN-yOfT0QA?diningMode=DELIVERY&sc=SEARCH_SUGGESTION
- **Instagram**: https://www.instagram.com/maxandminas
- **Google Maps**: https://maps.google.com/?q=Max+and+Minas+Flushing
- **Phone**: +1 (718) 428-1168

## Next Steps (Future Features)

1. **OneSignal Push Notifications** - Flavor alerts
2. **Photo Upload for Menu** - AI recognition of flavor board
3. **User Reviews/Ratings** - Let users rate flavors
4. **Social Sharing** - Share favorite flavors
5. **Historical Analytics** - Flavor appearance trends
