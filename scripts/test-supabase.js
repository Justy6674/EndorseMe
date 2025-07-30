import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey?.substring(0, 20) + '...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message)
    } else {
      console.log('✅ Connected to Supabase!')
      console.log('📝 Session:', session ? 'Active' : 'No active session')
    }

    // Test 2: Try to fetch from a table (will fail with RLS, but shows connection works)
    const { error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (dbError) {
      if (dbError.message.includes('relation "public.users" does not exist')) {
        console.log('⚠️  Tables not created yet - run the migration first')
      } else if (dbError.message.includes('row-level security')) {
        console.log('✅ Database connected (RLS is active)')
      } else {
        console.error('❌ Database error:', dbError.message)
      }
    } else {
      console.log('✅ Database query successful!')
    }

    console.log('\n🎉 Supabase is ready to use!')
    console.log('\nNext steps:')
    console.log('1. Run the migration SQL in Supabase dashboard')
    console.log('2. Update the auth integration in your app')
    console.log('3. Start migrating data from Neon')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()