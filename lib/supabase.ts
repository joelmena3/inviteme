import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de servidor: usa la llave secreta, que solo existe en Vercel
// (nunca llega al navegador). Las tablas tienen RLS activado y sin políticas
// públicas, así que solo este código puede leer y escribir.
let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  // Supabase llama a esta llave "secret key" (sb_secret_…) en proyectos nuevos
  // y "service_role" en los anteriores; aceptamos cualquiera de los dos nombres.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan las variables SUPABASE_URL y SUPABASE_SECRET_KEY en Vercel.");
  }
  client = createClient(url.trim().replace(/\/$/, ""), key.trim(), { auth: { persistSession: false } });
  return client;
}
