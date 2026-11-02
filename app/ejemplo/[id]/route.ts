import type { DatosPlantilla } from "@/plantillas/_comun/secciones";
import type { Contenido } from "@/lib/tipos";
import { paginaDeEjemplo } from "@/lib/vista-plantilla";
import { fechaISO, partesFecha, textosFecha } from "@/lib/util";
import completo from "@/scripts/pruebas/evento-completo.json";

// Ejemplos públicos que se ven en la portada (inviteme.mx/#ejemplos).
//   inviteme.mx/ejemplo/confeti
//   inviteme.mx/ejemplo/bosque
// Usan los datos de prueba (scripts/pruebas/evento-completo.json), no tocan la base
// de datos y la confirmación de asistencia se simula.
// Para mostrar otro template en la portada: agrégalo aquí y en public/inicio.html.

export const dynamic = "force-dynamic";

// Textos que cambian por ejemplo para que cada uno se lea natural con su diseño.
const EJEMPLOS: Record<string, { titulo: string; contenido?: Partial<Contenido> }> = {
  confeti: { titulo: "Ejemplo · Fiesta infantil", contenido: { eyebrow: "¡Vamos a celebrar!" } },
  bosque: { titulo: "Ejemplo · Primer año" },
};

// La fecha del ejemplo siempre cae en un sábado a unas semanas de hoy,
// para que la cuenta regresiva nunca llegue a cero.
function sabadoProximo(): string {
  const hoy = partesFecha(new Date().toISOString()).dia;
  const [a, m, d] = hoy.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d + 21));
  f.setUTCDate(f.getUTCDate() + ((6 - f.getUTCDay() + 7) % 7));
  return f.toISOString().slice(0, 10);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ejemplo = EJEMPLOS[id];
  if (!ejemplo) return new Response("Este ejemplo todavía no está disponible.", { status: 404 });

  const base = completo as unknown as DatosPlantilla;
  const dia = sabadoProximo();
  const hora = "12:00";
  const datos: DatosPlantilla = {
    ...base,
    ev: {
      ...base.ev,
      fecha: fechaISO(dia, hora),
      contenido: { ...base.ev.contenido, ...ejemplo.contenido, fecha: textosFecha(dia, hora) },
    },
  };

  return new Response(paginaDeEjemplo(id, datos, ejemplo.titulo), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
