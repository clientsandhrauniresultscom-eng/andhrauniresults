import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ilzfloclszaqiluqguep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
