const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('💡 Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

// Made with Bob
