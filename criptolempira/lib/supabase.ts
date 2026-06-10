import { createClient } from "@supabase/supabase-js";

// La llave publishable es segura de exponer en el cliente: RLS controla el acceso.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://nqtulxfwbnejuovambal.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_kJ7O0jjrAp4lex3XfufOiw_SMOxcAwC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
