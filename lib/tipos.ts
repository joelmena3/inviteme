// Estructura de una invitación. En la base de datos, `contenido` vive como JSON
// dentro de la tabla `eventos`; así cada cliente puede tener secciones distintas
// sin cambiar el código del motor.

export type Foto = { src: string; w: number; h: number; alt?: string };

export type Contenido = {
  eyebrow: string;            // texto pequeño arriba de la foto
  kicker: string;             // "Mi primer añito"
  mensaje: string;            // mensaje para los invitados
  fecha: { dia: string; numero: string; mes: string; hora: string; larga: string };
  lugar: { nombre: string; direccion: string; busqueda: string };
  portada: Foto;
  lineaTitulo?: string;
  lineaIntro?: string;
  linea: { label: string; when: string; cap: string; fotos: Foto[] }[];
  cierre?: { label: string; when: string; titulo: string; texto: string };
  musica: string[];           // archivos de audio en orden; se repiten en ciclo
  pie: string;
};

export type Evento = {
  id: string;
  slug: string;
  nombre: string;
  fecha: string;              // ISO con zona horaria
  diseno: "bosque" | "picnic" | "botanico";
  contenido: Contenido;
};

export type Invitado = {
  id: string | null;          // null = link general sin invitado
  codigo: string;
  nombre: string;
  pases: number | null;       // null = ilimitados
};

export type Confirmacion = { asiste: boolean; personas: number; mensaje: string | null };
