import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

// Recibe una confirmación de asistencia desde la invitación.
export async function POST(req: Request) {
  let b: { evento?: string; invitado?: string; asiste?: boolean; personas?: number; mensaje?: string; nombre?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const evento = String(b.evento || "").trim();
  const codigo = String(b.invitado || "").trim().toLowerCase();
  const asiste = b.asiste === true;
  const personas = asiste ? Math.floor(Number(b.personas)) : 0;
  const mensaje = String(b.mensaje || "").trim().slice(0, 280) || null;
  const nombreLibre = String(b.nombre || "").trim().slice(0, 80);

  if (!evento) return NextResponse.json({ error: "Falta el evento." }, { status: 400 });
  if (asiste && (!Number.isFinite(personas) || personas < 1 || personas > 30)) {
    return NextResponse.json({ error: "Elige cuántas personas asistirán." }, { status: 400 });
  }

  const sb = db();
  const { data: ev } = await sb.from("eventos").select("id, fecha").eq("slug", evento).maybeSingle();
  if (!ev) return NextResponse.json({ error: "No encontramos este evento." }, { status: 404 });

  let invitadoId: string | null = null;
  let nombre = nombreLibre;
  if (codigo) {
    const { data: inv } = await sb
      .from("invitados")
      .select("id, nombre, pases")
      .eq("evento_id", ev.id)
      .eq("codigo", codigo)
      .maybeSingle();
    if (!inv) return NextResponse.json({ error: "Este link de invitado no es válido." }, { status: 404 });
    if (asiste && inv.pases != null && personas > inv.pases) {
      return NextResponse.json({ error: `Tu invitación es para ${inv.pases} personas como máximo.` }, { status: 400 });
    }
    invitadoId = inv.id;
    nombre = inv.nombre;
  } else if (!nombre) {
    return NextResponse.json({ error: "Escribe tu nombre para saber quién confirma." }, { status: 400 });
  }

  const { error } = await sb.from("confirmaciones").insert({
    evento_id: ev.id,
    invitado_id: invitadoId,
    nombre,
    asiste,
    personas,
    mensaje,
  });
  if (error) return NextResponse.json({ error: "No se pudo guardar tu confirmación." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
