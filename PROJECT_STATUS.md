# Max & Mina's PWA - Project Status

## Last Updated: February 15, 2026 (Session 6 Complete - LIVE)

## Project Overview
Building a Progressive Web App (PWA) for Max & Mina's Ice Cream in Flushing, Queens - a flavor tracking app with 15,000+ legendary flavors.

## Current Status: LIVE IN PRODUCTION

### Live URLs
- **Production App**: https://max-and-minas.vercel.app
- **GitHub Repo**: https://github.com/juddsmemphis/max-and-minas
- **Supabase Project**: https://supabase.com/dashboard/project/lsqjkqmocjuldtvqaxtr

### Project Location
- **Local Path**: `C:\max and minas app\max-and-minas`
- Moved from OneDrive to avoid file locking issues

### What's Working
- App loads and displays correctly with new "Cereal Box Bold" design
- Login/signup works with session persistence
- Profile page with badges and stats
- Admin dashboard with full flavor management
- Today's menu display with filtering (Available/Rare/Sold Out)
- Watchlist functionality
- Flavor suggestions page
- Real-time sold out updates
- Onboarding flow (shows once for new users, fixed for mobile)
- Kosher certification footer on all pages
- **Our Story page** with owners photo and history
- **Instagram link** in header
- **UberEats order button** on home page
- **Tags editor** in admin flavors with quick-add suggestions
- **Add to Today's Menu** button in admin flavors
- **"Always on Menu"** option for staple flavors
- **Hours of Operation** management in admin
- **Hours display** on home page (today's hours + expandable full week)
- **Compact flavor cards** for mobile viewing
- **Tag filtering** on Today's Flavors and Archive pages
- **Dietary filtering** (Gluten Free, Nut Free, Contains Nuts) on both pages
- **Scrolling marquee banner** in header (Framer Motion animation)
- **Film grain texture overlay**
- **Bouncy micro-interactions** (hover-wiggle, card-bouncy)
- **Shimmer loading skeletons**
- **Glow effects on legendary badges**
- **Accessibility improvements** (focus states, reduced motion support)

### Admin User
- **Email**: yjoffre@gmail.com
- **User ID**: ca8c1c06-9bf7-4ff6-af51-b3e0bf21ce1e
- **Status**: Admin access enabled (is_admin = true in users table)

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: "Cereal Box Bold" design system (mm- color palette)
- **Animations**: Framer Motion
- **Deployment**: Vercel (auto-deploys on git push)
- **PWA**: next-pwa with service worker

---

## Design System: "Cereal Box Bold"

### Color Palette (`mm-` prefix)
```css
/* Primary Colors */
--mm-black: #1A1A1A       /* Primary text, borders */
--mm-cream: #FFF8E7       /* Background */
--mm-red: #E63946         /* Primary action, CTA */

/* Accent Colors */
--mm-yellow: #FFD166      /* Legendary rarity, highlights */
--mm-blue: #118AB2        /* Links, info, uncommon */
--mm-mint: #06D6A0        /* Success, common, available */
--mm-pink: #F72585        /* Rare rarity, tags */
--mm-orange: #FB8500      /* Warnings, nuts indicator */

/* Gray Scale */
--mm-gray-50 through --mm-gray-900
```

### Typography
- **font-heading**: Space Grotesk (bold headings)
- **font-body**: DM Sans (body text)
- **font-accent**: Lilita One (decorative, logo-style)

### Key Design Patterns
- **Bold 3px borders**: `border-3 border-mm-black`
- **Offset shadows**: `shadow-bold` (3px 3px), `shadow-bold-lg` (5px 5px)
- **Colored shadows**: `shadow-bold-yellow`, `shadow-bold-pink`, `shadow-bold-blue`
- **Hover effects**: `hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5`
- **Rounded corners**: `rounded-xl` (12px) or `rounded-lg` (8px)
- **Film grain overlay**: Fixed overlay with 8% opacity, subtle animation
- **Micro-interactions**: `hover-wiggle`, `card-bouncy` for playful feel
- **Shimmer skeletons**: `.skeleton` class for loading states
- **Badge effects**: `badge-shine` shimmer, `glow-gold` for legendary items

### Accessibility Features
- Focus states with mm-blue outline
- Reduced motion support (`prefers-reduced-motion`)
- High contrast mode support
- Proper ARIA labels throughout

---

## Admin Features

### Admin Dashboard (`/admin`)
- Upload Today's Menu (photo recognition)
- Manage Flavors (full CRUD)
- View Suggestions
- Hours of Operation
- Stats cards (clickable, link to relevant pages)

### Flavor Management (`/admin/flavors`)
Full editing capabilities for each flavor:
- **Name** and **Description**
- **Category** (creamy, fruity, chocolate, nutty, unique, savory, seasonal, vegan, floral)
- **Tags** (add/remove custom tags + quick-add existing tags)
- **Rarity Score** (0-10 slider)
- **Total Appearances** count
- **First/Last Appeared** dates
- **Hide Appearances** toggle (hides appearance count from public)
- **Gluten Free** (Yes/No/Unknown)
- **Contains Nuts** (Yes/No/Unknown)
- **Always on Menu** toggle (flavor shows daily without manual adding)
- **Add to Today's Menu** button (calendar icon - blue to add, green if on menu)

### Hours of Operation (`/admin/hours`)
- Set open/close times for each day of the week
- Mark days as closed
- Preview how hours display to customers
- Today's day highlighted
- Changes save to database immediately

### Dietary Badges
Displayed on FlavorCard and admin list:
- **GF** (green) - Gluten Free
- **NF** (blue) - Nut Free
- **Peanut emoji** (amber) - Contains Nuts

---

## Database Schema

### Tables
- `flavors` - All flavor data
- `daily_menu` - Today's menu items
- `users` - User profiles and admin status
- `business_hours` - Hours of operation
- `flavor_suggestions` - Customer suggestions

### RLS Status
Row Level Security has been **disabled** on these tables for easier admin access:
```sql
ALTER TABLE flavors DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours DISABLE ROW LEVEL SECURITY;
```

### Required Columns for `flavors` Table
If starting fresh or columns missing, run this SQL:
```sql
ALTER TABLE flavors
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS hide_appearances BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contains_nuts BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS always_available BOOLEAN DEFAULT false;
```

### Business Hours Table
```sql
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_name TEXT NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE business_hours DISABLE ROW LEVEL SECURITY;

INSERT INTO business_hours (day_of_week, day_name, open_time, close_time, is_closed) VALUES
  (0, 'Sunday', '12:00', '22:00', false),
  (1, 'Monday', '12:00', '22:00', false),
  (2, 'Tuesday', '12:00', '22:00', false),
  (3, 'Wednesday', '12:00', '22:00', false),
  (4, 'Thursday', '12:00', '22:00', false),
  (5, 'Friday', '12:00', '14:00', false),
  (6, 'Saturday', '20:00', '23:00', false)
ON CONFLICT (day_of_week) DO NOTHING;
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

---

## Key Files Reference

### Core App Files
- `app/layout.tsx` - Root layout with Header, Navigation, Footer, AuthProvider
- `app/page.tsx` - Home page with today's flavors, stat chips, hours display, tag/dietary filters
- `app/globals.css` - Design system styles (mm- classes, animations, grain overlay)
- `tailwind.config.ts` - Tailwind configuration with mm- color palette

### Customer Pages
- `app/(customer)/archive/page.tsx` - Flavor archive with category/rarity/tag/dietary filters
- `app/(customer)/our-story/page.tsx` - Our Story page with owners photo
- `app/(customer)/flavor/[id]/page.tsx` - Flavor detail page
- `app/(customer)/profile/page.tsx` - User profile with stats and badges
- `app/(customer)/profile/settings/page.tsx` - User settings (name, birthday)

### Admin Pages
- `app/admin/page.tsx` - Admin dashboard
- `app/admin/flavors/page.tsx` - Full flavor CRUD
- `app/admin/hours/page.tsx` - Hours of operation management
- `app/admin/upload/page.tsx` - Photo upload for menu recognition
- `app/admin/suggestions/page.tsx` - View customer flavor suggestions

### Components
- `components/Header.tsx` - Logo, marquee banner (Framer Motion), navigation
- `components/Navigation.tsx` - Bottom nav bar, wiggle animation
- `components/FlavorCard.tsx` - Compact flavor display with rarity shadows
- `components/RarityBadge.tsx` - Rarity badge with shine/glow effects
- `components/LoadingSpinner.tsx` - Loading spinner and shimmer skeleton cards
- `components/Onboarding.tsx` - First-time user onboarding (fixed for mobile with 100dvh)
- `components/AuthProvider.tsx` - Session management, fetches is_admin from DB

### Library Files
- `lib/supabase.ts` - Supabase client with SSR support
- `lib/store.ts` - Zustand store with persistence
- `lib/database.types.ts` - TypeScript types for all tables
- `lib/rarity.ts` - Rarity calculation logic

### Static Assets
- `public/icons/logo.png` - Max & Mina's logo
- `public/images/owners.jpg` - Bruce and Mark Becker photo for Our Story page
- `public/images/grain.png` - Film grain texture overlay

---

## Environment Variables

### Required in Vercel & `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://lsqjkqmocjuldtvqaxtr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://max-and-minas.vercel.app
```

---

## Commands

```bash
# Navigate to project
cd "C:\max and minas app\max-and-minas"

# Run locally
npm run dev

# Build (clears cache first to avoid issues)
rm -rf .next && npm run build

# Deploy (auto-deploys on git push)
git add -A && git commit -m "message" && git push
```

---

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
- Added description field to flavors table
- Flavor descriptions now display on flavor detail page
- **Add to Today's Menu** functionality in admin flavors page
- **UberEats order button** on home page
- **Instagram icon** in header
- Fixed button heights on mobile
- **Tags editor** in admin flavors
- Disabled RLS on `flavors`, `daily_menu`, and `users` tables

### Session 4 (Feb 14 Late Night)
- **Tag suggestions**: Existing tags show as quick-add buttons
- **"Always on Menu"** option for staple flavors
- **Compact FlavorCard design**
- **Hours of Operation management**
- **Google Business Profile API**: Applied for access (Case ID: 2-5016000040676)
- **Apple Business Connect**: Checked API options (manual updates only)

### Session 5 (Feb 15 Early Morning)
- **Tag filtering on Archive page**
- **Dietary filtering on Archive page**
- **Tag filtering on Today's Flavors**
- **Dietary filtering on Today's Flavors**

### Session 6 (Feb 15 Morning-Afternoon) - UI REDESIGN - COMPLETE
- **Research phase**: Analyzed Salt & Straw, Jeni's, Van Leeuwen websites
- **Design system created**: "Cereal Box Bold" with mm- color palette
- **Core design files updated**: tailwind.config.ts, globals.css
- **Components redesigned**: Header, Navigation, FlavorCard, RarityBadge, LoadingSpinner
- **All pages converted** to new design system
- **Film grain texture overlay** with 8% opacity and subtle animation
- **Bouncy micro-interactions**: hover-wiggle, card-bouncy classes
- **Compact FlavorCards** for mobile (2-row layout instead of 4)
- **Fixed onboarding** for mobile viewport (z-[100], 100dvh)
- **Shimmer loading skeletons** for better UX
- **Glow effects** on legendary badges (glow-gold, badge-shine)
- **Marquee banner** fixed with Framer Motion animation
- **Accessibility improvements**: Focus states, reduced motion, high contrast support
- **Fixed Kosher footer** overlay issue (static positioning)
- **Published to production**: https://max-and-minas.vercel.app

---

## Pending / Future Features

### Google Business Profile API Integration
- **Status**: Applied, waiting for approval
- **Case ID**: 2-5016000040676
- **Next steps**: Once approved, build sync feature to auto-update Google Maps hours

### Apple Business Connect
- **Status**: No API access available for custom apps
- **Workaround**: Manual updates at https://businessconnect.apple.com when hours change

### Future Ideas
1. **OneSignal Push Notifications** - Flavor alerts
2. **Photo Upload for Menu** - AI recognition of flavor board
3. **User Reviews/Ratings** - Let users rate flavors
4. **Social Sharing** - Share favorite flavors
5. **Historical Analytics** - Flavor appearance trends
6. **Flavor search** - Search by name across all flavors

---

## Known Issues / Gotchas

1. **Webpack Cache Errors**: If you see "Cannot find module './XXX.js'", run `rm -rf .next` and rebuild
2. **Dev Server Locks .next**: Must kill dev server before `rm -rf .next`
3. **Type Casting Required**: Supabase queries need `(supabase as any)` cast
4. **Database Columns**: New flavor columns must be added via SQL (see above)
5. **RLS Disabled**: For admin operations to work, RLS must be disabled on relevant tables
6. **Port conflicts**: If 3000 is in use, dev server will start on 3001, 3002, etc.
7. **Mobile viewport**: Use `100dvh` instead of `100vh` for proper mobile height (accounts for browser chrome)
8. **Z-index layering**: Navigation is z-50, overlays should be z-[100] or higher

---

## External Links

- **UberEats**: https://www.ubereats.com/store/max-%26-minas-ice-cream/3XtTzTt3Xl2YCN-yOfT0QA?diningMode=DELIVERY&sc=SEARCH_SUGGESTION
- **Instagram**: https://www.instagram.com/maxandminas
- **Google Maps**: https://maps.google.com/?q=Max+and+Minas+Flushing
- **Google Business Profile**: https://business.google.com
- **Apple Business Connect**: https://businessconnect.apple.com
- **Phone**: +1 (718) 428-1168
