import "server-only";
import { randomBytes } from "crypto";
import { db } from "./supabase";

// Fotos y música de los eventos viven en Supabase Storage, en la carpeta
// pública "invitaciones". Cada evento tiene su propia subcarpeta con un
// sufijo al azar (majo-k3x9q2fz) para que nadie pueda adivinar la de otro.

export const BUCKET = "invitaciones";

export const TIPOS_ARCHIVO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
} as const;
export type Mime = keyof typeof TIPOS_ARCHIVO;
export const esMime = (m: string): m is Mime => m in TIPOS_ARCHIVO;

const azar = (n: number) => {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789";
  return Array.from(randomBytes(n), (b) => abc[b % abc.length]).join("");
};

export function urlPublica(ruta: string): string {
  return db().storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

// Devuelve la carpeta del evento; la crea (en la base) si todavía no tiene.
export async function carpetaDe(eventoId: string): Promise<string> {
  const sb = db();
  const { data, error } = await sb.from("eventos").select("slug, carpeta").eq("id", eventoId).maybeSingle();
  if (error || !data) throw new Error("No encontré el evento.");
  if (data.carpeta) return data.carpeta;
  const carpeta = `${data.slug}-${azar(8)}`;
  const { error: e2 } = await sb.from("eventos").update({ carpeta }).eq("id", eventoId).is("carpeta", null);
  if (e2) throw new Error("No se pudo preparar la carpeta del evento.");
  const { data: otra } = await sb.from("eventos").select("carpeta").eq("id", eventoId).maybeSingle();
  return otra?.carpeta || carpeta;
}

export function rutaNueva(carpeta: string, tipo: "fotos" | "musica", mime: Mime): string {
  return `${carpeta}/${tipo}/${Date.now().toString(36)}-${azar(5)}.${TIPOS_ARCHIVO[mime]}`;
}
