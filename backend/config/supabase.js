const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Initialize Supabase client - Prefer service key for backend operations to bypass RLS checks
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in env');
  console.log('💡 Please add SUPABASE_URL and SUPABASE_SERVICE_KEY/SUPABASE_ANON_KEY to environment variables');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
}

module.exports = supabase;

// Made with Bob
