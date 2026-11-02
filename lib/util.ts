// Utilidades compartidas por el panel del festejado y el panel de administrador.
// Sin dependencias de servidor: se pueden usar en el navegador también.

import { CATALOGO } from "@/plantillas/catalogo";

// Dirección pública del sitio. Todos los links que se comparten (invitaciones, panel,
// formulario, mensajes de WhatsApp) salen de aquí, sin importar desde dónde se abra el admin.
export const SITIO = (process.env.NEXT_PUBLIC_SITE_URL || "https://inviteme.mx").replace(/\/+$/, "");
export const DOMINIO = SITIO.replace(/^https?:\/\//, "");

export const ZONA = "America/Mexico_City";
export const OFFSET = "-06:00"; // México ya no cambia de horario

// "Tía Ale y Gussy" → "tia-ale-y-gussy"
export function codigoDesde(nombre: string, respaldo = "invitado"): string {
  return (
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || respaldo
  );
}

// Links que no pueden usarse como evento porque ya son partes del sitio.
export const SLUGS_RESERVADOS = new Set([
  "admin", "api", "motor", "ejemplo", "eventos", "pagos", "datos", "plantillas", "inicio", "inicio-html", "panel", "next", "favicon-ico", "robots-txt", "sitemap-xml",
]);

export function slugValido(slug: string): string | null {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "El link solo puede tener letras minúsculas, números y guiones.";
  if (slug.length < 2 || slug.length > 40) return "El link debe tener entre 2 y 40 caracteres.";
  if (SLUGS_RESERVADOS.has(slug)) return "Ese link está reservado por el sitio. Elige otro.";
  return null;
}

// ---------- Fechas ----------

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// "2026-11-28" + "12:00" → "2026-11-28T12:00:00-06:00"
export const fechaISO = (dia: string, hora: string) => `${dia}T${hora}:00${OFFSET}`;

// ISO guardado en la base → { dia: "2026-11-28", hora: "12:00" } en hora de México
export function partesFecha(iso: string): { dia: string; hora: string } {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const v = (t: string) => p.find((x) => x.type === t)?.value || "";
  return { dia: `${v("year")}-${v("month")}-${v("day")}`, hora: `${v("hour")}:${v("minute")}` };
}

// Textos de fecha que muestra la invitación
export function textosFecha(dia: string, hora: string) {
  const [a, m, d] = dia.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  const semana = DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return {
    dia: semana,
    numero: String(d),
    mes: MESES_CORTOS[m - 1],
    hora: `${h12}:${String(min).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`,
    larga: `${semana} ${d} de ${MESES[m - 1]} de ${a}`,
  };
}

// ---------- Catálogos ----------

// Los templates viven en plantillas/<nombre>/ y se registran en plantillas/catalogo.ts
export const DISENOS = CATALOGO.map((p) => ({ id: p.id, nombre: p.nombre, desc: p.descripcion, muestra: p.muestra, oculto: !!p.oculto }));

export const PAQUETES = [
  { id: "express", nombre: "Express", precio: 500 },
  { id: "wow", nombre: "Wow", precio: 999 },
  { id: "fotos", nombre: "Edición de fotos", precio: 0 },
  { id: "cortesia", nombre: "Cortesía", precio: 0 },
  { id: "otro", nombre: "Otro", precio: 0 },
] as const;

export const METODOS = [
  { id: "mercadopago", nombre: "Mercado Pago" },
  { id: "transferencia", nombre: "Transferencia" },
  { id: "efectivo", nombre: "Efectivo" },
  { id: "otro", nombre: "Otro" },
] as const;

// Textos de arranque según el tipo de evento. Se pueden cambiar en el editor.
export const TIPOS = [
  { id: "primer-ano", nombre: "Primer año", kicker: "Mi primer añito", eyebrow: "Una fiesta muy especial", linea: "Mi primer año", lineaTitulo: "Así he crecido",
    mensaje: "Te invitamos a compartir con nosotros este momento tan especial." },
  { id: "cumpleanos-nino", nombre: "Cumpleaños de niño", kicker: "Mi cumpleaños", eyebrow: "¡Vamos a celebrar!", linea: "Mis momentos", lineaTitulo: "Así he crecido",
    mensaje: "¡Ven a celebrar conmigo! Habrá juegos, pastel y mucha diversión." },
  { id: "cumpleanos-nina", nombre: "Cumpleaños de niña", kicker: "Mi cumpleaños", eyebrow: "¡Vamos a celebrar!", linea: "Mis momentos", lineaTitulo: "Así he crecido",
    mensaje: "¡Ven a celebrar conmigo! Habrá juegos, pastel y mucha diversión." },
  { id: "bautizo", nombre: "Bautizo", kicker: "Mi bautizo", eyebrow: "Con la bendición de Dios", linea: "Nuestra alegría", lineaTitulo: "Momentos de luz",
    mensaje: "Con mucha alegría te invitamos a acompañarnos en el bautizo de nuestro hijo." },
  { id: "boda", nombre: "Boda", kicker: "Nos casamos", eyebrow: "Juntos para siempre", linea: "Nuestra historia", lineaTitulo: "Cómo empezó todo",
    mensaje: "Queremos compartir contigo el día más importante de nuestras vidas." },
  { id: "xv", nombre: "XV años", kicker: "Mis XV años", eyebrow: "Una noche inolvidable", linea: "Mi historia", lineaTitulo: "Así he crecido",
    mensaje: "Te invito a celebrar conmigo una noche muy especial." },
  { id: "posada", nombre: "Posada", kicker: "Posada navideña", eyebrow: "Ven a pedir posada", linea: "Recuerdos", lineaTitulo: "Navidades juntos",
    mensaje: "Te esperamos para celebrar juntos estas fiestas con piñata, ponche y mucha alegría." },
  { id: "baby-shower", nombre: "Baby shower", kicker: "Baby shower", eyebrow: "Muy pronto llegará", linea: "La espera", lineaTitulo: "Contando los días",
    mensaje: "Acompáñanos a celebrar la llegada de nuestro bebé." },
  { id: "otro", nombre: "Otro", kicker: "Te invitamos", eyebrow: "Una celebración especial", linea: "Momentos", lineaTitulo: "Nuestros recuerdos",
    mensaje: "Nos encantaría que nos acompañes." },
] as const;

export const nombreDe = <T extends { id: string; nombre: string }>(lista: readonly T[], id: string | null | undefined) =>
  lista.find((x) => x.id === id)?.nombre || id || "—";

// ---------- Dinero ----------

export const pesos = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export function estadoPago(precio: number, pagado: number): { t: string; c: "ok" | "warn" | "no" | "neutral" } {
  if (precio <= 0) return { t: pagado > 0 ? "Pagado" : "Sin costo", c: "neutral" };
  if (pagado >= precio) return { t: "Pagado", c: "ok" };
  if (pagado > 0) return { t: "Anticipo", c: "warn" };
  return { t: "Pendiente", c: "no" };
}

// ---------- WhatsApp ----------

// "55 1234 5678" → "525512345678" (agrega lada de México si son 10 dígitos)
export function waNumero(tel: string | null | undefined): string {
  const d = String(tel || "").replace(/\D/g, "");
  return d.length === 10 ? `52${d}` : d;
}
// Usamos api.whatsapp.com en lugar de wa.me: wa.me a veces rompe los emojis (los
// muestra como �) al abrir WhatsApp Web o la app de escritorio.
export function waLink(tel: string | null | undefined, texto: string) {
  const n = waNumero(tel);
  return `https://api.whatsapp.com/send?${n ? `phone=${n}&` : ""}text=${encodeURIComponent(texto)}`;
}

export const MI_WHATSAPP = "525522678448";

// Fotos que el cliente puede subir además de la portada, según su paquete
export const fotosPorPaquete = (paquete: string) => (paquete === "express" ? 0 : 15);
