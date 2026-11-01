"use server";

import { BUCKET, carpetaDe, rutaNueva, urlPublica } from "@/lib/storage";
import { db } from "@/lib/supabase";
import type { Contenido, Foto } from "@/lib/tipos";
import { codigoDesde, fechaISO, fotosPorPaquete, textosFecha } from "@/lib/util";

// Acciones del formulario que llena el cliente. La "llave" del link (la misma del
// evento) es lo único que lo autoriza, y solo puede tocar los datos de su evento
// y las secciones que tú activaste.

const txt = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const LLAVE = /^[0-9a-f]{32}$/;

type Ev = { id: string; slug: string; nombre: string; paquete: string; contenido: Contenido };

async function eventoDe(token: string): Promise<Ev> {
  if (!LLAVE.test(token)) throw new Error("Este link no es válido.");
  const { data } = await db().from("eventos").select("*").eq("admin_key", token).maybeSingle();
  if (!data) throw new Error("Este link no es válido.");
  if ((data.contenido as Contenido).formulario?.cerrado) throw new Error("Este formulario ya está cerrado. Escríbenos por WhatsApp si necesitas un cambio.");
  return data as Ev;
}

const deStorage = (src: unknown) => {
  const v = String(src ?? "");
  return v.startsWith(urlPublica("")) || /^\/eventos\//.test(v) ? v.slice(0, 500) : "";
};
const foto = (f: Partial<Foto> | null | undefined): Foto | null => {
  const src = deStorage(f?.src);
  if (!src) return null;
  return { src, w: Math.min(Math.max(Math.round(Number(f?.w)) || 900, 1), 6000), h: Math.min(Math.max(Math.round(Number(f?.h)) || 1200, 1), 6000) };
};

// ---------- Fotos ----------

export async function permisoFoto(token: string): Promise<{ subir: string; publica: string } | { error: string }> {
  try {
    const ev = await eventoDe(token);
    const ruta = rutaNueva(await carpetaDe(ev.id), "fotos", "image/jpeg");
    const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(ruta);
    if (error || !data) return { error: "No se pudo preparar la subida. Inténtalo de nuevo." };
    return { subir: data.signedUrl, publica: urlPublica(ruta) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function respaldoFoto(fd: FormData): Promise<{ publica: string } | { error: string }> {
  try {
    const ev = await eventoDe(String(fd.get("token") || ""));
    const file = fd.get("archivo");
    if (!(file instanceof File) || file.type !== "image/jpeg") return { error: "No llegó la foto." };
    const ruta = rutaNueva(await carpetaDe(ev.id), "fotos", "image/jpeg");
    const { error } = await db().storage.from(BUCKET).upload(ruta, file, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (error) return { error: "No se pudo subir la foto." };
    return { publica: urlPublica(ruta) };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ---------- Guardar ----------

export type DatosCliente = {
  nombre: string;
  dia: string;
  hora: string;
  lugarNombre: string;
  lugarDireccion: string;
  mensaje: string;
  portada: Foto | null;
  fotos: { src: string; w: number; h: number; titulo: string; cuando: string }[];
  padres?: string;
  padresNovia?: string;
  padresNovio?: string;
  padrinos?: string;
  ceremonia?: { nombre: string; direccion: string; hora: string };
  dresscode?: { titulo: string; texto: string };
  regalos?: { nombre: string; numero: string; url: string }[];
  clabe?: { clabe: string; banco: string; titular: string };
  traer?: string;
  invitados: string;
  cancion: string;
  comentarios: string;
};

export async function guardarFormulario(token: string, d: DatosCliente): Promise<{ ok: true; agregados: number } | { error: string }> {
  let ev: Ev;
  try {
    ev = await eventoDe(token);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const c = ev.contenido;
  const nombre = txt(d.nombre, 80) || ev.nombre;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.dia) || !/^\d{2}:\d{2}$/.test(d.hora)) return { error: "Revisa la fecha y la hora del evento." };
  if (!txt(d.lugarNombre, 120) || !txt(d.lugarDireccion, 200)) return { error: "Escribe el lugar y la dirección del evento." };
  const clabe = d.clabe ? String(d.clabe.clabe || "").replace(/\D/g, "") : "";
  if (c.clabe && d.clabe && clabe && clabe.length !== 18) return { error: "La CLABE debe tener 18 dígitos." };

  const max = c.formulario?.maxFotos ?? fotosPorPaquete(ev.paquete);
  const lugarNombre = txt(d.lugarNombre, 120);
  const lugarDir = txt(d.lugarDireccion, 200);
  const nuevo: Contenido = {
    ...c,
    mensaje: txt(d.mensaje, 600) || c.mensaje,
    fecha: textosFecha(d.dia, d.hora),
    lugar: { nombre: lugarNombre, direccion: lugarDir, busqueda: [lugarNombre, lugarDir].filter(Boolean).join(", ") },
    portada: foto(d.portada) ? { ...foto(d.portada)!, alt: nombre } : c.portada ?? null,
    formulario: {
      ...(c.formulario || {}),
      recibido: new Date().toISOString(),
      fechaPendiente: false,
      comentarios: txt(d.comentarios, 1000),
      cancion: txt(d.cancion, 200),
    },
  };

  // Fotos: cada una se vuelve un momento de la línea del tiempo (o de la galería).
  if (max > 0) {
    const previos = new Map((c.linea || []).map((m) => [m.fotos[0]?.src, m]));
    nuevo.linea = (Array.isArray(d.fotos) ? d.fotos : []).slice(0, max).flatMap((f) => {
      const ok = foto(f);
      if (!ok) return [];
      return [{ label: txt(f.titulo, 60), when: txt(f.cuando, 60), cap: previos.get(ok.src)?.cap || "", fotos: [ok] }];
    });
  }

  // Solo las secciones que activaste en el panel
  if (c.padres && d.padres !== undefined) nuevo.padres = { ...c.padres, nombres: txt(d.padres, 1200) };
  if (c.padresNovia && d.padresNovia !== undefined) nuevo.padresNovia = { ...c.padresNovia, nombres: txt(d.padresNovia, 1200) };
  if (c.padresNovio && d.padresNovio !== undefined) nuevo.padresNovio = { ...c.padresNovio, nombres: txt(d.padresNovio, 1200) };
  if (c.padrinos && d.padrinos !== undefined) nuevo.padrinos = { ...c.padrinos, nombres: txt(d.padrinos, 1200) };
  if (c.ceremonia && d.ceremonia) nuevo.ceremonia = { ...c.ceremonia, nombre: txt(d.ceremonia.nombre, 120), direccion: txt(d.ceremonia.direccion, 200), hora: txt(d.ceremonia.hora, 30) };
  if (c.dresscode && d.dresscode) nuevo.dresscode = { titulo: txt(d.dresscode.titulo, 60), texto: txt(d.dresscode.texto, 400) };
  if (c.regalos && Array.isArray(d.regalos)) {
    nuevo.regalos = {
      ...c.regalos,
      tiendas: d.regalos.slice(0, 8).map((t) => {
        let url = txt(t?.url, 400);
        if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
        return { nombre: txt(t?.nombre, 60), numero: txt(t?.numero, 40), url: /^https?:\/\/[^\s"<>]+\.[^\s"<>]+$/i.test(url) ? url : "" };
      }).filter((t) => t.nombre || t.numero),
    };
  }
  if (c.clabe && d.clabe) nuevo.clabe = { ...c.clabe, clabe, banco: txt(d.clabe.banco, 60), titular: txt(d.clabe.titular, 80) };
  if (c.traer && d.traer !== undefined) nuevo.traer = { ...c.traer, texto: txt(d.traer, 400) };

  const sb = db();
  const { error } = await sb
    .from("eventos")
    .update({ nombre, fecha: fechaISO(d.dia, d.hora), contenido: nuevo, actualizado: new Date().toISOString() })
    .eq("id", ev.id);
  if (error) return { error: "No se pudo guardar. Inténtalo de nuevo en un momento." };

  // Invitados nuevos (los que ya existen con el mismo nombre se ignoran)
  let agregados = 0;
  const lineas = String(d.invitados || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 500);
  if (lineas.length) {
    const { data: actuales } = await sb.from("invitados").select("codigo, nombre").eq("evento_id", ev.id);
    const codigos = new Set((actuales || []).map((i) => i.codigo));
    const nombres = new Set((actuales || []).map((i) => i.nombre.toLowerCase()));
    const filas = [];
    for (const l of lineas) {
      const m = l.match(/^(.*?)[,;\t]\s*(\d{1,2})\s*$/);
      const n = txt(m ? m[1] : l, 80);
      if (!n || nombres.has(n.toLowerCase())) continue;
      nombres.add(n.toLowerCase());
      const base = codigoDesde(n);
      let codigo = base;
      for (let i = 2; codigos.has(codigo); i++) codigo = `${base}-${i}`;
      codigos.add(codigo);
      filas.push({ evento_id: ev.id, codigo, nombre: n, pases: m ? Math.min(Math.max(Number(m[2]), 1), 30) : null });
    }
    if (filas.length) {
      const { error: e2 } = await sb.from("invitados").insert(filas);
      if (!e2) agregados = filas.length;
    }
  }
  return { ok: true, agregados };
}
