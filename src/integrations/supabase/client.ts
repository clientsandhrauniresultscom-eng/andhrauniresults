import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const SUPABASE_URL = "https://sbpwgzxbzdherkhzxbmd.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicHdnenhiemRoZXJraHp4Ym1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzY1NzIsImV4cCI6MjA5MTA1MjU3Mn0.hTWGzpGsIc93GuOvyi4ftdWbaN5ECkef7FYH4m4UYik";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});