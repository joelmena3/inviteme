import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";

// Panel privado del festejado: confirmaciones en vivo y links para mandar por WhatsApp.
// Se abre con /[evento]/panel?key=<clave del evento>.
export const dynamic = "force-dynamic";
export const metadata = { title: "Panel de invitados", robots: { index: false, follow: false } };

type P = { params: Promise<{ evento: string }>; searchParams: Promise<{ key?: string }> };

type Inv = { id: string; codigo: string; nombre: string; pases: number | null };
type Conf = { invitado_id: string | null; nombre: string; asiste: boolean; personas: number; mensaje: string | null; creado: string };

const C = { bg: "#F4F7EF", paper: "#FFFFFF", ink: "#31453A", soft: "#66796B", leaf: "#5C7D61", rose: "#CF7C90", line: "#DDE7D7", blush: "#F5D0D7", warn: "#B7791F" };

export default async function Panel({ params, searchParams }: P) {
  const { evento } = await params;
  const { key } = await searchParams;
  const sb = db();
  const { data: ev } = await sb.from("eventos").select("id, slug, nombre, admin_key, contenido").eq("slug", evento).maybeSingle();
  if (!ev || !key || key !== ev.admin_key) notFound();

  const [{ data: invs }, { data: confs }] = await Promise.all([
    sb.from("invitados").select("id, codigo, nombre, pases").eq("evento_id", ev.id).order("nombre"),
    sb.from("confirmaciones").select("invitado_id, nombre, asiste, personas, mensaje, creado").eq("evento_id", ev.id).order("creado", { ascending: false }),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = `${proto}://${host}/${ev.slug}`;

  // Última respuesta de cada invitado
  const ultima = new Map<string, Conf>();
  const sueltas: Conf[] = [];
  for (const c of (confs || []) as Conf[]) {
    if (c.invitado_id) { if (!ultima.has(c.invitado_id)) ultima.set(c.invitado_id, c); }
    else sueltas.push(c);
  }
  const lista = (invs || []) as Inv[];
  const respuestas = [...ultima.values(), ...sueltas];
  const personas = respuestas.filter((r) => r.asiste).reduce((s, r) => s + r.personas, 0);
  const noVan = respuestas.filter((r) => !r.asiste).length;
  const pendientes = lista.filter((i) => !ultima.has(i.id)).length;
  const mensajes = respuestas.filter((r) => r.mensaje);

  const kicker = (ev.contenido as { kicker?: string })?.kicker || "Invitación";
  const textoWa = (inv: Inv) =>
    `¡Hola ${inv.nombre}! Te compartimos la invitación de ${ev.nombre} (${kicker.toLowerCase()}). Ábrela aquí y confírmanos tu asistencia:\n\n${base}/${inv.codigo}\n\n¡Te esperamos!`;

  const card: React.CSSProperties = { background: C.paper, borderRadius: 18, boxShadow: `0 0 0 1px ${C.line}`, padding: "16px 14px", minWidth: 0 };
  const lbl: React.CSSProperties = { fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, color: C.soft };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ink, fontFamily: "Nunito, system-ui, sans-serif", paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 0 64px", display: "flex", flexDirection: "column", gap: 20 }}>
        <header>
          <p style={{ ...lbl, color: C.rose, margin: 0 }}>Panel de invitados</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "2.4rem", margin: "4px 0 0", lineHeight: 1.1 }}>{ev.nombre} · {kicker}</h1>
          <p style={{ margin: "6px 0 0", color: C.soft }}>Recarga la página para ver confirmaciones nuevas. No compartas este link: solo es para ti.</p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {[["Confirmados", personas, C.leaf], ["Sin responder", pendientes, C.warn], ["No van", noVan, C.rose]].map(([t, n, color]) => (
            <div key={t as string} style={card}>
              <div style={lbl}>{t}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2.4rem", fontWeight: 600, lineHeight: 1.1, color: color as string, fontVariantNumeric: "tabular-nums" }}>{n as number}</div>
            </div>
          ))}
        </section>

        <section style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.line}` }}>
            <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Invitados y links personales</h2>
          </div>
          {lista.map((inv) => {
            const r = ultima.get(inv.id);
            const estado = !r ? { t: "Sin responder", bg: "#FBF1DC", fg: C.warn } : r.asiste ? { t: `Asiste · ${r.personas} ${r.personas === 1 ? "persona" : "personas"}`, bg: "#E3EEDF", fg: C.leaf } : { t: "No podrá ir", bg: C.blush, fg: "#9A4A5D" };
            const link = `${base}/${inv.codigo}`;
            return (
              <div key={inv.id} style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: "1.05rem" }}>{inv.nombre}</strong>
                    <span style={{ color: C.soft, marginLeft: 8, fontSize: ".9rem" }}>{inv.pases == null ? "Pases ilimitados" : `${inv.pases} pases`}</span>
                  </div>
                  <span style={{ background: estado.bg, color: estado.fg, borderRadius: 999, padding: "4px 12px", fontWeight: 700, fontSize: ".85rem" }}>{estado.t}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <code style={{ fontSize: ".82rem", background: C.bg, padding: "6px 10px", borderRadius: 8, userSelect: "all", minWidth: 0, overflowWrap: "anywhere" }}>{link}</code>
                  <a href={`https://wa.me/?text=${encodeURIComponent(textoWa(inv))}`} target="_blank" rel="noopener" style={{ background: "#2E7D4F", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: ".85rem", padding: "7px 14px", borderRadius: 999 }}>Enviar por WhatsApp</a>
                </div>
              </div>
            );
          })}
          {sueltas.length > 0 && (
            <div style={{ padding: "14px 18px" }}>
              <div style={lbl}>Respuestas desde el link general</div>
              {sueltas.map((s, i) => (
                <p key={i} style={{ margin: "6px 0 0" }}><strong>{s.nombre}</strong>: {s.asiste ? `asiste (${s.personas})` : "no podrá ir"}</p>
              ))}
            </div>
          )}
        </section>

        {mensajes.length > 0 && (
          <section style={card}>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>Mensajes para {ev.nombre}</h2>
            {mensajes.map((m, i) => (
              <blockquote key={i} style={{ margin: "10px 0 0", padding: "8px 12px", borderLeft: `3px solid ${C.blush}` }}>
                <p style={{ margin: 0 }}>{m.mensaje}</p>
                <small style={{ color: C.soft }}>{m.nombre}</small>
              </blockquote>
            ))}
          </section>
        )}

        <p style={{ color: C.soft, fontSize: ".85rem", margin: 0 }}>Link general (sin pases asignados): <code style={{ userSelect: "all" }}>{base}</code></p>
      </main>
    </div>
  );
}
