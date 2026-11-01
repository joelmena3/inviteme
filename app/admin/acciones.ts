"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { abrirSesion, cerrarSesion, esAdmin, exigirAdmin } from "@/lib/admin";
import { BUCKET, carpetaDe, esMime, rutaNueva, TIPOS_ARCHIVO, urlPublica, type Mime } from "@/lib/storage";
import { db } from "@/lib/supabase";
import type { Contenido, Foto } from "@/lib/tipos";
import { codigoDesde, DISENOS, fechaISO, METODOS, PAQUETES, slugValido, textosFecha, TIPOS } from "@/lib/util";

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
  const dia = txt(fd.get("dia"), 10);
  const hora = txt(fd.get("hora"), 5) || "12:00";

  if (!nombre) falla("/admin/nuevo", "Escribe el nombre del festejado o de la pareja.");
  const malSlug = slugValido(slug);
  if (malSlug) falla("/admin/nuevo", malSlug);
  if (!DIA_RE.test(dia) || !HORA_RE.test(hora)) falla("/admin/nuevo", "Revisa la fecha y la hora del evento.");

  const precioTxt = txt(fd.get("precio"), 12);
  const precio = precioTxt === "" ? PAQUETES.find((p) => p.id === paquete)!.precio : Math.max(0, Number(precioTxt) || 0);
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
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") falla("/admin/nuevo", `Ya existe un evento con el link "${slug}". Elige otro.`);
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
  };
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
      contenido: limpiarContenido(d.contenido || {}, d.dia, d.hora),
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
  const filas = lineas.map((l) => {
    const m = l.match(/^(.*?)[,;\t]\s*(\d{1,2})\s*$/);
    const nombre = txt(m ? m[1] : l, 80);
    const pases = m ? Math.min(Math.max(Number(m[2]), 1), 30) : null;
    const base = codigoDesde(nombre);
    let codigo = base;
    for (let i = 2; set.has(codigo); i++) codigo = `${base}-${i}`;
    set.add(codigo);
    return { evento_id: id, codigo, nombre, pases };
  });
  const { error } = await sb.from("invitados").insert(filas);
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
