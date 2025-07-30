# Supabase Setup Guide for EndorseMe

## Prerequisites
Before starting, you'll need:
1. A Supabase account (free tier is fine to start)
2. Your Supabase project URL and API keys
3. Node.js installed locally

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: endorseme-prod
   - **Database Password**: [generate a strong password and save it]
   - **Region**: Australia Southeast (Sydney) - for low latency
   - **Pricing Plan**: Free tier to start

## Step 2: Get Your API Keys

Once your project is created:
1. Go to Settings → API
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon/Public Key**: (safe for browser)
   - **Service Role Key**: (server-side only - keep secret!)

## Step 3: Install Supabase Packages

```bash
# Install Supabase client libraries
npm install @supabase/supabase-js @supabase/auth-helpers-react @supabase/ssr

# Install Stripe (for payments)
npm install stripe @stripe/stripe-js
```

## Step 4: Set Up Environment Variables

Create a `.env.local` file (copy from .env.example):
```bash
cp .env.example .env.local
```

Then add your Supabase credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe (when ready)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 5: Database Migration

### Option A: Automated Migration (Recommended)
Run the migration script:
```bash
npm run supabase:migrate
```

### Option B: Manual Migration
1. Go to Supabase SQL Editor
2. Copy the schema from `supabase/migrations/001_initial_schema.sql`
3. Run the SQL commands

## Step 6: Enable Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates:
   - Confirmation email
   - Password reset
   - Magic link

## Step 7: Set Up Storage Buckets

1. Go to Storage
2. Create buckets:
   - `documents` - for user documents
   - `avatars` - for profile pictures
   - `certificates` - for CPD certificates

3. Set bucket policies (RLS):
```sql
-- Users can only access their own files
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 8: Enable Row Level Security (RLS)

Run these commands in SQL Editor:
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpd_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Similar policies for other tables...
```

## Step 9: Test Your Connection

Create a test file `test-supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testConnection() {
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connected to Supabase!')
  }
}

testConnection()
```

Run: `node test-supabase.js`

## Step 10: Stripe Setup (Optional)

1. Create Stripe account at [https://stripe.com](https://stripe.com)
2. Get your test keys from Dashboard
3. Set up products and prices:
   - Candidate Plan: $19/month
   - Professional Plan: $39/month
   - Enterprise Plan: $99/month

## Common Issues & Solutions

### CORS Errors
- Add your domain to Supabase → Settings → API → CORS

### Auth Errors
- Check email templates are configured
- Verify redirect URLs are set correctly

### Storage Errors
- Ensure bucket policies are set
- Check file size limits (default 50MB)

## Next Steps

1. Update database connection in `server/db.ts`
2. Replace Replit Auth with Supabase Auth
3. Migrate existing data
4. Test all features
5. Deploy to production

## Useful Commands

```bash
# Check Supabase status
npx supabase status

# Run migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > types/supabase.ts
```

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + React Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)