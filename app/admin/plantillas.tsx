import Link from "next/link";
import { Copiar } from "@/app/[evento]/panel/botones";
import { CATALOGO, PLANTILLA_DEFAULT } from "@/plantillas/catalogo";

// Pestaña "Templates" del panel: lista los diseños registrados en plantillas/catalogo.ts,
// muestra en qué eventos se usa cada uno y una vista previa con datos de ejemplo.
// Crear, editar, ocultar o borrar se hace con Claude (skill "plantillas"); aquí solo se
// copian las instrucciones. Un template nuevo aparece aquí en cuanto Vercel publica main.

type EventoUso = { id: string; nombre: string; slug: string; fecha: string; diseno: string };

const REPO = "joelmena3/inviteme";

export function Plantillas({ eventos, elegido, datos }: { eventos: EventoUso[]; elegido?: string; datos?: string }) {
  const ahora = Date.now();
  const usos = (id: string) => eventos.filter((e) => e.diseno === id);
  const conocidos = new Set(CATALOGO.map((p) => p.id));
  const huerfanos = eventos.filter((e) => !conocidos.has(e.diseno));

  const actual =
    CATALOGO.find((p) => p.id === elegido) ||
    CATALOGO.find((p) => p.id === PLANTILLA_DEFAULT) ||
    CATALOGO[0];
  const minimo = datos === "minimo";
  const href = (id: string, d = datos) => `/admin?tab=plantillas&p=${id}${d === "minimo" ? "&datos=minimo" : ""}`;

  const visibles = CATALOGO.filter((p) => !p.oculto).length;
  const ocultos = CATALOGO.length - visibles;

  const enUso = usos(actual.id);
  const vivos = enUso.filter((e) => new Date(e.fecha).getTime() >= ahora - 12 * 3600e3);
  const esDefault = actual.id === PLANTILLA_DEFAULT;
  const vista = `/admin/plantillas/${actual.id}/vista${minimo ? "?datos=minimo" : ""}`;
  const nombreYId = `«${actual.nombre}» (carpeta plantillas/${actual.id})`;

  const pedidoNuevo =
    `Usa el skill plantillas en ${REPO}: crea un template nuevo llamado «[nombre]» para [tipo de evento]. ` +
    `Estilo: [colores, ambiente, dibujos]. Trabaja en una rama plantillas/…, pásame el link de vista previa ` +
    `y cuando te diga que está bien, súbelo a main para que aparezca en el panel.`;
  const pedidoEditar =
    `Usa el skill plantillas en ${REPO}: en el template ${nombreYId} cambia [describe el cambio]. ` +
    (enUso.length ? `Ojo: lo usan ${enUso.length} evento(s), así que el cambio también les llega. ` : "") +
    `Pásame la vista previa antes de subirlo a main.`;
  const pedidoOcultar =
    `Usa el skill plantillas en ${REPO}: oculta el template ${nombreYId} con oculto: true para que ya no se ofrezca ` +
    `en eventos nuevos. Las invitaciones que ya lo usan deben seguir igual. Súbelo a main.`;
  const pedidoMostrar =
    `Usa el skill plantillas en ${REPO}: vuelve a mostrar el template ${nombreYId} (quita oculto: true). Súbelo a main.`;
  const pedidoBorrar =
    `Usa el skill plantillas en ${REPO}: borra por completo el template ${nombreYId}. ` +
    `Ya revisé en el panel que ningún evento lo usa. Quita su carpeta y sus registros en catalogo.ts e index.ts, ` +
    `corre npm run validar y súbelo a main.`;

  return (
    <>
      <section className="tiles" aria-label="Resumen de templates">
        <div className="tile"><span className="lbl">Disponibles</span><b className="n">{visibles}</b><small>para eventos nuevos</small></div>
        <div className="tile"><span className="lbl">Ocultos</span><b className="n">{ocultos}</b><small>solo eventos viejos</small></div>
        <div className="tile"><span className="lbl">Sin usar</span><b className="n">{CATALOGO.filter((p) => !usos(p.id).length).length}</b><small>se pueden borrar</small></div>
        <div className="tile"><span className="lbl">Por defecto</span><b className="n tile-txt">{CATALOGO.find((p) => p.id === PLANTILLA_DEFAULT)?.nombre}</b><small>si algo falla</small></div>
      </section>

      {huerfanos.length > 0 && (
        <p className="notice">
          {huerfanos.length} evento(s) apuntan a un template que ya no existe y se están mostrando con el diseño por defecto:{" "}
          {huerfanos.map((e, i) => (
            <span key={e.id}>{i ? ", " : ""}<Link href={`/admin/evento/${e.id}`}>{e.nombre}</Link> ({e.diseno})</span>
          ))}
          .
        </p>
      )}

      <div className="tpl-layout">
        <section className="card flush" aria-labelledby="h-tpl">
          <div className="card-head">
            <h2 id="h-tpl">Templates ({CATALOGO.length})</h2>
          </div>
          <ul className="tpl-list">
            {CATALOGO.map((p) => {
              const n = usos(p.id).length;
              const on = p.id === actual.id;
              return (
                <li key={p.id}>
                  <Link href={href(p.id)} className={`tpl-item${on ? " on" : ""}${p.oculto ? " off" : ""}`} aria-current={on ? "true" : undefined}>
                    <span className="tpl-sw" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${p.muestra[0]} 0 50%, ${p.muestra[1]} 50% 100%)` }} />
                    <span className="tpl-txt">
                      <b>{p.nombre}</b>
                      <small>{p.descripcion}</small>
                      <span className="tpl-chips">
                        {p.id === PLANTILLA_DEFAULT && <span className="chip gold">Por defecto</span>}
                        {p.oculto && <span className="chip neutral">Oculto</span>}
                        <span className={`chip ${n ? "ok" : "no"}`}>{n ? `${n} evento${n === 1 ? "" : "s"}` : "Sin usar"}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="tpl-nuevo">
            <div className="tpl-row">
              <h3>¿Quieres uno nuevo?</h3>
              <Copiar texto={pedidoNuevo} etiqueta="Copiar pedido" />
            </div>
            <p className="soft sm">
              Pégalo en Claude (Claude Code con tu repo) y llena los corchetes. Cuando lo suba a <code>main</code> y Vercel lo publique,
              aparece solo en esta lista.
            </p>
          </div>
        </section>

        <div className="tpl-detalle">
          <section className="card" aria-labelledby="h-vista">
            <div className="card-head">
              <div>
                <p className="eyebrow">Vista previa</p>
                <h2 id="h-vista" className="tpl-title">
                  <span className="tpl-sw sm" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${actual.muestra[0]} 0 50%, ${actual.muestra[1]} 50% 100%)` }} />
                  {actual.nombre}
                </h2>
              </div>
              <div className="btns">
                <nav className="seg" aria-label="Datos de ejemplo">
                  <Link href={href(actual.id, "")} className={minimo ? "" : "on"}>Wow</Link>
                  <Link href={href(actual.id, "minimo")} className={minimo ? "on" : ""}>Express</Link>
                </nav>
                <a className="btn ghost sm" href={vista} target="_blank" rel="noopener">Abrir completa ↗</a>
              </div>
            </div>
            <div className="phone">
              <iframe key={vista} src={vista} title={`Vista previa del template ${actual.nombre}`} loading="lazy" />
            </div>
            <p className="soft sm" style={{ margin: 0, textAlign: "center" }}>
              Datos de ejemplo ({minimo ? "evento mínimo, tipo Express" : "evento completo, tipo Wow"}). Confirmar asistencia aquí no guarda nada.
            </p>
          </section>

          <section className="card" aria-labelledby="h-uso">
            <div className="card-head">
              <h2 id="h-uso">Dónde se usa</h2>
              <span className={`chip ${enUso.length ? "ok" : "no"}`}>{enUso.length ? `${enUso.length} evento${enUso.length === 1 ? "" : "s"}` : "Sin usar"}</span>
            </div>
            {enUso.length ? (
              <ul className="tpl-usos">
                {enUso.map((e) => (
                  <li key={e.id}>
                    <Link href={`/admin/evento/${e.id}`}>{e.nombre}</Link>
                    <span className="soft"> · /{e.slug}</span>
                    {vivos.includes(e) && <span className="chip warn">Próximo</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="soft sm" style={{ margin: 0 }}>Ningún evento usa este template.</p>
            )}
          </section>

          <section className="card" aria-labelledby="h-claude">
            <div className="card-head"><h2 id="h-claude">Con Claude</h2></div>
            <p className="soft sm" style={{ margin: 0 }}>
              Copia el pedido y pégalo en Claude Code con el repo <code>{REPO}</code>. Claude solo toca la carpeta de templates; los datos de tus eventos no se mueven.
            </p>

            {esDefault ? (
              <div className="tpl-accion">
                <div className="tpl-row"><h3>Quitar</h3><span className="chip gold">No disponible</span></div>
                <p className="soft sm">Es el template por defecto: no se puede ocultar ni borrar. Si quieres quitarlo, primero elige otro como predeterminado.</p>
              </div>
            ) : enUso.length ? (
              <div className="tpl-accion">
                <div className="tpl-row">
                  <h3>{actual.oculto ? "Volver a mostrar" : "Ocultar"}</h3>
                  <Copiar texto={actual.oculto ? pedidoMostrar : pedidoOcultar} etiqueta="Copiar pedido" />
                </div>
                <p className="soft sm">
                  No se puede borrar: {enUso.length} evento{enUso.length === 1 ? "" : "s"} lo usa{enUso.length === 1 ? "" : "n"}
                  {vivos.length ? ` (${vivos.length} próximo${vivos.length === 1 ? "" : "s"})` : ""}.{" "}
                  {actual.oculto
                    ? "Ya está oculto: no se ofrece en eventos nuevos y sus invitaciones siguen igual."
                    : "Ocúltalo para que ya no se ofrezca en eventos nuevos; sus invitaciones siguen igual."}
                </p>
              </div>
            ) : (
              <>
                <div className="tpl-accion">
                  <div className="tpl-row">
                    <h3>Borrar</h3>
                    <Copiar texto={pedidoBorrar} etiqueta="Copiar pedido" />
                  </div>
                  <p className="soft sm">Ningún evento lo usa, así que se puede borrar sin afectar a nadie.</p>
                </div>
                <div className="tpl-accion">
                  <div className="tpl-row">
                    <h3>{actual.oculto ? "Volver a mostrar" : "Solo ocultar"}</h3>
                    <Copiar texto={actual.oculto ? pedidoMostrar : pedidoOcultar} etiqueta="Copiar pedido" />
                  </div>
                  <p className="soft sm">{actual.oculto ? "Vuelve a ofrecerlo para eventos nuevos." : "Lo guardas por si lo quieres después, pero ya no se ofrece."}</p>
                </div>
              </>
            )}

            <div className="tpl-accion">
              <div className="tpl-row">
                <h3>Editar</h3>
                <Copiar texto={pedidoEditar} etiqueta="Copiar pedido" />
              </div>
              <p className="soft sm">
                Cambia los corchetes por lo que quieras ajustar.{enUso.length ? " El cambio también se verá en las invitaciones que ya lo usan." : ""}
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
