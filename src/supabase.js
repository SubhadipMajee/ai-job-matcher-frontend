import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://tomgjnghpxueobigrdfv.supabase.co";
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_f6FJBMV87O8Qqerw0VeWcg_1mHJrnkA";
export const isSupabaseConfigured = Boolean(rawKey && rawKey.trim().length > 0);

const supabaseAnonKey = rawKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
