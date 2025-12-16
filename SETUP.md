# Verivo Next.js Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd verivo-nextjs/
   npm install
   ```

2. **Set up Supabase:**
   - Go to https://supabase.com and create a new project
   - Copy your project URL and anon key
   - Go to SQL Editor and run the SQL from `supabase/schema.sql`
   - This will create all necessary tables, RLS policies, and triggers

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to http://localhost:3000

## Project Structure

```
verivo-nextjs//
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── dashboard/            # Expert dashboard
│   ├── feed/                # Predictions feed
│   ├── predictions/          # Predictions pages
│   ├── experts/             # Expert profiles
│   ├── leaderboard/         # Leaderboard
│   ├── premium/             # Premium page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/               # React components
│   ├── ui/                  # Shadcn UI components
│   ├── navbar.tsx           # Navigation
│   ├── footer.tsx           # Footer
│   ├── prediction-card.tsx  # Prediction display
│   └── prediction-form.tsx   # Create prediction form
├── lib/                     # Utilities
│   ├── supabase/            # Supabase clients
│   ├── actions/             # Server actions
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript types
│   └── database.types.ts    # Database types
└── supabase/                # Database schema
    └── schema.sql           # SQL schema
```

## Key Features

✅ **Authentication** - Supabase Auth with protected routes
✅ **Predictions** - Create, lock, and reveal predictions
✅ **Feed** - Dynamic timeline of predictions
✅ **Expert Profiles** - View expert stats and predictions
✅ **Accuracy Calculation** - Automatic accuracy tracking
✅ **Verivo Score** - Signature metric (0-100)
✅ **Gradient UI** - Matches original design style

## Database Schema

The schema includes:
- `experts` - User profiles
- `predictions` - Expert predictions
- `validations` - Prediction validation results
- `expert_stats` - Calculated statistics

All tables have Row Level Security (RLS) enabled.

## Next Steps

1. Customize the UI colors in `tailwind.config.ts`
2. Add more features as needed
3. Deploy to Vercel or your preferred platform

## Troubleshooting

- **"Module not found"** - Run `npm install`
- **Supabase errors** - Check your environment variables
- **RLS errors** - Ensure you've run the schema.sql file
- **Build errors** - Check TypeScript types match your Supabase schema



