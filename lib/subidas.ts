// Subida de fotos desde el navegador (panel de administrador y formulario del cliente).
// Reduce cada foto a máx. 1600 px en JPG y la sube directo a Supabase Storage
// con un permiso de un solo uso; si eso falla, la manda por el servidor.

export type Permiso = { subir: string; publica: string } | { error: string };
export type Respaldo = (fd: FormData) => Promise<{ publica: string } | { error: string }>;
const LIMITE_RESPALDO = 4 * 1024 * 1024;

export async function comprimir(file: File): Promise<{ blob: Blob; w: number; h: number }> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`No pude abrir "${file.name}". Usa fotos JPG o PNG (las del iPhone en HEIC, compártelas primero como JPG).`);
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

export async function subirFoto(file: File, permiso: () => Promise<Permiso>, respaldo: Respaldo, extra: Record<string, string>) {
  const { blob, w, h } = await comprimir(file);
  const p = await permiso();
  if ("error" in p) throw new Error(p.error);
  try {
    const r = await fetch(p.subir, { method: "PUT", headers: { "content-type": "image/jpeg", "cache-control": "max-age=31536000" }, body: blob });
    if (r.ok) return { src: p.publica, w, h };
  } catch {
    /* probamos por el servidor */
  }
  if (blob.size > LIMITE_RESPALDO) throw new Error("No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.");
  const fd = new FormData();
  for (const [k, v] of Object.entries(extra)) fd.append(k, v);
  fd.append("archivo", new File([blob], "foto.jpg", { type: "image/jpeg" }));
  const r2 = await respaldo(fd);
  if ("error" in r2) throw new Error(r2.error);
  return { src: r2.publica, w, h };
}
