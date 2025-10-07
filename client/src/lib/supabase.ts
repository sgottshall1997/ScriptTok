import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `
    ⚠️ SUPABASE CONFIGURATION ERROR ⚠️
    
    Missing required environment variables:
    ${!supabaseUrl ? '❌ VITE_SUPABASE_URL is not set' : '✅ VITE_SUPABASE_URL is set'}
    ${!supabaseAnonKey ? '❌ VITE_SUPABASE_ANON_KEY is not set' : '✅ VITE_SUPABASE_ANON_KEY is set'}
    
    IMPORTANT: Vite environment variables are embedded at BUILD time.
    If you just added these variables:
    1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Railway
    2. Trigger a NEW DEPLOYMENT to rebuild with the variables
    3. The variables will be embedded in the next build
  `;
  
  console.error(errorMsg);
  throw new Error('Supabase environment variables are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and redeploy.');
}

console.log('✅ Supabase client initialized successfully');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
