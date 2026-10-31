import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Diagnóstico de la conexión con Supabase. Nunca muestra las llaves,
// solo si existen y de qué tipo son.
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const tipo = !key ? "falta"
    : key.startsWith("sb_secret_") ? "secret (correcta)"
    : key.startsWith("sb_publishable_") ? "publishable (incorrecta: usa la secret)"
    : key.startsWith("eyJ") ? "JWT legacy (anon o service_role)"
    : "formato desconocido";

  const r: Record<string, unknown> = {
    SUPABASE_URL: url ? (/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url) ? url : `formato raro: ${url.slice(0, 60)}`) : "falta",
    SUPABASE_SECRET_KEY: tipo,
  };
  if (!url || !key) {
    r.diagnostico = "Faltan variables en Vercel. Agrégalas en Settings → Environment Variables y luego haz Redeploy.";
    return NextResponse.json(r);
  }
  try {
    const sb = createClient(url.replace(/\/$/, ""), key, { auth: { persistSession: false } });
    const { data, error } = await sb.from("eventos").select("slug").limit(5);
    if (error) {
      r.error_supabase = `${error.code || ""} ${error.message}`.trim();
      r.diagnostico = /does not exist|schema cache/i.test(error.message)
        ? "Las tablas no existen: corre 01_tablas.sql y 02_evento_majo.sql en el SQL Editor."
        : /api key|jwt|unauthorized|forbidden/i.test(error.message)
        ? "La llave no es válida para este proyecto. Copia de nuevo la secret key."
        : "Error al consultar la base de datos.";
    } else {
      r.eventos = (data || []).map((e) => e.slug);
      r.diagnostico = (data || []).length
        ? "Conexión correcta."
        : "Conecta bien pero no hay eventos (o la llave es publishable). Corre 02_evento_majo.sql y revisa que uses la secret key.";
    }
  } catch (e) {
    r.error_red = String(e instanceof Error ? e.message : e).slice(0, 200);
    r.diagnostico = "No se pudo llegar a Supabase. Revisa que SUPABASE_URL sea https://ktkjrykryfmmnpkkiggt.supabase.co";
  }
  return NextResponse.json(r);
}
