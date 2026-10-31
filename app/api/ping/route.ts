import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

// Consulta diaria (programada en vercel.json) para que el plan gratuito
// de Supabase no pause la base de datos por inactividad.
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await db().from("eventos").select("id").limit(1);
  return NextResponse.json({ ok: !error });
}
