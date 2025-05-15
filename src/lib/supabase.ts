
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use environment variables from Supabase integration
const supabaseUrl = "https://rrcufwvcsnebllgjhtvi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY3Vmd3Zjc25lYmxsZ2podHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjI5MDIsImV4cCI6MjA2MjI5ODkwMn0.BNt9o3XDtSoki9Fd4F1g9NLdFjI9kfDheRwXf_UXqXw";

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;
