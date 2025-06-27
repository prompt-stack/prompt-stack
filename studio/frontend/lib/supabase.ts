import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance - undefined means not checked yet, null means not configured
let supabaseInstance: SupabaseClient | null | undefined = undefined;

/**
 * Create a Supabase client for client-side usage
 * 
 * This function returns a singleton Supabase client instance configured
 * with the environment variables. It returns null if Supabase
 * is not configured (demo mode).
 */
export function createClient() {
  // Return existing instance if already created
  if (supabaseInstance !== undefined) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Creating Supabase client with:', { 
    url: supabaseUrl?.substring(0, 30) + '...', 
    hasKey: !!supabaseAnonKey 
  });
  
  // Return null if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://example.supabase.co') {
    console.warn('Supabase not configured - running in demo mode');
    supabaseInstance = null;
    return null;
  }
  
  // Create and store singleton instance
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
  
  console.log('Supabase client created successfully');
  
  // Test the connection
  if (typeof window !== 'undefined') {
    fetch(`${supabaseUrl}/auth/v1/health`, { method: 'GET' })
      .then(res => console.log('Supabase health check:', res.status))
      .catch(err => console.error('Supabase health check failed:', err));
  }
  
  return supabaseInstance;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://example.supabase.co'
  );
}