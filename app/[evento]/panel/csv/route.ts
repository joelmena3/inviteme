import { db } from "@/lib/supabase";

// Descarga de respuestas en CSV (abre directo en Excel).
export const dynamic = "force-dynamic";

const celda = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request, { params }: { params: Promise<{ evento: string }> }) {
  const { evento } = await params;
  const key = new URL(req.url).searchParams.get("key") || "";
  const sb = db();
  const { data: ev } = await sb.from("eventos").select("id, slug, admin_key").eq("slug", evento).maybeSingle();
  if (!ev || !key || ev.admin_key !== key) return new Response("No encontrado", { status: 404 });

  const [{ data: invs }, { data: confs }] = await Promise.all([
    sb.from("invitados").select("id, nombre, pases, codigo").eq("evento_id", ev.id).order("nombre"),
    sb.from("confirmaciones").select("invitado_id, nombre, asiste, personas, mensaje, creado").eq("evento_id", ev.id).order("creado", { ascending: false }),
  ]);

  const ultima = new Map<string, NonNullable<typeof confs>[number]>();
  const generales: NonNullable<typeof confs> = [];
  for (const c of confs || []) {
    if (c.invitado_id) { if (!ultima.has(c.invitado_id)) ultima.set(c.invitado_id, c); }
    else generales.push(c);
  }
  const fecha = (iso: string) =>
    new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short", timeZone: "America/Mexico_City" }).format(new Date(iso));

  const filas = [["Invitado", "Pases", "Respuesta", "Personas", "Mensaje", "Fecha", "Link"]];
  for (const i of invs || []) {
    const r = ultima.get(i.id);
    filas.push([i.nombre, i.pases == null ? "Ilimitados" : String(i.pases), !r ? "Sin responder" : r.asiste ? "Asiste" : "No va", r?.asiste ? String(r.personas) : "", r?.mensaje || "", r ? fecha(r.creado) : "", `/${ev.slug}/${i.codigo}`]);
  }
  for (const g of generales) {
    filas.push([`${g.nombre} (link general)`, "", g.asiste ? "Asiste" : "No va", g.asiste ? String(g.personas) : "", g.mensaje || "", fecha(g.creado), `/${ev.slug}`]);
  }
  const csv = "﻿" + filas.map((f) => f.map(celda).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitados-${ev.slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
