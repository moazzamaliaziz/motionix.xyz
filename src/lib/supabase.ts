import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (for "use client" components)
export function createBrowserSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or anon key not set");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client (for server components/actions - reads cookies)
export function createServerSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or anon key not set");
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method is called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

// Server-side admin client (uses service role key, bypasses RLS)
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or service role key not set");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Check if admin operations are available
export function isAdminConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}
