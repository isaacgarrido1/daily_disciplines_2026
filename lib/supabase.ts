import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Supabase URL or anon key is missing in environment variables.");
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false
  }
});

