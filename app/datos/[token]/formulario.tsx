"use client";

import { useState } from "react";
import { subirFoto } from "@/lib/subidas";
import { guardarFormulario, permisoFoto, respaldoFoto, type DatosCliente } from "./acciones";

type Config = {
  esBoda: boolean;
  folio: string;
  maxFotos: number;
  invitadosActuales: number;
  yaEnviado: boolean;
  titulos: { padres?: string; padresNovia?: string; padresNovio?: string; padrinos?: string; ceremonia?: string };
};

const DRESSCODES = ["Formal", "Etiqueta rigurosa", "Cóctel", "Casual elegante", "Casual", "Todos de blanco", "Vaquero"];

// Botón para elegir fotos que muestra "Subiendo…"
function ElegirFotos({ multiple, children, onFotos }: { multiple?: boolean; children: React.ReactNode; onFotos: (f: File[]) => Promise<void> }) {
  const [ocupado, setOcupado] = useState(false);
  return (
    <label className={`drop tall${ocupado ? " busy" : ""}`}>
      {ocupado ? "Subiendo…" : children}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={ocupado}
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (!files.length) return;
          setOcupado(true);
          try { await onFotos(files); } finally { setOcupado(false); }
        }}
      />
    </label>
  );
}

export function Formulario({ token, ayuda, linkInvitacion, config, inicial }: { token: string; ayuda: string; linkInvitacion: string; config: Config; inicial: DatosCliente }) {
  const [d, setD] = useState<DatosCliente>(inicial);
  const [estado, setEstado] = useState<{ t: string; err?: boolean } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState<null | { agregados: number }>(null);
  const set = <K extends keyof DatosCliente>(k: K, v: DatosCliente[K]) => { setD((x) => ({ ...x, [k]: v })); setEstado(null); };
  const subir = (f: File) => subirFoto(f, () => permisoFoto(token), respaldoFoto, { token });
  const error = (e: unknown) => setEstado({ t: (e as Error).message, err: true });

  async function enviar() {
    if (!d.nombre.trim()) return setEstado({ t: config.esBoda ? "Escribe los nombres de los novios." : "Escribe el nombre del festejado.", err: true });
    if (!d.dia || !d.hora) return setEstado({ t: "Falta la fecha o la hora del evento.", err: true });
    if (!d.lugarNombre.trim() || !d.lugarDireccion.trim()) return setEstado({ t: "Falta el lugar o la dirección del evento.", err: true });
    setGuardando(true);
    setEstado({ t: "Guardando…" });
    const r = await guardarFormulario(token, d);
    setGuardando(false);
    if ("error" in r) return setEstado({ t: r.error, err: true });
    setD((x) => ({ ...x, invitados: "" }));
    setEstado(null);
    setListo({ agregados: r.agregados });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const clabeDigitos = (d.clabe?.clabe || "").replace(/\D/g, "").length;
  const familias = (["padres", "padresNovia", "padresNovio", "padrinos"] as const).filter((k) => d[k] !== undefined);
  let n = 0;
  const paso = () => ++n;

  return (
    <main className="adm-wrap" style={{ maxWidth: 720 }}>
      <header className="topbar">
        <span className="brand"><span className="seal" aria-hidden="true">iM</span><span><b>InviteMe</b><small>Datos de tu invitación</small></span></span>
        <a className="btn ghost sm" href={ayuda} target="_blank" rel="noopener">¿Dudas? WhatsApp</a>
      </header>

      {listo ? (
        <section className="card" style={{ textAlign: "center", alignItems: "center" }}>
          <p style={{ fontSize: "2.4rem", margin: 0 }} aria-hidden="true">💌</p>
          <h1>¡Listo, recibimos tus datos!</h1>
          <p className="soft" style={{ margin: 0, maxWidth: "42ch" }}>
            Ya estamos trabajando en tu invitación. Te avisamos por WhatsApp en cuanto esté lista.
            {listo.agregados > 0 && ` Agregamos ${listo.agregados} ${listo.agregados === 1 ? "invitado" : "invitados"} a tu lista.`}
          </p>
          <p className="soft sm" style={{ margin: 0 }}>Si se te olvidó algo, puedes volver a abrir este mismo link y corregirlo.</p>
          <div className="btns" style={{ justifyContent: "center" }}>
            <button type="button" className="btn ghost" onClick={() => setListo(null)}>Revisar mis datos</button>
          </div>
        </section>
      ) : (
        <>
          <div>
            <p className="eyebrow">{config.folio ? `Folio ${config.folio}` : "Tu invitación"}</p>
            <h1>Cuéntanos de tu evento 🎉</h1>
            <p className="soft" style={{ margin: "6px 0 0" }}>
              Los campos con * son necesarios. Lo demás llénalo si lo tienes; puedes guardar y volver a este link cuando quieras.{config.yaEnviado && " Ya nos habías mandado datos: aquí están para que los revises."}
            </p>
          </div>

          {/* ---------- El evento ---------- */}
          <section className="card">
            <h2>{paso()}. Tu evento</h2>
            <div className="grid">
              <div className="field span-all">
                <label htmlFor="f-nombre">{config.esBoda ? "Nombres de los novios" : "Nombre del festejado"} *</label>
                <input id="f-nombre" value={d.nombre} maxLength={80} placeholder={config.esBoda ? "Ana y Luis" : "Majo"} onChange={(e) => set("nombre", e.target.value)} />
                <small>Así aparecerá en grande en la invitación.</small>
              </div>
              <div className="field"><label htmlFor="f-dia">Fecha *</label><input id="f-dia" type="date" value={d.dia} onChange={(e) => set("dia", e.target.value)} /></div>
              <div className="field"><label htmlFor="f-hora">Hora *</label><input id="f-hora" type="time" value={d.hora} onChange={(e) => set("hora", e.target.value)} /></div>
              <div className="field"><label htmlFor="f-lugar">{d.ceremonia ? "Lugar de la recepción *" : "Lugar *"}</label><input id="f-lugar" value={d.lugarNombre} maxLength={120} placeholder="Jardín Los Olivos, Casa de la abuela…" onChange={(e) => set("lugarNombre", e.target.value)} /></div>
              <div className="field"><label htmlFor="f-dir">Dirección *</label><input id="f-dir" value={d.lugarDireccion} maxLength={200} placeholder="Calle, número, colonia, ciudad" onChange={(e) => set("lugarDireccion", e.target.value)} /></div>
            </div>
            {d.ceremonia && (
              <div className="sub">
                <h3>{config.titulos.ceremonia || "Ceremonia religiosa"}</h3>
                <div className="grid three">
                  <div className="field"><label htmlFor="f-cn">Lugar</label><input id="f-cn" value={d.ceremonia.nombre} maxLength={120} placeholder="Parroquia de San José" onChange={(e) => set("ceremonia", { ...d.ceremonia!, nombre: e.target.value })} /></div>
                  <div className="field"><label htmlFor="f-cd">Dirección</label><input id="f-cd" value={d.ceremonia.direccion} maxLength={200} onChange={(e) => set("ceremonia", { ...d.ceremonia!, direccion: e.target.value })} /></div>
                  <div className="field"><label htmlFor="f-ch">Hora</label><input id="f-ch" value={d.ceremonia.hora} maxLength={30} placeholder="5:00 pm" onChange={(e) => set("ceremonia", { ...d.ceremonia!, hora: e.target.value })} /></div>
                </div>
              </div>
            )}
          </section>

          {/* ---------- Fotos ---------- */}
          <section className="card">
            <h2>{paso()}. Fotos 📸</h2>
            <div className="field">
              <span className="lbl-row">Foto principal (portada)</span>
              <div className="media-row">
                {d.portada ? (
                  <div className="thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.portada.src} alt="Foto principal" />
                    <button type="button" className="x" aria-label="Quitar foto principal" onClick={() => set("portada", null)}>×</button>
                  </div>
                ) : null}
                <ElegirFotos onFotos={async ([f]) => { try { set("portada", await subir(f)); } catch (e) { error(e); } }}>
                  <span aria-hidden="true">＋</span>{d.portada ? "Cambiar" : "Subir foto"}
                </ElegirFotos>
              </div>
              <small>De preferencia vertical, con buena luz.</small>
            </div>

            {config.maxFotos > 0 && (
              <div className="sub">
                <h3>Más fotos ({d.fotos.length} de {config.maxFotos})</h3>
                <p className="soft sm" style={{ margin: 0 }}>Súbelas en el orden en que quieras que aparezcan. Si quieres, ponles un título y cuándo fue.</p>
                {d.fotos.map((f, i) => (
                  <div className="moment" key={f.src}>
                    <div className="media-row" style={{ flexWrap: "nowrap" }}>
                      <div className="thumb" style={{ width: 84 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.src} alt={`Foto ${i + 1}`} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                        <input value={f.titulo} maxLength={60} placeholder="Título (opcional)" aria-label={`Título de la foto ${i + 1}`}
                          onChange={(e) => set("fotos", d.fotos.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)))} />
                        <input value={f.cuando} maxLength={60} placeholder="Cuándo fue (opcional)" aria-label={`Cuándo fue la foto ${i + 1}`}
                          onChange={(e) => set("fotos", d.fotos.map((x, j) => (j === i ? { ...x, cuando: e.target.value } : x)))} />
                      </div>
                    </div>
                    <div className="btns" style={{ justifyContent: "flex-end" }}>
                      <button type="button" className="btn ghost icon sm" aria-label="Mover antes" disabled={i === 0} onClick={() => { const a = d.fotos.slice(); [a[i - 1], a[i]] = [a[i], a[i - 1]]; set("fotos", a); }}>↑</button>
                      <button type="button" className="btn ghost icon sm" aria-label="Mover después" disabled={i === d.fotos.length - 1} onClick={() => { const a = d.fotos.slice(); [a[i + 1], a[i]] = [a[i], a[i + 1]]; set("fotos", a); }}>↓</button>
                      <button type="button" className="btn danger sm" onClick={() => set("fotos", d.fotos.filter((_, j) => j !== i))}>Quitar</button>
                    </div>
                  </div>
                ))}
                {d.fotos.length < config.maxFotos && (
                  <div>
                    <ElegirFotos
                      multiple
                      onFotos={async (files) => {
                        try {
                          for (const f of files.slice(0, config.maxFotos - d.fotos.length)) {
                            const r = await subir(f);
                            setD((x) => ({ ...x, fotos: [...x.fotos, { ...r, titulo: "", cuando: "" }].slice(0, config.maxFotos) }));
                          }
                        } catch (e) { error(e); }
                      }}
                    >
                      <span aria-hidden="true">＋</span>Agregar fotos
                    </ElegirFotos>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ---------- Familias ---------- */}
          {familias.length > 0 && (
            <section className="card">
              <h2>{paso()}. Familia y padrinos 👨‍👩‍👧</h2>
              {familias.map((k) => (
                <div className="field" key={k}>
                  <label htmlFor={`f-${k}`}>{config.titulos[k]}</label>
                  <textarea id={`f-${k}`} value={d[k] || ""} maxLength={1200} style={{ minHeight: 70 }}
                    placeholder={k === "padrinos" ? "Uno por renglón. Ej.\nVelación: Pedro y Sofía\nAnillos: Luis y Carmen" : "Un nombre por renglón"}
                    onChange={(e) => set(k, e.target.value)} />
                </div>
              ))}
            </section>
          )}

          {/* ---------- Detalles ---------- */}
          {(d.dresscode || d.regalos || d.clabe || d.traer !== undefined) && (
            <section className="card">
              <h2>{paso()}. Detalles para tus invitados 🎁</h2>
              {d.dresscode && (
                <div className="grid">
                  <div className="field">
                    <label htmlFor="f-dc">Código de vestimenta</label>
                    <input id="f-dc" list="f-dcs" value={d.dresscode.titulo} maxLength={60} onChange={(e) => set("dresscode", { ...d.dresscode!, titulo: e.target.value })} />
                    <datalist id="f-dcs">{DRESSCODES.map((x) => <option key={x} value={x} />)}</datalist>
                  </div>
                  <div className="field"><label htmlFor="f-dcx">Algún detalle (opcional)</label><input id="f-dcx" value={d.dresscode.texto} maxLength={400} placeholder="Evita el color blanco" onChange={(e) => set("dresscode", { ...d.dresscode!, texto: e.target.value })} /></div>
                </div>
              )}
              {d.regalos && (
                <div className="sub">
                  <h3>Mesa de regalos</h3>
                  {d.regalos.map((t, i) => (
                    <div className="grid three" key={i}>
                      <div className="field"><label htmlFor={`f-tn-${i}`}>Tienda</label><input id={`f-tn-${i}`} list="f-tiendas" value={t.nombre} maxLength={60} placeholder="Liverpool" onChange={(e) => set("regalos", d.regalos!.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} /></div>
                      <div className="field"><label htmlFor={`f-tc-${i}`}>No. de evento</label><input id={`f-tc-${i}`} value={t.numero} maxLength={40} onChange={(e) => set("regalos", d.regalos!.map((x, j) => (j === i ? { ...x, numero: e.target.value } : x)))} /></div>
                      <div className="field"><label htmlFor={`f-tu-${i}`}>Link (opcional)</label><input id={`f-tu-${i}`} value={t.url} maxLength={400} placeholder="https://…" onChange={(e) => set("regalos", d.regalos!.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} /></div>
                    </div>
                  ))}
                  <datalist id="f-tiendas">{["Liverpool", "Palacio de Hierro", "Amazon", "Sears"].map((x) => <option key={x} value={x} />)}</datalist>
                  <div><button type="button" className="btn ghost sm" onClick={() => set("regalos", [...d.regalos!, { nombre: "", numero: "", url: "" }])}>+ Otra tienda</button></div>
                </div>
              )}
              {d.clabe && (
                <div className="sub">
                  <h3>Regalo en efectivo</h3>
                  <div className="grid">
                    <div className="field">
                      <label htmlFor="f-cb">CLABE (18 dígitos)</label>
                      <input id="f-cb" inputMode="numeric" value={d.clabe.clabe} maxLength={22} onChange={(e) => set("clabe", { ...d.clabe!, clabe: e.target.value.replace(/[^\d ]/g, "") })} />
                      <small className={clabeDigitos === 18 || clabeDigitos === 0 ? "" : "warn-txt"}>{clabeDigitos} de 18 dígitos</small>
                    </div>
                    <div className="field"><label htmlFor="f-cbb">Banco</label><input id="f-cbb" value={d.clabe.banco} maxLength={60} onChange={(e) => set("clabe", { ...d.clabe!, banco: e.target.value })} /></div>
                    <div className="field span-all"><label htmlFor="f-cbt">Titular de la cuenta</label><input id="f-cbt" value={d.clabe.titular} maxLength={80} onChange={(e) => set("clabe", { ...d.clabe!, titular: e.target.value })} /></div>
                  </div>
                </div>
              )}
              {d.traer !== undefined && (
                <div className="sub">
                  <div className="field">
                    <label htmlFor="f-tr">¿Qué le pides a tus invitados que lleven?</label>
                    <input id="f-tr" value={d.traer} maxLength={400} placeholder="Cada familia trae un platillo para compartir" onChange={(e) => set("traer", e.target.value)} />
                    <small>Si quieres pedirle algo distinto a cada invitado, escríbelo en tu lista con una coma: “Familia Pérez, 4” y avísanos en comentarios.</small>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ---------- Mensaje ---------- */}
          <section className="card">
            <h2>{paso()}. Mensaje para tus invitados 💬</h2>
            <div className="field">
              <label htmlFor="f-msg">Puedes dejar este o escribir el tuyo</label>
              <textarea id="f-msg" value={d.mensaje} maxLength={600} onChange={(e) => set("mensaje", e.target.value)} />
            </div>
          </section>

          {/* ---------- Invitados ---------- */}
          <section className="card">
            <h2>{paso()}. Lista de invitados 📋</h2>
            <div className="field">
              <label htmlFor="f-inv">Un invitado o familia por renglón. Si quieres limitar lugares, agrega una coma y el número.</label>
              <textarea id="f-inv" value={d.invitados} maxLength={20000} placeholder={"Abuelita Lulú\nFamilia Pérez, 4\nTío Beto, 2"} onChange={(e) => set("invitados", e.target.value)} />
              <small>
                {config.invitadosActuales > 0 ? `Ya tienes ${config.invitadosActuales} en tu lista; aquí solo agrega los nuevos. ` : ""}
                Cada invitado recibe su propio link para confirmar. También puedes armarla después desde tu panel.
              </small>
            </div>
          </section>

          {/* ---------- Música y comentarios ---------- */}
          <section className="card">
            <h2>{paso()}. Música y comentarios 🎵</h2>
            <div className="field">
              <label htmlFor="f-can">¿Qué canción te gustaría? (opcional)</label>
              <input id="f-can" value={d.cancion} maxLength={200} placeholder="Nombre y artista" onChange={(e) => set("cancion", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-com">¿Algo más que debamos saber?</label>
              <textarea id="f-com" value={d.comentarios} maxLength={1000} placeholder="Colores favoritos, temática, ideas…" onChange={(e) => set("comentarios", e.target.value)} />
            </div>
          </section>

          <div className="savebar" role="region" aria-label="Enviar datos">
            <span className={`state${estado?.err ? " err" : ""}`} role="status">{estado?.t || "Puedes guardar y volver después"}</span>
            <button type="button" className="btn sm" disabled={guardando} onClick={enviar}>{guardando ? "Guardando…" : "Guardar y enviar"}</button>
          </div>
          <p className="soft sm" style={{ textAlign: "center", margin: 0 }}>
            <a href={linkInvitacion} target="_blank" rel="noopener">Ver cómo va mi invitación ↗</a>
          </p>
        </>
      )}
    </main>
  );
}
