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
// Solo funciona para los templates públicos (los privados dan 404, aunque alguien adivine
// el link). Al publicar uno en el panel, aparece solo en la portada. Usan los datos de prueba
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
  bosque: {
    portada: { src: "/ejemplo/fotos/confeti-portada.webp", w: 900, h: 1125, alt: "Niña sonriendo frente a su pastel de cumpleaños" },
  },
  "confeti-azul": {
    eyebrow: "¡Vamos a celebrar!",
    kicker: "Mi primer añito",
    mensaje: "Te invitamos a compartir con nosotros este momento tan especial en el que Mateo está cumpliendo su primer año. ¡Habrá pastel, juegos y mucha diversión!",
    portada: { src: "/ejemplo/fotos/confeti-azul-portada.webp", w: 900, h: 1125, alt: "Niño sonriendo sentado entre hojas de otoño" },
    // Las mismas fotos de prueba, con los textos en masculino
    linea: completo.ev.contenido.linea.map((m) => ({
      ...m,
      label: m.label === "Recién nacida" ? "Recién nacido" : m.label,
      cap: ({ "Lista para jugar.": "Listo para jugar.", "Princesa de cuento.": "Rey de la casa." } as Record<string, string>)[m.cap] ?? m.cap,
    })),
    pie: "Mi primer añito",
  },
  superheroes: {
    eyebrow: "¡Misión: celebrar!",
    kicker: "Mis 8 años",
    mensaje: "¡Atención, equipo! Se necesitan superhéroes para una misión muy importante: celebrar mi cumpleaños. Trae tu capa, tu mejor sonrisa y muchas ganas de jugar.",
    portada: { src: "/ejemplo/fotos/superheroes-portada.webp", w: 614, h: 768, alt: "Niño disfrazado de superhéroe con capa y antifaz" },
    lugar: { nombre: "Salón Ciudad Héroe", direccion: "Av. Las Torres 200, Toluca, Estado de México", busqueda: "Toluca, Estado de México" },
    lineaEyebrow: "Galería",
    lineaTitulo: "Mis aventuras",
    lineaIntro: "Toca cualquier foto para verla en grande.",
    vistaFotos: "galeria",
    linea: [
      { label: "En el parque", when: "Mis 8 años", cap: "", fotos: [{ src: "/ejemplo/fotos/superheroes-01-parque.webp", w: 1024, h: 768 }] },
      { label: "Listo para la misión", when: "Mis 8 años", cap: "", fotos: [{ src: "/ejemplo/fotos/superheroes-02-retrato.webp", w: 576, h: 720 }] },
      { label: "Con mi capa", when: "Mis 8 años", cap: "", fotos: [{ src: "/ejemplo/fotos/superheroes-03-capa.webp", w: 700, h: 568 }] },
    ],
    cierre: { label: "8 años", when: "", titulo: "¡Misión cumplida!", texto: "Gracias por ser parte de mi equipo." },
    dresscode: { titulo: "¡Ven disfrazado!", texto: "Trae el disfraz de tu superhéroe favorito." },
    ceremonia: undefined,
    padrinos: undefined,
    traer: { titulo: "¿Qué te toca llevar?", texto: "Algo para compartir con el equipo", asignaciones: { PEREZ: "Palomitas" } },
    pie: "Mis 8 años",
  },
  posada: {
    eyebrow: "¡Ya llegó diciembre!",
    kicker: "Te invitamos a nuestra",
    mensaje: "Este año queremos cerrar con broche de oro y celebrarlo contigo. Habrá ponche, piñata, villancicos, intercambio de regalos y mucha alegría. ¡No faltes!",
    portada: { src: "/ejemplo/fotos/posada-portada.webp", w: 900, h: 1125, alt: "Amigos celebrando con lentes de corazón" },
    lugar: { nombre: "Terraza La Estrella", direccion: "Calle Morelos 120, Centro, Toluca, Estado de México", busqueda: "Toluca, Estado de México" },
    lineaEyebrow: "Galería",
    lineaTitulo: "La posada del año pasado",
    lineaIntro: "Toca cualquier foto para verla en grande.",
    vistaFotos: "galeria",
    linea: [
      { label: "Todos juntos", when: "Posada", cap: "", fotos: [{ src: "/ejemplo/fotos/posada-01-grupo.webp", w: 1200, h: 900 }] },
      { label: "Las amigas", when: "Posada", cap: "", fotos: [{ src: "/ejemplo/fotos/posada-02-amigas.webp", w: 720, h: 900 }] },
      { label: "¡Salud!", when: "Posada", cap: "", fotos: [{ src: "/ejemplo/fotos/posada-03-brindis.webp", w: 720, h: 900 }] },
    ],
    cierre: { label: "Posada", when: "", titulo: "¡Feliz Navidad!", texto: "Gracias por celebrar con nosotros." },
    padres: undefined,
    padrinos: undefined,
    ceremonia: undefined,
    dresscode: { titulo: "Suéter navideño", texto: "Ven con tu suéter más navideño. ¡Habrá premio al más original!" },
    regalos: undefined,
    clabe: undefined,
    traer: { titulo: "¿Qué te toca llevar?", texto: "Un regalo para el intercambio (de $300 aprox.)", asignaciones: { PEREZ: "Ponche" } },
    pie: "¡Feliz Navidad y próspero Año Nuevo!",
  },
  "xv-elegante": {
    eyebrow: "Te invito a celebrar",
    kicker: "Mis XV años",
    mensaje: "Hay momentos que se guardan para siempre en el corazón. Hoy cierro una etapa llena de sueños y comienzo otra con ilusión. Me haría muy feliz que me acompañes a celebrar mis quince años.",
    saludo: { activo: true, texto: "Será un honor compartir esta noche tan especial contigo." },
    portada: { src: "/ejemplo/fotos/xv-portada.webp", w: 900, h: 1125, alt: "Fernanda con su vestido de XV años" },
    lineaEyebrow: "Galería",
    lineaTitulo: "Mis XV en fotos",
    lineaIntro: "Algunos momentos que quiero compartir contigo. Toca cualquier foto para verla en grande.",
    vistaFotos: "galeria",
    linea: [
      { label: "Mi sesión de XV", when: "Hacienda", cap: "", fotos: [{ src: "/ejemplo/fotos/xv-01-patio.webp", w: 1200, h: 900 }] },
      { label: "Retrato", when: "Mis XV años", cap: "", fotos: [{ src: "/ejemplo/fotos/xv-02-retrato.webp", w: 720, h: 900 }] },
      { label: "Mi ramo", when: "Mis XV años", cap: "", fotos: [{ src: "/ejemplo/fotos/xv-03-ramo.webp", w: 720, h: 900 }] },
      { label: "Mi vestido", when: "Mis XV años", cap: "", fotos: [{ src: "/ejemplo/fotos/xv-04-vestido.webp", w: 720, h: 900 }] },
      { label: "Bugambilias", when: "Mis XV años", cap: "", fotos: [{ src: "/ejemplo/fotos/xv-05-arco.webp", w: 720, h: 900 }] },
    ],
    cierre: { label: "Mis XV", when: "", titulo: "¡Que comience la fiesta!", texto: "Gracias por ser parte de mi historia." },
    pie: "Mis XV años",
    familiasTitulo: "Con la bendición de Dios",
    padres: { titulo: "Mis papás", nombres: "Laura Martínez y Ricardo Hernández" },
    padrinos: { titulo: "Mis padrinos", nombres: "De velación: Patricia Gómez y Fernando Ruiz\nDe anillo: Mariana Torres\nDe última muñeca: Daniela López" },
    ceremonia: { titulo: "Misa de acción de gracias", nombre: "Parroquia del Sagrado Corazón", direccion: "Centro, Toluca, Edo. Méx.", hora: "7:00 pm" },
    lugar: { nombre: "Salón Los Candiles", direccion: "Paseo Tollocan 456, Toluca, Estado de México", busqueda: "Toluca, Estado de México" },
    dresscode: { titulo: "Formal", texto: "Con cariño te pedimos evitar el color dorado, reservado para la quinceañera." },
    regalos: { texto: "Tu presencia es mi mejor regalo. Si deseas tener un detalle conmigo:", tiendas: [{ nombre: "Liverpool", numero: "51234567", url: "https://www.liverpool.com.mx" }] },
    clabe: { texto: "Si prefieres, puedes hacer una transferencia.", titular: "Laura Martínez", banco: "BBVA", clabe: "012180000000000000" },
    traer: undefined,
  },
};

// Canción de todos los ejemplos del catálogo (suena al tocar el botón de Música).
const MUSICA_EJEMPLOS = ["/ejemplo/musica/feels-so-good.mp3"];

// Nombre del festejado y hora de la fiesta en el ejemplo, si el template necesita otros.
const NOMBRES: Record<string, string> = { "xv-elegante": "Fernanda", "confeti-azul": "Mateo", superheroes: "Santiago", posada: "Posada Navideña" };
const HORAS: Record<string, string> = { "xv-elegante": "20:30", superheroes: "16:00", posada: "20:00" };

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
  let publica = false;
  try {
    publica = await esPublica(id);
  } catch {
    return new Response("No se pudo cargar el ejemplo. Inténtalo en un momento.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!publica) return new Response("Este ejemplo no está disponible.", { status: 404, headers: { "Cache-Control": "no-store" } });
  const nombre = CATALOGO.find((p) => p.id === id)!.nombre;

  const base = completo as unknown as DatosPlantilla;
  const dia = sabadoProximo();
  const hora = HORAS[id] ?? "12:00";
  const datos: DatosPlantilla = {
    ...base,
    ev: {
      ...base.ev,
      nombre: NOMBRES[id] ?? base.ev.nombre,
      fecha: fechaISO(dia, hora),
      contenido: { ...base.ev.contenido, ...AJUSTES[id], musica: MUSICA_EJEMPLOS, fecha: textosFecha(dia, hora) },
    },
  };

  return new Response(paginaDeEjemplo(id, datos, `Ejemplo · Diseño ${nombre}`), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60", // al hacerlo privado deja de verse en ≤ 1 min
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
