import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import type { EventoAdmin, Pago } from "@/lib/tipos";
import { estadoPago, METODOS, nombreDe, PAQUETES, partesFecha, pesos, TIPOS } from "@/lib/util";
import { Confirmar, Copiar, Enviar } from "@/app/[evento]/panel/botones";
import { agregarInvitados, agregarPago, asignarLleva, eliminarInvitado, eliminarPago, guardarClavePanel, migrarArchivos } from "../../acciones";
import { Aviso, Barra } from "../../barra";
import { Editor } from "./editor";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> };
type Inv = { id: string; codigo: string; nombre: string; pases: number | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EventoAdminPage({ params, searchParams }: P) {
  await exigirAdmin();
  const { id } = await params;
  const { msg, error } = await searchParams;
  if (!UUID.test(id)) notFound();

  const sb = db();
  const [{ data: ev }, { data: pagos }, { data: invs }, { data: confs }] = await Promise.all([
    sb.from("eventos").select("*").eq("id", id).maybeSingle(),
    sb.from("pagos").select("id, monto, metodo, referencia, fecha, notas").eq("evento_id", id).order("fecha", { ascending: false }),
    sb.from("invitados").select("id, codigo, nombre, pases").eq("evento_id", id).order("nombre"),
    sb.from("confirmaciones").select("invitado_id, asiste, personas").eq("evento_id", id).order("creado", { ascending: false }),
  ]);
  if (!ev) notFound();
  const e = ev as EventoAdmin;

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "inviteme.mx";
  const base = `${h.get("x-forwarded-proto") || "https"}://${host}`;
  const conClave = !!e.panel_hash;
  const rutaPanel = conClave ? `/${e.slug}/panel` : `/${e.slug}/panel?key=${e.admin_key}`;
  const linkPanel = `${base}${rutaPanel}`;

  const listaPagos = (pagos || []) as Pago[];
  const pagado = listaPagos.reduce((s, p) => s + Number(p.monto), 0);
  const precio = Number(e.precio);
  const saldo = Math.max(precio - pagado, 0);
  const est = estadoPago(precio, pagado);
  const hoy = partesFecha(new Date().toISOString()).dia;

  const invitados = (invs || []) as Inv[];
  const respondio = new Map<string, { asiste: boolean; personas: number }>();
  for (const c of confs || []) if (c.invitado_id && !respondio.has(c.invitado_id)) respondio.set(c.invitado_id, c);
  const personas = [...respondio.values()].filter((r) => r.asiste).reduce((s, r) => s + r.personas, 0);

  const traer = e.contenido.traer;
  const asignaciones = traer?.asignaciones || {};
  const enGitHub = JSON.stringify(e.contenido).match(/"\/eventos\/[^"]+"/g)?.length || 0;
  const { dia, hora } = partesFecha(e.fecha);
  const oculto = <input type="hidden" name="id" value={e.id} />;

  return (
    <main className="adm-wrap">
      <Barra>
        <Link className="btn ghost sm" href="/admin">← Eventos</Link>
      </Barra>
      <Aviso msg={msg} error={error} />

      <div className="head-row">
        <div>
          <p className="eyebrow">{e.folio || "Sin folio"} · {nombreDe(TIPOS, e.tipo)}</p>
          <h1>{e.nombre}</h1>
          <p className="soft" style={{ margin: "4px 0 0" }}>
            <span className={`chip ${est.c}`}>{est.t}</span>{" "}
            {nombreDe(PAQUETES, e.paquete)}{precio > 0 && ` · pagado ${pesos(pagado)} de ${pesos(precio)}`}
          </p>
        </div>
        <div className="btns">
          <a className="btn ghost sm" href={`/${e.slug}`} target="_blank" rel="noopener">Ver invitación ↗</a>
          <a className="btn ghost sm" href={rutaPanel} target="_blank" rel="noopener">Panel del festejado ↗</a>
        </div>
      </div>

      <nav className="toc" aria-label="Secciones">
        <a href="#datos">Datos</a><a href="#diseno">Diseño</a><a href="#cliente">Cliente</a><a href="#textos">Textos</a><a href="#opcionales">Secciones</a>
        <a href="#archivos">Fotos</a><a href="#musica">Música</a><a href="#pagos">Pagos</a><a href="#invitados">Invitados</a><a href="#entrega">Entrega</a>
      </nav>

      {enGitHub > 0 && (
        <section className="card" style={{ background: "var(--gold-bg)" }}>
          <h2>Mover archivos a Supabase Storage</h2>
          <p className="sm" style={{ margin: 0 }}>
            Este evento todavía usa {enGitHub} {enGitHub === 1 ? "archivo guardado" : "archivos guardados"} en GitHub. Con un clic se copian a
            Supabase Storage y la invitación empieza a leerlos de ahí. Los invitados no notan nada.
          </p>
          <form action={migrarArchivos}>{oculto}<Enviar ocupado="Moviendo archivos… (tarda unos segundos)">Mover a Supabase Storage</Enviar></form>
        </section>
      )}

      <Editor
        id={e.id}
        host={host}
        inicial={{
          nombre: e.nombre,
          slug: e.slug,
          tipo: e.tipo,
          diseno: e.diseno,
          dia,
          hora,
          paquete: e.paquete,
          precio,
          cliente_nombre: e.cliente_nombre || "",
          cliente_whatsapp: e.cliente_whatsapp || "",
          notas: e.notas || "",
          contenido: e.contenido,
        }}
      />

      {/* ---------- Pagos ---------- */}
      <section className="card" id="pagos">
        <div className="card-head">
          <h2>Pagos · folio {e.folio}</h2>
          <span className={`chip ${est.c}`}>{est.t}</span>
        </div>
        <div className="tiles" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div className="tile"><span className="lbl">Precio</span><b className="n">{pesos(precio)}</b></div>
          <div className="tile"><span className="lbl">Pagado</span><b className="n">{pesos(pagado)}</b></div>
          <div className="tile"><span className="lbl">Saldo</span><b className="n">{pesos(saldo)}</b></div>
        </div>

        {listaPagos.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Fecha</th><th>Método</th><th>Referencia</th><th className="num">Monto</th><th aria-label="Acciones" /></tr></thead>
              <tbody>
                {listaPagos.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.fecha}</td>
                    <td>{nombreDe(METODOS, p.metodo)}{p.notas && <div className="soft sm">{p.notas}</div>}</td>
                    <td className="mono">{p.referencia || "—"}</td>
                    <td className="num">{pesos(Number(p.monto))}</td>
                    <td className="num">
                      <form action={eliminarPago}>{oculto}<input type="hidden" name="pago" value={p.id} />
                        <Confirmar pregunta="¿Borrar?" className="btn danger sm">Borrar</Confirmar>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form action={agregarPago} className="sub">
          {oculto}
          <h3>Registrar pago</h3>
          <div className="grid three">
            <div className="field">
              <label htmlFor="p-monto">Monto (MXN)</label>
              <input id="p-monto" name="monto" type="number" min="1" step="0.01" inputMode="decimal" required defaultValue={saldo || ""} />
            </div>
            <div className="field">
              <label htmlFor="p-metodo">Método</label>
              <select id="p-metodo" name="metodo" defaultValue="transferencia">
                {METODOS.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="p-fecha">Fecha</label>
              <input id="p-fecha" name="fecha" type="date" defaultValue={hoy} />
            </div>
            <div className="field">
              <label htmlFor="p-ref">No. de operación o clave de rastreo</label>
              <input id="p-ref" name="referencia" maxLength={80} placeholder="Ej. 1234567890" />
            </div>
            <div className="field span-2">
              <label htmlFor="p-notas">Nota</label>
              <input id="p-notas" name="notas" maxLength={200} placeholder="Ej. Anticipo 50%" />
            </div>
          </div>
          <div><Enviar ocupado="Registrando…">Registrar pago</Enviar></div>
        </form>
      </section>

      {/* ---------- Invitados ---------- */}
      <section className="card" id="invitados">
        <div className="card-head">
          <h2>Invitados ({invitados.length})</h2>
          <span className="soft sm">{respondio.size} respondieron · {personas} personas confirmadas</span>
        </div>

        <form action={agregarInvitados} className="field">
          {oculto}
          <label htmlFor="lista">
            Pega la lista: un invitado por renglón. Agrega una coma y el número de pases si quieres limitarlos
            {traer ? ", y otra coma con lo que le toca llevar." : "."}
          </label>
          <textarea id="lista" name="lista" placeholder={traer ? "Abuelita Lulú\nTía Ale y familia, 4, Postre\nPrimo Beto, , Refrescos" : "Abuelita Lulú\nTía Ale y familia, 4\nPrimo Beto, 2"} />
          <div><Enviar ocupado="Agregando…">Agregar invitados</Enviar></div>
        </form>

        {invitados.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Invitado</th><th>Pases</th>{traer && <th>Lleva</th>}<th>Respuesta</th><th aria-label="Acciones" /></tr></thead>
              <tbody>
                {invitados.map((i) => {
                  const r = respondio.get(i.id);
                  const link = `${base}/${e.slug}/${i.codigo}`;
                  return (
                    <tr key={i.id}>
                      <td><b>{i.nombre}</b><div className="inv-link">{link}</div></td>
                      <td className="mono">{i.pases ?? "∞"}</td>
                      {traer && (
                        <td>
                          <form action={asignarLleva} className="lleva-form">
                            {oculto}<input type="hidden" name="codigo" value={i.codigo} /><input type="hidden" name="nombre" value={i.nombre} />
                            <input name="lleva" defaultValue={asignaciones[i.codigo] || ""} maxLength={80} placeholder="Ej. Postre" aria-label={`Qué lleva ${i.nombre}`} />
                            <Enviar className="btn ghost sm" ocupado="…">OK</Enviar>
                          </form>
                        </td>
                      )}
                      <td>{!r ? <span className="chip warn">Sin responder</span> : r.asiste ? <span className="chip ok">Va · {r.personas}</span> : <span className="chip no">No va</span>}</td>
                      <td className="num">
                        <span className="btns" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                          <Copiar texto={link} />
                          <form action={eliminarInvitado}>{oculto}<input type="hidden" name="invitado" value={i.id} />
                            <Confirmar pregunta="¿Eliminar?" className="btn danger sm">×</Confirmar>
                          </form>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- Entrega al cliente ---------- */}
      <section className="card" id="entrega">
        <h2>Entrega al cliente</h2>
        <p className="soft sm" style={{ margin: 0 }}>
          Mándale a tu cliente el link general de la invitación y su panel privado. Desde el panel puede agregar invitados, ver quién confirmó y
          enviar cada link por WhatsApp.
        </p>
        <div className="field">
          <span className="lbl-row">Link general</span>
          <div className="btns"><code className="inv-link">{`${base}/${e.slug}`}</code><Copiar texto={`${base}/${e.slug}`} /></div>
        </div>
        <div className="field">
          <span className="lbl-row">Panel privado del festejado</span>
          <div className="btns"><code className="inv-link">{linkPanel}</code><Copiar texto={linkPanel} /></div>
        </div>

        <div className="sub">
          <h3>Contraseña del panel</h3>
          <p className="sm" style={{ margin: 0 }}>
            {conClave
              ? <><span className="chip ok">Protegido</span> Tu cliente necesita la contraseña para entrar. Por seguridad no se puede mostrar: si la olvida, ponle una nueva.</>
              : <><span className="chip warn">Sin contraseña</span> Cualquiera que tenga el link puede entrar al panel.</>}
          </p>
          <form action={guardarClavePanel} className="btns" style={{ justifyContent: "flex-start" }}>
            {oculto}
            <input name="clave" type="text" minLength={6} maxLength={60} required autoComplete="off" placeholder={conClave ? "Nueva contraseña" : "Mínimo 6 caracteres"} aria-label="Contraseña del panel" style={{ maxWidth: 260 }} />
            <Enviar ocupado="Guardando…">{conClave ? "Cambiar contraseña" : "Poner contraseña"}</Enviar>
          </form>
          {conClave && (
            <form action={guardarClavePanel}>
              {oculto}<input type="hidden" name="quitar" value="1" />
              <Confirmar pregunta="¿Quitar la contraseña?" className="btn danger sm">Quitar contraseña</Confirmar>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
