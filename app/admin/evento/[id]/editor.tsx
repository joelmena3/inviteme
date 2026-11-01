"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Contenido, Foto, Grupo } from "@/lib/tipos";
import { DISENOS, PAQUETES, TIPOS } from "@/lib/util";
import { guardarEvento, prepararSubida, subirArchivo, type DatosEditor } from "../../acciones";

type Momento = Contenido["linea"][number];
const LIMITE_RESPALDO = 4 * 1024 * 1024; // lo que acepta Vercel si la subida directa falla

// ---------- Subida de archivos ----------

// Reduce la foto a máx. 1600 px y la guarda como JPG: carga rápido en celular.
async function comprimir(file: File): Promise<{ blob: Blob; w: number; h: number }> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`No pude abrir "${file.name}". Usa fotos JPG o PNG (las HEIC del iPhone, compártelas primero como JPG).`);
  }
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * k);
  const h = Math.round(bmp.height * k);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  cv.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/jpeg", 0.84));
  if (!blob) throw new Error("No se pudo procesar la foto.");
  return { blob, w, h };
}

function mimeAudio(f: File): string {
  if (f.type && f.type !== "audio/x-m4a") return f.type;
  const ext = f.name.split(".").pop()?.toLowerCase();
  return ext === "mp3" ? "audio/mpeg" : ext === "m4a" ? "audio/mp4" : ext === "aac" ? "audio/aac" : ext === "ogg" ? "audio/ogg" : ext === "wav" ? "audio/wav" : f.type;
}

async function subir(eventoId: string, tipo: "fotos" | "musica", blob: Blob, mime: string): Promise<string> {
  const p = await prepararSubida(eventoId, tipo, mime);
  if ("error" in p) throw new Error(p.error);
  try {
    const r = await fetch(p.subir, { method: "PUT", headers: { "content-type": mime, "cache-control": "max-age=31536000" }, body: blob });
    if (r.ok) return p.publica;
  } catch {
    /* sin red o bloqueado: probamos por el servidor */
  }
  if (blob.size > LIMITE_RESPALDO) throw new Error("No se pudo subir el archivo. Revisa tu conexión e inténtalo de nuevo.");
  const fd = new FormData();
  fd.append("id", eventoId);
  fd.append("tipo", tipo);
  fd.append("archivo", new File([blob], `archivo.${mime.split("/")[1]}`, { type: mime }));
  const r2 = await subirArchivo(fd);
  if ("error" in r2) throw new Error(r2.error);
  return r2.publica;
}

async function subirFoto(eventoId: string, file: File): Promise<Foto> {
  const { blob, w, h } = await comprimir(file);
  return { src: await subir(eventoId, "fotos", blob, "image/jpeg"), w, h };
}

// Botón con selector de archivos que muestra "Subiendo…"
function Selector({
  children, accept, multiple, alto, onArchivos,
}: { children: React.ReactNode; accept: string; multiple?: boolean; alto?: boolean; onArchivos: (f: File[]) => Promise<void> }) {
  const [ocupado, setOcupado] = useState(false);
  return (
    <label className={`drop${alto ? " tall" : ""}${ocupado ? " busy" : ""}`}>
      {ocupado ? "Subiendo…" : children}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={ocupado}
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (!files.length) return;
          setOcupado(true);
          try {
            await onArchivos(files);
          } finally {
            setOcupado(false);
          }
        }}
      />
    </label>
  );
}

// Casilla que activa una sección opcional y muestra sus campos
function Opcional({
  titulo, desc, activo, onCambio, children,
}: { titulo: string; desc: string; activo: boolean; onCambio: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div className={`opt${activo ? " on" : ""}`}>
      <label className="opt-head">
        <input type="checkbox" checked={activo} onChange={(e) => onCambio(e.target.checked)} />
        <span><b>{titulo}</b><small>{desc}</small></span>
      </label>
      {activo && children && <div className="opt-body">{children}</div>}
    </div>
  );
}

const DRESSCODES = ["Formal", "Etiqueta rigurosa", "Cóctel", "Casual elegante", "Casual", "Todos de blanco", "Vaquero", "Pijama"];

// ---------- Editor ----------

export function Editor({ id, host, inicial }: { id: string; host: string; inicial: DatosEditor }) {
  const router = useRouter();
  const [d, setD] = useState<DatosEditor>(inicial);
  const [sucio, setSucio] = useState(false);
  const [estado, setEstado] = useState<{ t: string; err?: boolean } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const ultimoPaquete = useRef(inicial.paquete);

  useEffect(() => {
    const avisar = (e: BeforeUnloadEvent) => { if (sucio) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [sucio]);

  const cambia = (f: (x: DatosEditor) => DatosEditor) => { setD(f); setSucio(true); setEstado(null); };
  const campo = <K extends keyof DatosEditor>(k: K, v: DatosEditor[K]) => cambia((x) => ({ ...x, [k]: v }));
  const texto = <K extends keyof Contenido>(k: K, v: Contenido[K]) => cambia((x) => ({ ...x, contenido: { ...x.contenido, [k]: v } }));
  const c = d.contenido;
  const linea = c.linea || [];
  const musica = c.musica || [];
  const setLinea = (l: Momento[]) => texto("linea", l);
  const setMomento = (i: number, m: Partial<Momento>) => setLinea(linea.map((x, j) => (j === i ? { ...x, ...m } : x)));
  const mover = <T,>(arr: T[], i: number, paso: number) => {
    const j = i + paso;
    if (j < 0 || j >= arr.length) return arr;
    const n = arr.slice();
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  };
  const error = (e: unknown) => setEstado({ t: (e as Error).message || "Algo falló.", err: true });

  async function guardar() {
    setGuardando(true);
    setEstado({ t: "Guardando…" });
    const r = await guardarEvento(id, d);
    setGuardando(false);
    if ("error" in r) return setEstado({ t: r.error, err: true });
    setSucio(false);
    setEstado({ t: "Guardado. La invitación ya muestra los cambios." });
    router.refresh();
  }

  return (
    <>
      {/* ---------- Datos ---------- */}
      <section className="card" id="datos">
        <h2>Datos del evento</h2>
        <div className="grid">
          <div className="field">
            <label htmlFor="e-nombre">Nombre del festejado o pareja</label>
            <input id="e-nombre" value={d.nombre} maxLength={80} onChange={(e) => campo("nombre", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="e-tipo">Tipo de evento</label>
            <select id="e-tipo" value={d.tipo} onChange={(e) => campo("tipo", e.target.value)}>
              {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="field span-all">
            <label htmlFor="e-slug">Link de la invitación</label>
            <div className="prefix"><span>{host}/</span>
              <input id="e-slug" value={d.slug} maxLength={40} onChange={(e) => campo("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
            </div>
            <small>Si ya enviaste links a invitados, no lo cambies: los links viejos dejarían de funcionar.</small>
          </div>
          <div className="field">
            <label htmlFor="e-dia">Fecha{c.formulario?.fechaPendiente && <span className="chip warn" style={{ marginLeft: 6 }}>Por definir</span>}</label>
            <input id="e-dia" type="date" value={d.dia} onChange={(e) => campo("dia", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="e-hora">Hora</label>
            <input id="e-hora" type="time" value={d.hora} onChange={(e) => campo("hora", e.target.value)} />
          </div>
          {c.formulario?.fechaPendiente && (
            <p className="soft sm span-all" style={{ margin: 0 }}>La fecha, hora y lugar los captura tu cliente en su formulario. La fecha que ves es provisional.</p>
          )}
          <div className="field">
            <label htmlFor="e-lugar">Lugar</label>
            <input id="e-lugar" value={c.lugar?.nombre || ""} maxLength={120} onChange={(e) => texto("lugar", { ...c.lugar, nombre: e.target.value, busqueda: "" })} />
          </div>
          <div className="field">
            <label htmlFor="e-dir">Dirección</label>
            <input id="e-dir" value={c.lugar?.direccion || ""} maxLength={200} onChange={(e) => texto("lugar", { ...c.lugar, direccion: e.target.value, busqueda: "" })} />
          </div>
        </div>
      </section>

      {/* ---------- Diseño ---------- */}
      <section className="card" id="diseno">
        <h2>Diseño (template)</h2>
        <div className="picks" role="radiogroup" aria-label="Diseño">
          {DISENOS.map((x) => (
            <label key={x.id} className="pick">
              <input type="radio" name="e-diseno" checked={d.diseno === x.id} onChange={() => campo("diseno", x.id)} />
              <span className="sw" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${x.muestra[0]} 0 50%, ${x.muestra[1]} 50%)` }} />
              <span><b>{x.nombre}</b><small>{x.desc}</small></span>
            </label>
          ))}
        </div>
      </section>

      {/* ---------- Paquete y cliente ---------- */}
      <section className="card" id="cliente">
        <h2>Paquete y cliente</h2>
        <div className="grid">
          <div className="field">
            <label htmlFor="e-paquete">Paquete</label>
            <select
              id="e-paquete"
              value={d.paquete}
              onChange={(e) => {
                const nuevo = PAQUETES.find((p) => p.id === e.target.value)!;
                const anterior = PAQUETES.find((p) => p.id === ultimoPaquete.current);
                ultimoPaquete.current = nuevo.id;
                // Si el precio era el del paquete anterior, lo actualizamos solo.
                const precio = !d.precio || d.precio === anterior?.precio ? nuevo.precio : d.precio;
                cambia((x) => ({ ...x, paquete: nuevo.id, precio }));
              }}
            >
              {PAQUETES.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="e-precio">Precio cobrado (MXN)</label>
            <input id="e-precio" type="number" min="0" step="1" inputMode="numeric" value={d.precio} onChange={(e) => campo("precio", Number(e.target.value) || 0)} />
          </div>
          <div className="field">
            <label htmlFor="e-cli">Nombre del cliente</label>
            <input id="e-cli" value={d.cliente_nombre} maxLength={80} onChange={(e) => campo("cliente_nombre", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="e-wa">WhatsApp del cliente</label>
            <input id="e-wa" type="tel" value={d.cliente_whatsapp} maxLength={20} onChange={(e) => campo("cliente_whatsapp", e.target.value)} />
          </div>
          <div className="field span-all">
            <label htmlFor="e-notas">Notas internas</label>
            <textarea id="e-notas" value={d.notas} maxLength={500} style={{ minHeight: 60 }} onChange={(e) => campo("notas", e.target.value)} />
          </div>
        </div>
      </section>

      {/* ---------- Textos ---------- */}
      <section className="card" id="textos">
        <h2>Textos de la invitación</h2>
        <div className="grid">
          <div className="field">
            <label htmlFor="t-eyebrow">Frase pequeña arriba de la foto</label>
            <input id="t-eyebrow" value={c.eyebrow || ""} maxLength={80} onChange={(e) => texto("eyebrow", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="t-kicker">Frase sobre el nombre</label>
            <input id="t-kicker" value={c.kicker || ""} maxLength={60} onChange={(e) => texto("kicker", e.target.value)} />
          </div>
          <div className="field span-all">
            <label htmlFor="t-mensaje">Mensaje para los invitados</label>
            <textarea id="t-mensaje" value={c.mensaje || ""} maxLength={600} onChange={(e) => texto("mensaje", e.target.value)} />
          </div>
          <div className="field span-all">
            <label htmlFor="t-pie">Despedida (pie de la invitación)</label>
            <input id="t-pie" value={c.pie || ""} maxLength={160} onChange={(e) => texto("pie", e.target.value)} />
          </div>
        </div>
      </section>

      {/* ---------- Secciones opcionales ---------- */}
      <section className="card" id="opcionales">
        <div className="card-head">
          <h2>Secciones opcionales</h2>
          <span className="soft sm">Solo aparecen en la invitación las que actives</span>
        </div>

        {(c.padres || c.padresNovia || c.padresNovio || c.padrinos) && (
          <div className="field">
            <label htmlFor="o-famt">Título de la sección de familias</label>
            <input id="o-famt" value={c.familiasTitulo ?? ""} maxLength={80} placeholder="Con la bendición de" onChange={(e) => texto("familiasTitulo", e.target.value)} />
          </div>
        )}
        {([
          ["padres", "Padres", "Mis papás", "Los papás del festejado.", "Juan Pérez y Ana López"],
          ["padresNovia", "Padres de la novia", "Padres de la novia", "Para bodas.", "Roberto Díaz y Laura Gómez"],
          ["padresNovio", "Padres del novio", "Padres del novio", "Para bodas.", "Carlos Ruiz y Marta Sánchez"],
          ["padrinos", "Padrinos", "Padrinos", "Uno por renglón. Si escribes “Rol: nombres”, el rol se muestra aparte.", "Velación: Pedro y Sofía\nAnillos: Luis y Carmen\nLazo: Toño y Rosa"],
        ] as const).map(([k, titulo, def, desc, ejemplo]) => {
          const gr = c[k] as Grupo | undefined;
          return (
            <Opcional key={k} titulo={titulo} desc={desc} activo={!!gr} onCambio={(v) => texto(k, v ? { titulo: def, nombres: "" } : undefined)}>
              <div className="grid">
                <div className="field">
                  <label htmlFor={`o-${k}-t`}>Título</label>
                  <input id={`o-${k}-t`} value={gr?.titulo || ""} maxLength={60} onChange={(e) => texto(k, { ...gr!, titulo: e.target.value })} />
                </div>
                <div className="field span-all">
                  <label htmlFor={`o-${k}-n`}>Nombres (uno por renglón)</label>
                  <textarea id={`o-${k}-n`} value={gr?.nombres || ""} maxLength={1200} placeholder={ejemplo} style={{ minHeight: 70 }} onChange={(e) => texto(k, { ...gr!, nombres: e.target.value })} />
                </div>
              </div>
            </Opcional>
          );
        })}

        <Opcional
          titulo="Ceremonia religiosa"
          desc="Un segundo lugar con su mapa, además del lugar de la fiesta."
          activo={!!c.ceremonia}
          onCambio={(v) => texto("ceremonia", v ? { titulo: "Ceremonia religiosa", nombre: "", direccion: "", hora: "" } : undefined)}
        >
          <div className="grid">
            <div className="field"><label htmlFor="o-cer-t">Título</label><input id="o-cer-t" value={c.ceremonia?.titulo || ""} maxLength={60} onChange={(e) => texto("ceremonia", { ...c.ceremonia!, titulo: e.target.value })} /></div>
            <div className="field"><label htmlFor="o-cer-h">Hora</label><input id="o-cer-h" value={c.ceremonia?.hora || ""} maxLength={30} placeholder="5:00 pm" onChange={(e) => texto("ceremonia", { ...c.ceremonia!, hora: e.target.value })} /></div>
            <div className="field"><label htmlFor="o-cer-n">Lugar</label><input id="o-cer-n" value={c.ceremonia?.nombre || ""} maxLength={120} placeholder="Parroquia de San José" onChange={(e) => texto("ceremonia", { ...c.ceremonia!, nombre: e.target.value })} /></div>
            <div className="field"><label htmlFor="o-cer-d">Dirección</label><input id="o-cer-d" value={c.ceremonia?.direccion || ""} maxLength={200} onChange={(e) => texto("ceremonia", { ...c.ceremonia!, direccion: e.target.value })} /></div>
          </div>
        </Opcional>

        <Opcional
          titulo="Dress code"
          desc="Cómo deben vestir los invitados."
          activo={!!c.dresscode}
          onCambio={(v) => texto("dresscode", v ? { titulo: "Formal", texto: "" } : undefined)}
        >
          <div className="grid">
            <div className="field">
              <label htmlFor="o-dc-t">Código</label>
              <input id="o-dc-t" list="dresscodes" value={c.dresscode?.titulo || ""} maxLength={60} onChange={(e) => texto("dresscode", { ...c.dresscode!, titulo: e.target.value })} />
              <datalist id="dresscodes">{DRESSCODES.map((x) => <option key={x} value={x} />)}</datalist>
            </div>
            <div className="field"><label htmlFor="o-dc-x">Detalle (opcional)</label><input id="o-dc-x" value={c.dresscode?.texto || ""} maxLength={400} placeholder="Evita el color blanco" onChange={(e) => texto("dresscode", { ...c.dresscode!, texto: e.target.value })} /></div>
          </div>
        </Opcional>

        <Opcional
          titulo="Mesa de regalos"
          desc="Tiendas con su número de evento y link."
          activo={!!c.regalos}
          onCambio={(v) => texto("regalos", v ? { texto: "Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros:", tiendas: [{ nombre: "Liverpool", numero: "", url: "" }] } : undefined)}
        >
          <div className="field"><label htmlFor="o-mr-x">Mensaje</label><input id="o-mr-x" value={c.regalos?.texto || ""} maxLength={300} onChange={(e) => texto("regalos", { ...c.regalos!, texto: e.target.value })} /></div>
          {(c.regalos?.tiendas || []).map((t, i) => {
            const set = (cambio: Partial<typeof t>) => texto("regalos", { ...c.regalos!, tiendas: c.regalos!.tiendas.map((x, j) => (j === i ? { ...x, ...cambio } : x)) });
            return (
              <div className="grid three tienda" key={i}>
                <div className="field"><label htmlFor={`o-t-n-${i}`}>Tienda</label><input id={`o-t-n-${i}`} list="tiendas" value={t.nombre} maxLength={60} onChange={(e) => set({ nombre: e.target.value })} /></div>
                <div className="field"><label htmlFor={`o-t-c-${i}`}>No. de evento</label><input id={`o-t-c-${i}`} value={t.numero} maxLength={40} onChange={(e) => set({ numero: e.target.value })} /></div>
                <div className="field">
                  <label htmlFor={`o-t-u-${i}`}>Link (opcional)</label>
                  <div className="prefix-row">
                    <input id={`o-t-u-${i}`} value={t.url} maxLength={400} placeholder="https://…" onChange={(e) => set({ url: e.target.value })} />
                    <button type="button" className="btn danger icon sm" aria-label="Quitar tienda" onClick={() => texto("regalos", { ...c.regalos!, tiendas: c.regalos!.tiendas.filter((_, j) => j !== i) })}>×</button>
                  </div>
                </div>
              </div>
            );
          })}
          <datalist id="tiendas">{["Liverpool", "Palacio de Hierro", "Amazon", "Sears", "Costco"].map((x) => <option key={x} value={x} />)}</datalist>
          <div><button type="button" className="btn ghost sm" onClick={() => texto("regalos", { ...c.regalos!, tiendas: [...(c.regalos?.tiendas || []), { nombre: "", numero: "", url: "" }] })}>+ Agregar tienda</button></div>
        </Opcional>

        <Opcional
          titulo="Regalo en efectivo (CLABE)"
          desc="Datos para transferencia, con botón de copiar."
          activo={!!c.clabe}
          onCambio={(v) => texto("clabe", v ? { texto: "Si prefieres hacernos un regalo en efectivo:", titular: "", banco: "", clabe: "" } : undefined)}
        >
          <div className="grid">
            <div className="field span-all"><label htmlFor="o-cb-x">Mensaje</label><input id="o-cb-x" value={c.clabe?.texto || ""} maxLength={300} onChange={(e) => texto("clabe", { ...c.clabe!, texto: e.target.value })} /></div>
            <div className="field">
              <label htmlFor="o-cb-n">CLABE (18 dígitos)</label>
              <input id="o-cb-n" inputMode="numeric" value={c.clabe?.clabe || ""} maxLength={22} onChange={(e) => texto("clabe", { ...c.clabe!, clabe: e.target.value.replace(/[^\d ]/g, "") })} />
              <small className={(c.clabe?.clabe || "").replace(/\D/g, "").length === 18 ? "" : "warn-txt"}>{(c.clabe?.clabe || "").replace(/\D/g, "").length} de 18 dígitos</small>
            </div>
            <div className="field"><label htmlFor="o-cb-b">Banco</label><input id="o-cb-b" value={c.clabe?.banco || ""} maxLength={60} onChange={(e) => texto("clabe", { ...c.clabe!, banco: e.target.value })} /></div>
            <div className="field span-all"><label htmlFor="o-cb-t">Titular de la cuenta</label><input id="o-cb-t" value={c.clabe?.titular || ""} maxLength={80} onChange={(e) => texto("clabe", { ...c.clabe!, titular: e.target.value })} /></div>
          </div>
        </Opcional>

        <Opcional
          titulo="Qué te toca llevar"
          desc="Un mensaje general y, si quieres, algo distinto para cada invitado."
          activo={!!c.traer}
          onCambio={(v) => texto("traer", v ? { titulo: "¿Qué te toca llevar?", texto: "" } : undefined)}
        >
          <div className="grid">
            <div className="field"><label htmlFor="o-tr-t">Título</label><input id="o-tr-t" value={c.traer?.titulo || ""} maxLength={80} onChange={(e) => texto("traer", { ...c.traer!, titulo: e.target.value })} /></div>
            <div className="field"><label htmlFor="o-tr-x">Mensaje para todos (opcional)</label><input id="o-tr-x" value={c.traer?.texto || ""} maxLength={400} placeholder="Cada familia trae un platillo para compartir" onChange={(e) => texto("traer", { ...c.traer!, texto: e.target.value })} /></div>
          </div>
          <small className="soft">Para asignar algo distinto a cada invitado, guarda los cambios y usa la columna “Lleva” en la lista de invitados.</small>
        </Opcional>
      </section>

      {/* ---------- Portada ---------- */}
      <section className="card" id="archivos">
        <h2>Foto de portada</h2>
        <div className="media-row">
          {c.portada?.src ? (
            <div className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.portada.src} alt="Portada" />
              <button type="button" className="x" aria-label="Quitar portada" onClick={() => texto("portada", null)}>×</button>
            </div>
          ) : (
            <div className="thumb empty">Sin portada</div>
          )}
          <Selector
            accept="image/*"
            alto
            onArchivos={async ([f]) => {
              try {
                const foto = await subirFoto(id, f);
                texto("portada", { ...foto, alt: c.portada?.alt || d.nombre });
              } catch (e) { error(e); }
            }}
          >
            <span aria-hidden="true">＋</span>{c.portada?.src ? "Cambiar" : "Subir foto"}
          </Selector>
        </div>
        <p className="soft sm">Se ve dentro del arco principal. Funciona mejor una foto vertical. También es la imagen que aparece al compartir el link por WhatsApp.</p>
      </section>

      {/* ---------- Línea del tiempo ---------- */}
      <section className="card" id="linea">
        <div className="card-head">
          <h2>Línea del tiempo</h2>
          <span className="soft sm">{linea.length} {linea.length === 1 ? "momento" : "momentos"}</span>
        </div>
        <div className="grid three">
          <div className="field">
            <label htmlFor="l-eyebrow">Frase pequeña</label>
            <input id="l-eyebrow" value={c.lineaEyebrow ?? ""} maxLength={60} onChange={(e) => texto("lineaEyebrow", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="l-titulo">Título</label>
            <input id="l-titulo" value={c.lineaTitulo || ""} maxLength={80} onChange={(e) => texto("lineaTitulo", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="l-intro">Introducción</label>
            <input id="l-intro" value={c.lineaIntro || ""} maxLength={240} onChange={(e) => texto("lineaIntro", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <span className="lbl-row">Cómo se muestran las fotos</span>
          <div className="seg" role="radiogroup" aria-label="Cómo se muestran las fotos">
            <label><input type="radio" name="vista" checked={c.vistaFotos !== "galeria"} onChange={() => texto("vistaFotos", undefined)} /> Línea del tiempo</label>
            <label><input type="radio" name="vista" checked={c.vistaFotos === "galeria"} onChange={() => texto("vistaFotos", "galeria")} /> Galería</label>
          </div>
          <small>{c.vistaFotos === "galeria" ? "Las fotos se ven en cuadrícula, sin títulos ni textos. Los momentos solo sirven para ordenarlas." : "Cada momento se ve con su título, fecha y texto."}</small>
        </div>

        {linea.map((m, i) => (
          <div className="moment" key={i}>
            <div className="moment-head">
              <b>Momento {i + 1}</b>
              <span className="btns">
                <button type="button" className="btn ghost icon sm" aria-label="Subir momento" disabled={i === 0} onClick={() => setLinea(mover(linea, i, -1))}>↑</button>
                <button type="button" className="btn ghost icon sm" aria-label="Bajar momento" disabled={i === linea.length - 1} onClick={() => setLinea(mover(linea, i, 1))}>↓</button>
                <button type="button" className="btn danger sm" onClick={() => setLinea(linea.filter((_, j) => j !== i))}>Quitar</button>
              </span>
            </div>
            <div className="grid">
              <div className="field">
                <label htmlFor={`m-l-${i}`}>Título</label>
                <input id={`m-l-${i}`} value={m.label} maxLength={60} placeholder="Ej. Recién nacida" onChange={(e) => setMomento(i, { label: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`m-w-${i}`}>Cuándo</label>
                <input id={`m-w-${i}`} value={m.when} maxLength={60} placeholder="Ej. Noviembre 2025" onChange={(e) => setMomento(i, { when: e.target.value })} />
              </div>
              <div className="field span-all">
                <label htmlFor={`m-c-${i}`}>Texto bajo la foto</label>
                <input id={`m-c-${i}`} value={m.cap} maxLength={240} onChange={(e) => setMomento(i, { cap: e.target.value })} />
              </div>
            </div>
            <div className="media-row">
              {m.fotos.map((f, k) => (
                <div className="thumb" key={f.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.src} alt={`Foto ${k + 1} de ${m.label || "este momento"}`} />
                  <button type="button" className="x" aria-label="Quitar foto" onClick={() => setMomento(i, { fotos: m.fotos.filter((_, j) => j !== k) })}>×</button>
                </div>
              ))}
              {m.fotos.length < 2 && (
                <Selector
                  accept="image/*"
                  multiple
                  alto
                  onArchivos={async (files) => {
                    try {
                      const nuevas: Foto[] = [];
                      for (const f of files.slice(0, 2 - m.fotos.length)) nuevas.push(await subirFoto(id, f));
                      cambia((x) => ({
                        ...x,
                        contenido: { ...x.contenido, linea: x.contenido.linea.map((y, j) => (j === i ? { ...y, fotos: [...y.fotos, ...nuevas] } : y)) },
                      }));
                    } catch (e) { error(e); }
                  }}
                >
                  <span aria-hidden="true">＋</span>Foto
                </Selector>
              )}
            </div>
          </div>
        ))}
        <div className="btns">
          <button type="button" className="btn ghost" onClick={() => setLinea([...linea, { label: "", when: "", cap: "", fotos: [] }])}>+ Agregar momento</button>
          <span className="soft sm">Hasta 2 fotos por momento. Si no agregas momentos, la sección no aparece.</span>
        </div>

        <div className="sub">
          <label className="pick" style={{ maxWidth: 420 }}>
            <input type="checkbox" checked={!!c.cierre} onChange={(e) => texto("cierre", e.target.checked ? { label: "Hoy", when: "", titulo: "", texto: "" } : undefined)} />
            <span><b>{c.cierre ? "✓ " : ""}Cierre especial al final</b><small>Un último momento con animalitos y texto grande, sin foto.</small></span>
          </label>
          {c.cierre && (
            <div className="grid">
              <div className="field"><label htmlFor="c-l">Título</label><input id="c-l" value={c.cierre.label} maxLength={60} onChange={(e) => texto("cierre", { ...c.cierre!, label: e.target.value })} /></div>
              <div className="field"><label htmlFor="c-w">Cuándo</label><input id="c-w" value={c.cierre.when} maxLength={60} onChange={(e) => texto("cierre", { ...c.cierre!, when: e.target.value })} /></div>
              <div className="field"><label htmlFor="c-t">Frase grande</label><input id="c-t" value={c.cierre.titulo} maxLength={120} onChange={(e) => texto("cierre", { ...c.cierre!, titulo: e.target.value })} /></div>
              <div className="field"><label htmlFor="c-x">Texto</label><input id="c-x" value={c.cierre.texto} maxLength={400} onChange={(e) => texto("cierre", { ...c.cierre!, texto: e.target.value })} /></div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Música ---------- */}
      <section className="card" id="musica">
        <h2>Música</h2>
        {musica.length === 0 && <p className="soft sm" style={{ margin: 0 }}>Sin canciones: la invitación toca una cajita musical suave.</p>}
        {musica.map((src, i) => (
          <div className="track" key={src}>
            <span className="n">{i + 1}</span>
            <audio controls preload="none" src={src} />
            <span className="btns">
              <button type="button" className="btn ghost icon sm" aria-label="Subir canción" disabled={i === 0} onClick={() => texto("musica", mover(musica, i, -1))}>↑</button>
              <button type="button" className="btn ghost icon sm" aria-label="Bajar canción" disabled={i === musica.length - 1} onClick={() => texto("musica", mover(musica, i, 1))}>↓</button>
              <button type="button" className="btn danger sm" onClick={() => texto("musica", musica.filter((_, j) => j !== i))}>Quitar</button>
            </span>
          </div>
        ))}
        <div className="btns">
          <Selector
            accept="audio/*,.mp3,.m4a"
            multiple
            onArchivos={async (files) => {
              try {
                const nuevas: string[] = [];
                for (const f of files) {
                  if (f.size > 20 * 1024 * 1024) throw new Error(`"${f.name}" pesa más de 20 MB. Usa un MP3 más ligero.`);
                  nuevas.push(await subir(id, "musica", f, mimeAudio(f)));
                }
                cambia((x) => ({ ...x, contenido: { ...x.contenido, musica: [...(x.contenido.musica || []), ...nuevas] } }));
              } catch (e) { error(e); }
            }}
          >
            + Subir canción (MP3)
          </Selector>
          <span className="soft sm">Suenan en orden y se repiten. Un MP3 de 3–5 MB es ideal.</span>
        </div>
      </section>

      {/* ---------- Barra de guardado ---------- */}
      <div className="savebar" role="region" aria-label="Guardar cambios">
        <span className={`state${estado?.err ? " err" : ""}`} role="status">
          {estado?.t || (sucio ? "Tienes cambios sin guardar" : "Todo guardado")}
        </span>
        <span className="btns">
          <a className="btn ghost sm" href={`/${inicial.slug}`} target="_blank" rel="noopener">Ver invitación ↗</a>
          <button type="button" className="btn sm" disabled={guardando || !sucio} onClick={guardar}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </span>
      </div>
    </>
  );
}
