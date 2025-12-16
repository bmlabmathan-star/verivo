# Verivo - Next.js 14 Platform

A verified expert predictions platform built with Next.js 14, TypeScript, TailwindCSS, and Supabase.

## Features

- 🔐 Authentication with Supabase Auth
- 📊 Create and lock predictions with timestamps
- 🔓 Reveal predictions after event closure
- 📱 Dynamic feed of predictions
- 👤 Expert profiles with accuracy statistics
- 🎯 Real-time accuracy calculations
- 🎨 Beautiful gradient UI matching original design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **UI Components**: Shadcn UI
- **Server Actions**: Next.js Server Actions

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- A Supabase account and project

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd verivo-nextjs
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
verivo-nextjs/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Expert dashboard
│   ├── feed/              # Predictions feed
│   ├── experts/           # Expert profiles
│   └── predictions/       # Prediction pages
├── components/            # React components
│   ├── ui/                # Shadcn UI components
│   ├── navbar.tsx         # Navigation bar
│   ├── footer.tsx         # Footer component
│   └── prediction-card.tsx # Prediction card component
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase clients
│   └── actions/           # Server actions
├── types/                 # TypeScript types
└── supabase/              # Database schema
```

## Database Schema

The platform uses the following main tables:

- **experts**: User profiles linked to Supabase Auth
- **predictions**: Expert predictions with locking/reveal functionality
- **validations**: Prediction validation results
- **expert_stats**: Calculated expert statistics

## Features in Detail

### Prediction Locking
- Predictions are automatically locked when created
- Cannot be modified after creation
- Revealed only after event close time

### Accuracy Calculation
- Automatically calculated as: correct_predictions / total_predictions
- Updated in real-time when validations are added
- Verivo Score = rounded accuracy percentage

### Protected Routes
- Middleware protects dashboard routes
- Requires authentication for creating predictions
- Public access to feed and expert profiles

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js 14:
- Netlify
- Railway
- AWS Amplify
- Your own server

## License

ISC



