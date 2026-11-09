"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { abrirSesion, cerrarSesion, esAdmin, exigirAdmin } from "@/lib/admin";
import { BUCKET, carpetaDe, esMime, rutaNueva, TIPOS_ARCHIVO, urlPublica, type Mime } from "@/lib/storage";
import { db } from "@/lib/supabase";
import { CLAVE_MIN, huellaClave } from "@/lib/panel";
import { cambiarPublica } from "@/lib/visibilidad";
import { CATALOGO } from "@/plantillas/catalogo";
import type { Contenido, Foto, Grupo } from "@/lib/tipos";
import { codigoDesde, DISENOS, fechaISO, METODOS, PAQUETES, partesFecha, slugValido, textosFecha, TIPOS } from "@/lib/util";

// Todas las acciones vuelven a comprobar la sesión de administrador:
// aunque alguien conozca la dirección, sin la cookie no puede hacer nada.

const txt = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const HORA_RE = /^\d{2}:\d{2}$/;

function volver(ruta: string, msg: string, ancla = "", error = false): never {
  redirect(`${ruta}?msg=${encodeURIComponent(msg)}${error ? "&error=1" : ""}${ancla ? "#" + ancla : ""}`);
}
function falla(ruta: string, msg: string, ancla = ""): never {
  volver(ruta, msg, ancla, true);
}

async function soloAdmin() {
  if (!(await esAdmin())) throw new Error("Tu sesión expiró. Vuelve a entrar al panel.");
}

// ---------- Sesión ----------

export async function entrar(fd: FormData) {
  const ok = await abrirSesion(String(fd.get("password") || ""));
  if (!ok) {
    await dormir(900); // frena a quien intente adivinar
    redirect("/admin/entrar?e=1");
  }
  redirect("/admin");
}

export async function salir() {
  await cerrarSesion();
  redirect("/admin/entrar");
}

// ---------- Crear evento ----------

export async function crearEvento(fd: FormData) {
  await exigirAdmin();
  const nombre = txt(fd.get("nombre"), 80);
  const slug = codigoDesde(txt(fd.get("slug"), 60) || nombre, "");
  const tipo = TIPOS.find((t) => t.id === fd.get("tipo")) || TIPOS[TIPOS.length - 1];
  const diseno = DISENOS.find((d) => d.id === fd.get("diseno"))?.id || "bosque";
  const paquete = PAQUETES.find((p) => p.id === fd.get("paquete"))?.id || "wow";
  // La fecha y el lugar los captura el cliente en su formulario. Mientras tanto
  // el evento queda con una fecha provisional (en 60 días) marcada como pendiente.
  const provisional = partesFecha(new Date(Date.now() + 60 * 24 * 3600e3).toISOString());
  const dia = txt(fd.get("dia"), 10) || provisional.dia;
  const hora = txt(fd.get("hora"), 5) || "14:00";
  const fechaPendiente = !fd.get("dia");

  if (!nombre) falla("/admin/nuevo", "Escribe el nombre del festejado o de la pareja.");
  const malSlug = slugValido(slug);
  if (malSlug) falla("/admin/nuevo", malSlug);
  if (!DIA_RE.test(dia) || !HORA_RE.test(hora)) falla("/admin/nuevo", "Revisa la fecha y la hora del evento.");

  const precioTxt = txt(fd.get("precio"), 12);
  const precio = precioTxt === "" ? PAQUETES.find((p) => p.id === paquete)!.precio : Math.max(0, Number(precioTxt) || 0);
  const clavePanel = String(fd.get("clave_panel") || "").trim();
  if (clavePanel && clavePanel.length < CLAVE_MIN) falla("/admin/nuevo", `La contraseña del panel debe tener al menos ${CLAVE_MIN} caracteres.`);
  const lugarNombre = txt(fd.get("lugar_nombre"), 120);
  const lugarDir = txt(fd.get("lugar_direccion"), 200);

  const contenido: Contenido = {
    eyebrow: tipo.eyebrow,
    kicker: tipo.kicker,
    mensaje: tipo.mensaje,
    fecha: textosFecha(dia, hora),
    lugar: { nombre: lugarNombre, direccion: lugarDir, busqueda: [lugarNombre, lugarDir].filter(Boolean).join(", ") },
    portada: null,
    lineaEyebrow: tipo.linea,
    lineaTitulo: tipo.lineaTitulo,
    lineaIntro: "Toca cualquier foto para verla en grande.",
    linea: [],
    musica: [],
    pie: `Con cariño, gracias por acompañarnos`,
    saludo: { activo: true, texto: tipo.saludo },
    ...(fechaPendiente ? { formulario: { fechaPendiente: true } } : {}),
  };

  const { data, error } = await db()
    .from("eventos")
    .insert({
      slug,
      nombre,
      tipo: tipo.id,
      diseno,
      fecha: fechaISO(dia, hora),
      contenido,
      paquete,
      precio,
      cliente_nombre: txt(fd.get("cliente_nombre"), 80) || null,
      cliente_whatsapp: txt(fd.get("cliente_whatsapp"), 20) || null,
      notas: txt(fd.get("notas"), 500) || null,
      ...(clavePanel ? { panel_hash: huellaClave(clavePanel) } : {}),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") falla("/admin/nuevo", `Ya existe un evento con el link "${slug}". Elige otro.`);
    if (error.code === "PGRST204" || /panel_hash/.test(error.message)) falla("/admin/nuevo", "Para usar contraseña en el panel, primero corre 04_clave_panel.sql en Supabase.");
    falla("/admin/nuevo", "No se pudo crear el evento. ¿Ya corriste el archivo 03_admin_storage.sql en Supabase?");
  }
  volver(`/admin/evento/${data!.id}`, "Evento creado. Ahora agrega fotos, textos e invitados.");
}

// ---------- Guardar el editor ----------

export type DatosEditor = {
  nombre: string;
  slug: string;
  tipo: string;
  diseno: string;
  dia: string;
  hora: string;
  paquete: string;
  precio: number;
  cliente_nombre: string;
  cliente_whatsapp: string;
  notas: string;
  contenido: Contenido;
};

// Solo aceptamos archivos de nuestro Storage, de la carpeta vieja /eventos/ o https.
const urlValida = (s: unknown) => {
  const v = String(s ?? "").trim();
  const storage = urlPublica("");
  return v.startsWith(storage) || /^https:\/\//.test(v) || /^\/eventos\//.test(v) ? v.slice(0, 500) : "";
};

function limpiarFoto(f: Partial<Foto> | null | undefined): Foto | null {
  const src = urlValida(f?.src);
  if (!src) return null;
  const w = Math.round(Number(f?.w)) || 900;
  const h = Math.round(Number(f?.h)) || 1200;
  return { src, w: Math.min(Math.max(w, 1), 6000), h: Math.min(Math.max(h, 1), 6000), ...(f?.alt ? { alt: txt(f.alt, 140) } : {}) };
}

function limpiarContenido(c: Partial<Contenido>, dia: string, hora: string): Contenido {
  const lugarNombre = txt(c.lugar?.nombre, 120);
  const lugarDir = txt(c.lugar?.direccion, 200);
  const linea = (Array.isArray(c.linea) ? c.linea : []).slice(0, 30).map((m) => ({
    label: txt(m?.label, 60),
    when: txt(m?.when, 60),
    cap: txt(m?.cap, 240),
    fotos: (Array.isArray(m?.fotos) ? m.fotos : []).slice(0, 2).map(limpiarFoto).filter((f): f is Foto => !!f),
  }));
  const cierre = c.cierre && (c.cierre.titulo || c.cierre.texto)
    ? { label: txt(c.cierre.label, 60), when: txt(c.cierre.when, 60), titulo: txt(c.cierre.titulo, 120), texto: txt(c.cierre.texto, 400) }
    : undefined;
  return {
    eyebrow: txt(c.eyebrow, 80),
    kicker: txt(c.kicker, 60),
    mensaje: txt(c.mensaje, 600),
    fecha: textosFecha(dia, hora),
    lugar: { nombre: lugarNombre, direccion: lugarDir, busqueda: txt(c.lugar?.busqueda, 250) || [lugarNombre, lugarDir].filter(Boolean).join(", ") },
    portada: limpiarFoto(c.portada),
    lineaEyebrow: txt(c.lineaEyebrow, 60),
    lineaTitulo: txt(c.lineaTitulo, 80),
    lineaIntro: txt(c.lineaIntro, 240),
    linea,
    ...(cierre ? { cierre } : {}),
    musica: (Array.isArray(c.musica) ? c.musica : []).slice(0, 10).map(urlValida).filter(Boolean),
    pie: txt(c.pie, 160),
    ...limpiarOpcionales(c),
  };
}

// Secciones opcionales: solo se guardan las que están activadas (existen en el objeto).
const soloDigitos = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const urlTienda = (v: unknown) => {
  let u = txt(v, 400);
  if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
  return /^https?:\/\/[^\s"<>]+\.[^\s"<>]+$/i.test(u) ? u : "";
};
const limpiarGrupo = (gr: Partial<Grupo> | undefined, titulo: string): Grupo | undefined =>
  gr ? { titulo: txt(gr.titulo, 60) || titulo, nombres: txt(gr.nombres, 1200) } : undefined;

function limpiarOpcionales(c: Partial<Contenido>): Partial<Contenido> {
  const o: Partial<Contenido> = {};
  if (c.vistaFotos === "galeria") o.vistaFotos = "galeria";
  if (c.familiasTitulo) o.familiasTitulo = txt(c.familiasTitulo, 80);
  const grupos = { padres: "Mis papás", padresNovia: "Padres de la novia", padresNovio: "Padres del novio", padrinos: "Padrinos" } as const;
  for (const [k, t] of Object.entries(grupos) as [keyof typeof grupos, string][]) {
    const gr = limpiarGrupo(c[k], t);
    if (gr) o[k] = gr;
  }
  if (c.ceremonia) {
    o.ceremonia = { titulo: txt(c.ceremonia.titulo, 60) || "Ceremonia religiosa", nombre: txt(c.ceremonia.nombre, 120), direccion: txt(c.ceremonia.direccion, 200), hora: txt(c.ceremonia.hora, 30) };
  }
  if (c.dresscode) o.dresscode = { titulo: txt(c.dresscode.titulo, 60), texto: txt(c.dresscode.texto, 400) };
  if (c.regalos) {
    o.regalos = {
      texto: txt(c.regalos.texto, 300),
      tiendas: (Array.isArray(c.regalos.tiendas) ? c.regalos.tiendas : []).slice(0, 8)
        .map((t) => ({ nombre: txt(t?.nombre, 60), numero: txt(t?.numero, 40), url: urlTienda(t?.url) }))
        .filter((t) => t.nombre || t.numero || t.url),
    };
  }
  if (c.clabe) o.clabe = { texto: txt(c.clabe.texto, 300), titular: txt(c.clabe.titular, 80), banco: txt(c.clabe.banco, 60), clabe: soloDigitos(c.clabe.clabe).slice(0, 18) };
  if (c.traer) o.traer = { titulo: txt(c.traer.titulo, 80), texto: txt(c.traer.texto, 400) };
  if (c.saludo) o.saludo = { activo: c.saludo.activo !== false, texto: txt(c.saludo.texto, 120) };
  return o;
}

export async function guardarEvento(id: string, d: DatosEditor): Promise<{ ok: true; slug: string } | { error: string }> {
  try {
    await soloAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const nombre = txt(d.nombre, 80);
  const slug = txt(d.slug, 40);
  if (!nombre) return { error: "El nombre no puede quedar vacío." };
  const malSlug = slugValido(slug);
  if (malSlug) return { error: malSlug };
  if (!DIA_RE.test(d.dia) || !HORA_RE.test(d.hora)) return { error: "Revisa la fecha y la hora." };
  const clabe = d.contenido?.clabe ? soloDigitos(d.contenido.clabe.clabe) : "";
  // Vacía está bien (el cliente la puede llenar en su formulario); si tiene número, deben ser 18 dígitos.
  if (clabe && clabe.length !== 18) return { error: "La CLABE debe tener exactamente 18 dígitos." };

  const contenido = limpiarContenido(d.contenido || {}, d.dia, d.hora);
  // Lo que le toca llevar a cada invitado se edita en la lista de invitados:
  // lo conservamos tal como está en la base para no pisarlo desde el editor.
  // Lo mismo con el estado del formulario del cliente (se maneja en su propia tarjeta).
  const { data: actual } = await db().from("eventos").select("contenido").eq("id", id).maybeSingle();
  const previo = actual?.contenido as Contenido | undefined;
  if (contenido.traer && previo?.traer?.asignaciones) contenido.traer.asignaciones = previo.traer.asignaciones;
  if (previo?.formulario) contenido.formulario = { ...previo.formulario };
  if (contenido.formulario?.fechaPendiente) {
    const { data: f } = await db().from("eventos").select("fecha").eq("id", id).maybeSingle();
    const antes = f ? partesFecha(f.fecha) : null;
    if (!antes || antes.dia !== d.dia || antes.hora !== d.hora) delete contenido.formulario.fechaPendiente;
  }

  const { error } = await db()
    .from("eventos")
    .update({
      nombre,
      slug,
      tipo: TIPOS.find((t) => t.id === d.tipo)?.id || "otro",
      diseno: DISENOS.find((x) => x.id === d.diseno)?.id || "bosque",
      fecha: fechaISO(d.dia, d.hora),
      paquete: PAQUETES.find((p) => p.id === d.paquete)?.id || "otro",
      precio: Math.max(0, Number(d.precio) || 0),
      cliente_nombre: txt(d.cliente_nombre, 80) || null,
      cliente_whatsapp: txt(d.cliente_whatsapp, 20) || null,
      notas: txt(d.notas, 500) || null,
      contenido,
      actualizado: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: `Ya existe otro evento con el link "${slug}".` };
    return { error: "No se pudo guardar. Inténtalo de nuevo." };
  }
  return { ok: true, slug };
}

// ---------- Archivos (Supabase Storage) ----------

// Paso 1 de una subida: el servidor da un permiso de un solo uso
// y el navegador sube el archivo directo a Supabase (sin límite de Vercel).
export async function prepararSubida(
  id: string,
  tipo: "fotos" | "musica",
  mime: string
): Promise<{ subir: string; publica: string } | { error: string }> {
  try {
    await soloAdmin();
    if (!esMime(mime)) return { error: "Tipo de archivo no permitido. Usa JPG, PNG, WEBP o MP3/M4A." };
    if (tipo !== "fotos" && tipo !== "musica") return { error: "Tipo inválido." };
    const ruta = rutaNueva(await carpetaDe(id), tipo, mime);
    const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(ruta);
    if (error || !data) return { error: "No se pudo preparar la subida. ¿Ya creaste la carpeta con 03_admin_storage.sql?" };
    return { subir: data.signedUrl, publica: urlPublica(ruta) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// Respaldo: si la subida directa falla, el archivo pasa por el servidor (máx. 4 MB).
export async function subirArchivo(fd: FormData): Promise<{ publica: string } | { error: string }> {
  try {
    await soloAdmin();
    const id = String(fd.get("id") || "");
    const tipo = fd.get("tipo") === "musica" ? "musica" : "fotos";
    const file = fd.get("archivo");
    if (!(file instanceof File)) return { error: "No llegó el archivo." };
    if (!esMime(file.type)) return { error: "Tipo de archivo no permitido." };
    const ruta = rutaNueva(await carpetaDe(id), tipo, file.type);
    const { error } = await db().storage.from(BUCKET).upload(ruta, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) return { error: "No se pudo subir el archivo." };
    return { publica: urlPublica(ruta) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// Mueve las fotos y la música que todavía viven en GitHub (/eventos/…)
// a Supabase Storage y actualiza la invitación para que las lea de ahí.
export async function migrarArchivos(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const ruta = `/admin/evento/${id}`;
  const sb = db();
  const { data: ev } = await sb.from("eventos").select("id, contenido").eq("id", id).maybeSingle();
  if (!ev) falla("/admin", "No encontré el evento.");

  let json = JSON.stringify(ev.contenido);
  const viejas = Array.from(new Set(json.match(/"\/eventos\/[^"]+"/g) || [])).map((s) => s.slice(1, -1));
  if (!viejas.length) falla(ruta, "Este evento ya no tiene archivos en GitHub.", "archivos");

  const h = await headers();
  const origen = `${h.get("x-forwarded-proto") || "https"}://${h.get("x-forwarded-host") || h.get("host")}`;
  const carpeta = await carpetaDe(id);
  const mimePorExt = Object.fromEntries(Object.entries(TIPOS_ARCHIVO).map(([m, e]) => [e, m])) as Record<string, Mime>;

  let movidos = 0;
  const fallas: string[] = [];
  for (const vieja of viejas) {
    const nombre = vieja.split("/").pop()!.toLowerCase();
    const mime = mimePorExt[nombre.split(".").pop() || ""] || (nombre.endsWith(".jpeg") ? "image/jpeg" : null);
    if (!mime) { fallas.push(nombre); continue; }
    const tipo = mime.startsWith("audio/") ? "musica" : "fotos";
    try {
      const r = await fetch(origen + vieja, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const destino = `${carpeta}/${tipo}/${nombre}`;
      const { error } = await sb.storage.from(BUCKET).upload(destino, await r.arrayBuffer(), { contentType: mime, upsert: true, cacheControl: "31536000" });
      if (error) throw error;
      json = json.split(`"${vieja}"`).join(`"${urlPublica(destino)}"`);
      movidos++;
    } catch {
      fallas.push(nombre);
    }
  }

  const { error } = await sb.from("eventos").update({ contenido: JSON.parse(json), actualizado: new Date().toISOString() }).eq("id", id);
  if (error) falla(ruta, "Se subieron los archivos pero no se pudo actualizar la invitación. Vuelve a intentarlo.", "archivos");
  volver(
    ruta,
    fallas.length
      ? `Moví ${movidos} archivos. Fallaron ${fallas.length}: ${fallas.slice(0, 5).join(", ")}. Vuelve a intentarlo.`
      : `Listo: ${movidos} archivos ahora viven en Supabase Storage.`,
    "archivos",
    fallas.length > 0
  );
}

// ---------- Pagos ----------

export async function agregarPago(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const ruta = `/admin/evento/${id}`;
  const monto = Math.round(Number(fd.get("monto")) * 100) / 100;
  const metodo = METODOS.find((m) => m.id === fd.get("metodo"))?.id;
  const fecha = txt(fd.get("fecha"), 10);
  if (!(monto > 0)) falla(ruta, "Escribe un monto mayor a cero.", "pagos");
  if (!metodo) falla(ruta, "Elige cómo pagó.", "pagos");
  const { error } = await db().from("pagos").insert({
    evento_id: id,
    monto,
    metodo,
    referencia: txt(fd.get("referencia"), 80) || null,
    notas: txt(fd.get("notas"), 200) || null,
    ...(DIA_RE.test(fecha) ? { fecha } : {}),
  });
  volver(ruta, error ? "No se pudo registrar el pago." : "Pago registrado.", "pagos", !!error);
}

export async function eliminarPago(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const { error } = await db().from("pagos").delete().eq("id", String(fd.get("pago") || "")).eq("evento_id", id);
  volver(`/admin/evento/${id}`, error ? "No se pudo eliminar el pago." : "Pago eliminado.", "pagos", !!error);
}

// ---------- Invitados ----------

// Una línea por invitado: "Nombre" o "Nombre, 4" (el número son los pases).
export async function agregarInvitados(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const ruta = `/admin/evento/${id}`;
  const lineas = String(fd.get("lista") || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 500);
  if (!lineas.length) falla(ruta, "Pega al menos un nombre.", "invitados");

  const sb = db();
  const { data: usados } = await sb.from("invitados").select("codigo").eq("evento_id", id);
  const set = new Set((usados || []).map((u) => u.codigo));
  const lleva: Record<string, string> = {};
  const filas = lineas.map((l) => {
    // "Nombre", "Nombre, 4" o "Nombre, 4, Postre" (o "Nombre, , Postre" sin límite de pases)
    const partes = l.split(/[,;\t]/).map((x) => x.trim());
    const tienePases = partes.length > 1 && /^\d{0,2}$/.test(partes[1]);
    const nombre = txt(tienePases ? partes[0] : l, 80);
    const pases = tienePases && partes[1] ? Math.min(Math.max(Number(partes[1]), 1), 30) : null;
    const queLleva = tienePases ? txt(partes.slice(2).join(", "), 80) : "";
    const base = codigoDesde(nombre);
    let codigo = base;
    for (let i = 2; set.has(codigo); i++) codigo = `${base}-${i}`;
    set.add(codigo);
    if (queLleva) lleva[codigo] = queLleva;
    return { evento_id: id, codigo, nombre, pases };
  });
  const { error } = await sb.from("invitados").insert(filas);
  if (!error && Object.keys(lleva).length) await guardarAsignaciones(id, lleva);
  volver(ruta, error ? "No se pudieron agregar los invitados." : `Agregaste ${filas.length} ${filas.length === 1 ? "invitado" : "invitados"}.`, "invitados", !!error);
}

export async function eliminarInvitado(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const inv = String(fd.get("invitado") || "");
  const sb = db();
  const r1 = await sb.from("confirmaciones").delete().eq("evento_id", id).eq("invitado_id", inv);
  const r2 = r1.error ? r1 : await sb.from("invitados").delete().eq("evento_id", id).eq("id", inv);
  volver(`/admin/evento/${id}`, r2.error ? "No se pudo eliminar." : "Invitado eliminado.", "invitados", !!r2.error);
}

// ---------- Qué le toca llevar a cada invitado ----------

async function guardarAsignaciones(id: string, cambios: Record<string, string>) {
  const sb = db();
  const { data } = await sb.from("eventos").select("contenido").eq("id", id).maybeSingle();
  if (!data) return;
  const c = data.contenido as Contenido;
  const traer = c.traer || { titulo: "¿Qué te toca llevar?", texto: "" };
  const asignaciones = { ...(traer.asignaciones || {}) };
  for (const [k, v] of Object.entries(cambios)) {
    if (v) asignaciones[k] = v;
    else delete asignaciones[k];
  }
  await sb.from("eventos").update({ contenido: { ...c, traer: { ...traer, asignaciones } } }).eq("id", id);
}

export async function asignarLleva(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const codigo = String(fd.get("codigo") || "");
  const nombre = txt(fd.get("nombre"), 80);
  if (!codigo) falla(`/admin/evento/${id}`, "Falta el invitado.", "invitados");
  await guardarAsignaciones(id, { [codigo]: txt(fd.get("lleva"), 80) });
  volver(`/admin/evento/${id}`, `Guardado lo que le toca llevar a ${nombre || "este invitado"}.`, "invitados");
}

// ---------- Contraseña del panel del festejado ----------

export async function guardarClavePanel(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const ruta = `/admin/evento/${id}`;
  const quitar = fd.get("quitar") === "1";
  const clave = String(fd.get("clave") || "").trim();
  if (!quitar && clave.length < CLAVE_MIN) falla(ruta, `La contraseña debe tener al menos ${CLAVE_MIN} caracteres.`, "entrega");
  const { error } = await db().from("eventos").update({ panel_hash: quitar ? null : huellaClave(clave) }).eq("id", id);
  if (error) falla(ruta, "No se pudo guardar. ¿Ya corriste 04_clave_panel.sql en Supabase?", "entrega");
  volver(ruta, quitar ? "Quitaste la contraseña del panel: ahora entra cualquiera con el link." : "Contraseña del panel guardada. Compártela con tu cliente.", "entrega");
}

// ---------- Templates públicos o privados ----------

// Público = sale en la página web; privado = solo en el panel (se puede usar en eventos igual).
export async function cambiarVisibilidad(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("plantilla") || "");
  const publica = fd.get("publica") === "1";
  const nombre = CATALOGO.find((p) => p.id === id)?.nombre || id;
  const ruta = `/admin?tab=plantillas&p=${encodeURIComponent(id)}`;
  const r = await cambiarPublica(id, publica);
  const msg = "error" in r
    ? r.error
    : publica
      ? `«${nombre}» ya es público: aparece en la página web en menos de un minuto.`
      : `«${nombre}» ahora es privado: ya no sale en la página web, pero lo puedes usar en tus eventos.`;
  redirect(`${ruta}&msg=${encodeURIComponent(msg)}${"error" in r ? "&error=1" : ""}`);
}

// ---------- Formulario del cliente ----------

export async function configurarFormulario(fd: FormData) {
  await exigirAdmin();
  const id = String(fd.get("id") || "");
  const ruta = `/admin/evento/${id}`;
  const sb = db();
  const { data } = await sb.from("eventos").select("contenido").eq("id", id).maybeSingle();
  if (!data) falla("/admin", "No encontré el evento.");
  const c = data.contenido as Contenido;
  const f = { ...(c.formulario || {}) };
  const accion = String(fd.get("accion") || "");
  if (accion === "cerrar") f.cerrado = true;
  else if (accion === "abrir") f.cerrado = false;
  else f.maxFotos = Math.min(Math.max(Math.floor(Number(fd.get("maxFotos")) || 0), 0), 30);
  const { error } = await sb.from("eventos").update({ contenido: { ...c, formulario: f } }).eq("id", id);
  const msg = accion === "cerrar" ? "Formulario cerrado: el cliente ya no puede cambiar datos." : accion === "abrir" ? "Formulario abierto de nuevo." : "Guardado.";
  if (error) falla(ruta, "No se pudo guardar.", "formulario");
  volver(ruta, msg, "formulario");
}
