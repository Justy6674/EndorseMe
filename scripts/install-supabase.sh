#!/bin/bash

# Install Supabase packages script

echo "🚀 Installing Supabase and Stripe packages..."

# Install Supabase packages
echo "📦 Installing Supabase client libraries..."
npm install @supabase/supabase-js @supabase/auth-helpers-react @supabase/ssr

# Install Stripe packages
echo "💳 Installing Stripe libraries..."
npm install stripe @stripe/stripe-js react-stripe-js

# Install development dependencies
echo "🛠️  Installing development tools..."
npm install -D @types/stripe

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local"
echo "2. Add your Supabase project URL and keys"
echo "3. Add your Stripe keys (when ready)"
echo "4. Run the database migration"
echo ""
echo "See SUPABASE_SETUP.md for detailed instructions."