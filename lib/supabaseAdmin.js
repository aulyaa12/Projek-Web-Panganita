import { createClient } from "@supabase/supabase-js";

// HANYA dipakai di server (route handler). Jangan pernah diimpor dari komponen
// client, dan jangan beri awalan NEXT_PUBLIC_ pada service role key.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
