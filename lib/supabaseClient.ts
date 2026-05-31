import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

let client: SupabaseClient<Database> | null = null;

function createSupabaseBrowserClient(): SupabaseClient<Database> {
  const { url, anonKey } = readSupabasePublicEnv();
  return createClient<Database>(url, anonKey);
}

/** Browser-side Supabase client (singleton). */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!client) {
    client = createSupabaseBrowserClient();
  }
  return client;
}
