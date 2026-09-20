import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[BharatQuest] Supabase environment variables are not configured.\n' +
    'Copy .env.example → .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'Authentication will not work until these are set.'
  );
}

/**
 * Single shared Supabase client for BharatQuest.
 * Used for all auth operations throughout the application.
 * Never expose the service_role key in this file.
 */
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
