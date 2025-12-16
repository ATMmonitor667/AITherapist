import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return supabase;
}

// For backwards compatibility
export { supabase };

