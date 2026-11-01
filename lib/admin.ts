import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Acceso al panel de administrador con una sola contraseña.
// La contraseña vive solo en Vercel (variable ADMIN_PASSWORD). Al entrar se
// guarda una cookie firmada con ella; si cambias la contraseña en Vercel,
// todas las sesiones abiertas se cierran solas.

const COOKIE = "im_admin";
const DIAS = 30;

function firma(): string | null {
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!pass || pass.length < 8) return null;
  return createHmac("sha256", pass).update("inviteme-admin-v1").digest("hex");
}

const iguales = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigurado = () => firma() !== null;

export async function esAdmin(): Promise<boolean> {
  const f = firma();
  if (!f) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && iguales(c, f);
}

// Para páginas: si no hay sesión, manda a la pantalla de entrada.
export async function exigirAdmin(): Promise<void> {
  if (!(await esAdmin())) redirect("/admin/entrar");
}

export async function abrirSesion(intento: string): Promise<boolean> {
  const pass = process.env.ADMIN_PASSWORD?.trim();
  const f = firma();
  if (!pass || !f) return false;
  // Compara huellas del mismo largo para no filtrar información por tiempos.
  const h = (s: string) => createHmac("sha256", "inviteme-login").update(s).digest("hex");
  if (!iguales(h(intento.trim()), h(pass))) return false;
  (await cookies()).set(COOKIE, f, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/", // también abre los paneles de los festejados
    maxAge: DIAS * 24 * 60 * 60,
  });
  return true;
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/" });
}
