import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { esAdmin } from "./admin";

// Contraseña del panel del festejado, una por evento.
// En la base solo se guarda una huella (scrypt), nunca la contraseña.
// Si el evento tiene contraseña, el link del panel por sí solo ya no basta.
// Tú, con tu sesión de administrador, puedes entrar a cualquier panel.

export const CLAVE_MIN = 6;

export function huellaClave(clave: string): string {
  const sal = randomBytes(16).toString("hex");
  return `scrypt$${sal}$${scryptSync(clave, sal, 32).toString("hex")}`;
}

export function claveCorrecta(clave: string, huella: string): boolean {
  const [alg, sal, h] = huella.split("$");
  if (alg !== "scrypt" || !sal || !h) return false;
  const a = scryptSync(clave, sal, 32);
  const b = Buffer.from(h, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

const galleta = (eventoId: string) => `im_panel_${eventoId}`;
// La firma depende de la huella: si cambias la contraseña, las sesiones viejas se cierran.
const firma = (huella: string) => createHmac("sha256", huella).update("panel-v1").digest("hex");

export async function abrirSesionPanel(eventoId: string, huella: string) {
  (await cookies()).set(galleta(eventoId), firma(huella), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 24 * 60 * 60,
  });
}

export async function cerrarSesionPanel(eventoId: string) {
  (await cookies()).delete({ name: galleta(eventoId), path: "/" });
}

type EventoAcceso = { id: string; admin_key: string; panel_hash?: string | null };

export async function puedeEntrar(ev: EventoAcceso, key?: string | null): Promise<boolean> {
  if (await esAdmin()) return true;
  if (ev.panel_hash) {
    const c = (await cookies()).get(galleta(ev.id))?.value;
    const f = firma(ev.panel_hash);
    return !!c && c.length === f.length && timingSafeEqual(Buffer.from(c), Buffer.from(f));
  }
  // Eventos sin contraseña: funciona como antes, con la llave del link
  return !!key && key === ev.admin_key;
}
