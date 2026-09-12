import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vegfyjfvvuhijqzqtxns.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8ZCuKqtofVJcFOUzg7DS3A_fvVS9ItA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
