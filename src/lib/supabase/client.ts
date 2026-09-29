import { createClient, type SupabaseClient } from "@supabase/supabase-js";

//--------------|| Supabase Environment Variables ||--------------//
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

//--------------|| Configuration Check ||--------------//
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project"),
);

//--------------|| Initialize Supabase Client ||--------------//
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder",
);

//--------------|| Safe Client Getter ||--------------//
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  return supabase;
}

//--------------|| Alias Export for createClient ||--------------//
export { getSupabaseClient as createClient };
