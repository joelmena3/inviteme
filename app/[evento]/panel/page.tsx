import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { agregarInvitado, editarInvitado, eliminarInvitado, eliminarRespuesta, reiniciarRespuesta } from "./acciones";
import { Confirmar, Copiar, Enviar } from "./botones";

// Panel privado del festejado: invitados, links, respuestas y mensajes.
// Se abre con /[evento]/panel?key=<clave del evento>.
export const dynamic = "force-dynamic";
export const metadata = { title: "Panel de invitados", robots: { index: false, follow: false } };

type P = { params: Promise<{ evento: string }>; searchParams: Promise<{ key?: string; msg?: string }> };
type Inv = { id: string; codigo: string; nombre: string; pases: number | null };
type Conf = { id: string; invitado_id: string | null; nombre: string; asiste: boolean; personas: number; mensaje: string | null; creado: string };

const fechaCorta = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" }).format(new Date(iso));

const opcionesPases = (sel: number | null) => (
  <>
    <option value="ilimitados">Ilimitados</option>
    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
      <option key={n} value={n}>{n} {n === 1 ? "pase" : "pases"}</option>
    ))}
    {sel != null && sel > 20 && <option value={sel}>{sel} pases</option>}
  </>
);

export default async function Panel({ params, searchParams }: P) {
  const { evento } = await params;
  const { key, msg } = await searchParams;
  const sb = db();
  const { data: ev } = await sb.from("eventos").select("id, slug, nombre, admin_key, contenido").eq("slug", evento).maybeSingle();
  if (!ev || !key || key !== ev.admin_key) notFound();

  const [{ data: invs }, { data: confs }] = await Promise.all([
    sb.from("invitados").select("id, codigo, nombre, pases").eq("evento_id", ev.id).order("nombre"),
    sb.from("confirmaciones").select("id, invitado_id, nombre, asiste, personas, mensaje, creado").eq("evento_id", ev.id).order("creado", { ascending: false }),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = `${proto}://${host}/${ev.slug}`;
  const panelCsv = `/${ev.slug}/panel/csv?key=${encodeURIComponent(key)}`;

  const lista = (invs || []) as Inv[];
  const nombrePorId = new Map(lista.map((i) => [i.id, i.nombre]));

  // Respuesta vigente: la más reciente de cada invitado + todas las del link general
  const ultima = new Map<string, Conf>();
  const vigentes: Conf[] = [];
  for (const c of (confs || []) as Conf[]) {
    if (c.invitado_id) {
      if (!ultima.has(c.invitado_id)) { ultima.set(c.invitado_id, c); vigentes.push(c); }
    } else vigentes.push(c);
  }
  const personas = vigentes.filter((r) => r.asiste).reduce((s, r) => s + r.personas, 0);
  const familiasSi = vigentes.filter((r) => r.asiste).length;
  const noVan = vigentes.filter((r) => !r.asiste).length;
  const pendientes = lista.filter((i) => !ultima.has(i.id)).length;
  const mensajes = vigentes.filter((r) => r.mensaje);

  const kicker = (ev.contenido as { kicker?: string })?.kicker || "Invitación";
  const textoWa = (inv: Inv) =>
    `¡Hola ${inv.nombre}! Te compartimos la invitación de ${ev.nombre} (${kicker.toLowerCase()}). Ábrela aquí y confírmanos tu asistencia:\n\n${base}/${inv.codigo}\n\n¡Te esperamos!`;

  const ocultos = (
    <>
      <input type="hidden" name="evento" value={ev.slug} />
      <input type="hidden" name="key" value={key} />
    </>
  );

  return (
    <div className="pnl">
      <link rel="stylesheet" href="/motor/panel.css" />
      <main className="pnl-wrap">
        <header className="pnl-head">
          <p className="eyebrow">Panel de invitados</p>
          <h1>{ev.nombre} · {kicker}</h1>
          <p className="soft">Recarga la página para ver confirmaciones nuevas. No compartas este link: solo es para ti.</p>
        </header>

        {msg && <p className="flash" role="status">{msg}</p>}

        <section className="tiles" aria-label="Resumen">
          <div className="tile"><span className="lbl">Personas que van</span><b className="n ok">{personas}</b><small>{familiasSi} {familiasSi === 1 ? "respuesta" : "respuestas"}</small></div>
          <div className="tile"><span className="lbl">Sin responder</span><b className="n warn">{pendientes}</b><small>de {lista.length} invitados</small></div>
          <div className="tile"><span className="lbl">No podrán ir</span><b className="n no">{noVan}</b><small>{noVan === 1 ? "respuesta" : "respuestas"}</small></div>
        </section>

        {/* ---------- Agregar invitado ---------- */}
        <section className="card" id="agregar">
          <h2>Agregar invitado</h2>
          <form action={agregarInvitado} className="add">
            {ocultos}
            <div className="field grow">
              <label htmlFor="nuevo-nombre">Nombre como aparecerá en su invitación</label>
              <input id="nuevo-nombre" name="nombre" required maxLength={80} placeholder="Ej. Tío Beto y familia" />
            </div>
            <div className="field">
              <label htmlFor="nuevo-pases">Pases</label>
              <select id="nuevo-pases" name="pases" defaultValue="ilimitados">{opcionesPases(null)}</select>
            </div>
            <Enviar ocupado="Agregando…">Agregar</Enviar>
          </form>
          <p className="soft sm">Su link se crea solo a partir del nombre (sin acentos ni espacios).</p>
        </section>

        {/* ---------- Invitados ---------- */}
        <section className="card flush" aria-labelledby="h-inv">
          <div className="card-head"><h2 id="h-inv">Invitados ({lista.length})</h2></div>
          {lista.length === 0 && <p className="empty">Todavía no hay invitados. Agrega el primero arriba.</p>}
          {lista.map((inv) => {
            const r = ultima.get(inv.id);
            const estado = !r
              ? { t: "Sin responder", c: "chip warn" }
              : r.asiste
              ? { t: `Asiste · ${r.personas} ${r.personas === 1 ? "persona" : "personas"}`, c: "chip ok" }
              : { t: "No podrá ir", c: "chip no" };
            const link = `${base}/${inv.codigo}`;
            return (
              <article key={inv.id} className="inv" id={`inv-${inv.codigo}`}>
                <div className="inv-top">
                  <div className="inv-name">
                    <strong>{inv.nombre}</strong>
                    <span className="soft">{inv.pases == null ? "Pases ilimitados" : `${inv.pases} ${inv.pases === 1 ? "pase" : "pases"}`}</span>
                  </div>
                  <span className={estado.c}>{estado.t}</span>
                </div>
                {r?.mensaje && <p className="inv-msg">“{r.mensaje}”</p>}
                <code className="link">{link}</code>
                <div className="row">
                  <a className="btn wa" href={`https://wa.me/?text=${encodeURIComponent(textoWa(inv))}`} target="_blank" rel="noopener">Enviar por WhatsApp</a>
                  <Copiar texto={link} />
                </div>
                <details className="more">
                  <summary>Editar, reiniciar o eliminar</summary>
                  <form action={editarInvitado} className="edit">
                    {ocultos}
                    <input type="hidden" name="id" value={inv.id} />
                    <div className="field grow">
                      <label htmlFor={`n-${inv.id}`}>Nombre</label>
                      <input id={`n-${inv.id}`} name="nombre" defaultValue={inv.nombre} required maxLength={80} />
                    </div>
                    <div className="field">
                      <label htmlFor={`p-${inv.id}`}>Pases</label>
                      <select id={`p-${inv.id}`} name="pases" defaultValue={inv.pases == null ? "ilimitados" : String(inv.pases)}>{opcionesPases(inv.pases)}</select>
                    </div>
                    <Enviar className="btn">Guardar</Enviar>
                  </form>
                  <div className="row danger-zone">
                    {r && (
                      <form action={reiniciarRespuesta}>
                        {ocultos}
                        <input type="hidden" name="id" value={inv.id} />
                        <input type="hidden" name="nombre" value={inv.nombre} />
                        <Confirmar className="btn ghost" pregunta="¿Borrar su respuesta para que confirme de nuevo?">Reiniciar respuesta</Confirmar>
                      </form>
                    )}
                    <form action={eliminarInvitado}>
                      {ocultos}
                      <input type="hidden" name="id" value={inv.id} />
                      <input type="hidden" name="nombre" value={inv.nombre} />
                      <Confirmar pregunta={`¿Eliminar a ${inv.nombre} y su respuesta? No se puede deshacer.`}>Eliminar invitado</Confirmar>
                    </form>
                  </div>
                  <p className="soft sm">Al cambiar el nombre, su link sigue siendo el mismo.</p>
                </details>
              </article>
            );
          })}
        </section>

        {/* ---------- Todas las respuestas ---------- */}
        <section className="card flush" id="respuestas" aria-labelledby="h-resp">
          <div className="card-head">
            <h2 id="h-resp">Todas las respuestas ({vigentes.length})</h2>
            {vigentes.length > 0 && <a className="btn ghost sm" href={panelCsv}>Descargar para Excel</a>}
          </div>
          {vigentes.length === 0 ? (
            <p className="empty">Aquí aparecerán las confirmaciones con sus mensajes en cuanto alguien responda.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Invitado</th><th>Respuesta</th><th className="num">Personas</th><th>Mensaje</th><th>Fecha</th><th><span className="sr">Acciones</span></th></tr>
                </thead>
                <tbody>
                  {vigentes.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.invitado_id ? nombrePorId.get(c.invitado_id) || c.nombre : c.nombre}</strong>
                        {!c.invitado_id && <span className="tag">link general</span>}
                      </td>
                      <td><span className={c.asiste ? "chip ok" : "chip no"}>{c.asiste ? "Asiste" : "No va"}</span></td>
                      <td className="num">{c.asiste ? c.personas : "—"}</td>
                      <td className="msg">{c.mensaje || <span className="soft">—</span>}</td>
                      <td className="nowrap soft">{fechaCorta(c.creado)}</td>
                      <td>
                        <form action={c.invitado_id ? reiniciarRespuesta : eliminarRespuesta}>
                          {ocultos}
                          <input type="hidden" name="id" value={c.invitado_id || c.id} />
                          <input type="hidden" name="nombre" value={c.nombre} />
                          <Confirmar className="btn ghost sm" pregunta="¿Borrar esta respuesta?">{c.invitado_id ? "Reiniciar" : "Eliminar"}</Confirmar>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={2}><strong>Total que asiste</strong></td><td className="num"><strong>{personas}</strong></td><td colSpan={3}></td></tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {mensajes.length > 0 && (
          <section className="card">
            <h2>Mensajes para {ev.nombre} ({mensajes.length})</h2>
            <div className="msgs">
              {mensajes.map((m) => (
                <blockquote key={m.id}>
                  <p>{m.mensaje}</p>
                  <small>{m.invitado_id ? nombrePorId.get(m.invitado_id) || m.nombre : m.nombre}</small>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        <section className="card">
          <h2>Link general</h2>
          <p className="soft sm">Para quien no está en la lista: le pide su nombre al confirmar y no tiene límite de pases.</p>
          <code className="link">{base}</code>
          <div className="row"><Copiar texto={base} /></div>
        </section>
      </main>
    </div>
  );
}
