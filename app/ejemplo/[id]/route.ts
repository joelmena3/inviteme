import type { DatosPlantilla } from "@/plantillas/_comun/secciones";
import type { Contenido } from "@/lib/tipos";
import { paginaDeEjemplo } from "@/lib/vista-plantilla";
import { esPublica } from "@/lib/portada";
import { CATALOGO } from "@/plantillas/catalogo";
import { fechaISO, partesFecha, textosFecha } from "@/lib/util";
import completo from "@/scripts/pruebas/evento-completo.json";

// Ejemplos públicos que se ven en el selector de diseños de la portada (inviteme.mx/#ejemplos).
//   inviteme.mx/ejemplo/confeti
//   inviteme.mx/ejemplo/bosque
// Funciona para cualquier template de plantillas/catalogo.ts que no esté oculto, así que
// uno nuevo aparece solo en la portada. Usan los datos de prueba
// (scripts/pruebas/evento-completo.json), no tocan la base de datos y la confirmación
// de asistencia se simula.

export const dynamic = "force-dynamic";

// Ajustes opcionales por template para que su ejemplo se vea mejor (foto de portada, textos).
// Un template sin ajustes usa los datos de prueba tal cual.
const AJUSTES: Record<string, Partial<Contenido>> = {
  confeti: {
    eyebrow: "¡Vamos a celebrar!",
    kicker: "¡Es mi cumpleaños!",
    mensaje: "Te invitamos a celebrar con nosotros el cumpleaños de Sofi. ¡Habrá pastel, juegos y mucha diversión!",
    portada: { src: "/ejemplo/fotos/confeti-portada.webp", w: 900, h: 1125, alt: "Niña sonriendo frente a su pastel de cumpleaños" },
  },
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
  if (!esPublica(id)) return new Response("Este ejemplo no está disponible.", { status: 404 });
  const nombre = CATALOGO.find((p) => p.id === id)!.nombre;

  const base = completo as unknown as DatosPlantilla;
  const dia = sabadoProximo();
  const hora = "12:00";
  const datos: DatosPlantilla = {
    ...base,
    ev: {
      ...base.ev,
      fecha: fechaISO(dia, hora),
      contenido: { ...base.ev.contenido, ...AJUSTES[id], fecha: textosFecha(dia, hora) },
    },
  };

  return new Response(paginaDeEjemplo(id, datos, `Ejemplo · Diseño ${nombre}`), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
