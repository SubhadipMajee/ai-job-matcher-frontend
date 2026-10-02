import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://tomgjnghpxueobigrdfv.supabase.co";
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(rawKey && rawKey.trim().length > 0);

const supabaseAnonKey = isSupabaseConfigured ? rawKey : "placeholder-key-to-prevent-startup-crash";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
