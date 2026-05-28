import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service-role klient — AINULT server-side (API route'id, skriptid).
// Möödub RLS-ist. Ära kunagi impordi seda klient-komponenti.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
