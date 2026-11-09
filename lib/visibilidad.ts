import "server-only";
import { db } from "./supabase";
import { CATALOGO } from "@/plantillas/catalogo";

// Qué templates son públicos (salen en inviteme.mx) y cuáles privados (solo el panel).
// Vive en Supabase (tabla `plantillas`, ver supabase/05_plantillas_publicas.sql) para
// que lo cambies con un botón en el panel, sin tocar código.
//   - Un template sin renglón en la tabla es privado: uno nuevo no sale en la web solo.
//   - Un template oculto (oculto: true en su info.ts) nunca es público.
// Los privados se pueden usar en cualquier evento; sus invitaciones funcionan igual.

export type Visibilidad = {
  publicas: Set<string>;
  // false = todavía no se corre el SQL; mientras tanto todo lo no oculto es público, como antes
  configurada: boolean;
};

// La tabla todavía no existe (según la versión de Supabase llega uno u otro aviso)
const sinTabla = (e: { code?: string; message?: string }) =>
  e.code === "42P01" || e.code === "PGRST205" || /plantillas.*(does not exist|schema cache)/i.test(e.message || "");

const noOcultos = () => CATALOGO.filter((p) => !p.oculto).map((p) => p.id);

export async function leerVisibilidad(): Promise<Visibilidad> {
  const { data, error } = await db().from("plantillas").select("id, publica");
  if (error) {
    if (sinTabla(error)) return { publicas: new Set(noOcultos()), configurada: false };
    // Cualquier otra falla: mejor no mostrar nada que mostrar un diseño privado en la web.
    throw new Error("No se pudo leer qué templates son públicos.");
  }
  const marcadas = new Set((data || []).filter((r) => r.publica).map((r) => String(r.id)));
  return { publicas: new Set(noOcultos().filter((id) => marcadas.has(id))), configurada: true };
}

export async function cambiarPublica(id: string, publica: boolean): Promise<{ ok: true } | { error: string }> {
  const p = CATALOGO.find((x) => x.id === id);
  if (!p) return { error: "Ese template no existe." };
  if (publica && p.oculto) return { error: "Ese template está oculto: primero vuelve a mostrarlo." };
  const { error } = await db()
    .from("plantillas")
    .upsert({ id, publica, actualizado: new Date().toISOString() }, { onConflict: "id" });
  if (error) {
    if (sinTabla(error))
      return { error: "Primero corre el archivo supabase/05_plantillas_publicas.sql en Supabase." };
    return { error: "No se pudo guardar. Inténtalo de nuevo." };
  }
  return { ok: true };
}
