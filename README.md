# Max & Mina's Ice Cream Flavor Drop App

A progressive web app (PWA) for Max & Mina's Ice Cream in Flushing, Queens - tracking 15,000+ legendary flavors since 1997.

## Features

- **Daily Flavor Drops**: Real-time updates when new flavors are posted
- **Watchlist System**: Add flavors to your watchlist and get notified when they appear
- **Rarity System**: Legendary, Rare, Uncommon, and Regular rarity tiers
- **Admin Panel**: Upload menu photos and let Claude AI extract flavor names
- **Push Notifications**: OneSignal integration for instant alerts
- **Flavor Archive**: Browse and search all 15,000+ flavors
- **Check-in System**: Track which flavors you've tried
- **Badge Gamification**: Earn badges for trying flavors
- **Instagram Sharing**: Generate shareable cards for social media
- **PWA**: Installable on mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with psychedelic theme
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **AI**: Anthropic Claude API (Haiku for photo parsing)
- **Push Notifications**: OneSignal
- **Email**: Resend
- **Animations**: Framer Motion
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key
- OneSignal account (optional)
- Resend account (optional)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure your `.env.local` with your API keys:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# OneSignal (optional)
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_app_id
ONESIGNAL_REST_API_KEY=your_api_key

# Resend (optional)
RESEND_API_KEY=your_resend_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Go to SQL Editor
   - Run the SQL from `supabase/schema.sql`
   - Enable Realtime for the `daily_menu` table

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
max-and-minas/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (customer)/       # Customer pages
│   │   ├── archive/      # Flavor archive
│   │   ├── check-in/     # Check-in flow
│   │   ├── flavor/[id]/  # Flavor detail
│   │   ├── profile/      # User profile
│   │   ├── suggestions/  # Suggestion board
│   │   └── watchlist/    # User watchlist
│   ├── admin/            # Admin panel
│   │   ├── upload/       # Photo upload
│   │   └── suggestions/  # View suggestions
│   ├── api/              # API routes
│   └── page.tsx          # Home (Today's Menu)
├── components/           # Reusable components
├── lib/                  # Utilities & configs
├── public/               # Static assets & PWA
└── supabase/             # Database schema
```

## Admin Panel

Access `/admin` to:
1. Upload a photo of the daily flavor board
2. Claude AI extracts flavor names automatically
3. Review and confirm the extraction
4. Publish the menu and notify users

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## PWA Installation

The app is a Progressive Web App. Users can:
- **iOS**: Open in Safari → Share → Add to Home Screen
- **Android**: Chrome will prompt to install, or Menu → Add to Home Screen

## Design System

The app uses a "Psychedelic Nostalgia" theme:
- Grateful Dead / tie-dye vibes
- 1970s cereal box aesthetic
- Colors: Electric purple (#9B59B6), hot pink (#FF69B4), lime green (#BFFF00), orange sherbet (#FF8C42), sky blue (#00CED1)
- Groovy fonts (Pacifico, Fredoka One) and melting effects

## License

Private - For Max & Mina's Ice Cream use only.
