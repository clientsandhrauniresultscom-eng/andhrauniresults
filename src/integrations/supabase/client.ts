import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const SUPABASE_URL = "https://sbpwgzxbzdherkhzxbmd.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicHdneHpiemhlcmtoenhtZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc1NzQ2ODI5LCJleHAiOjIwOTEzMjI4Mjl9.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});