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
  portada?: Foto | null;     // sin portada se muestra solo el marco
  lineaEyebrow?: string;     // texto pequeño sobre la línea del tiempo
  lineaTitulo?: string;
  lineaIntro?: string;
  linea: { label: string; when: string; cap: string; fotos: Foto[] }[];
  cierre?: { label: string; when: string; titulo: string; texto: string };
  musica: string[];           // archivos de audio en orden; se repiten en ciclo
  pie: string;

  // ---- Secciones opcionales: si no existen, no aparecen en la invitación ----
  vistaFotos?: "linea" | "galeria";          // cómo se muestran las fotos de la línea del tiempo
  familiasTitulo?: string;                   // título de la sección de familias
  padres?: Grupo;
  padresNovia?: Grupo;
  padresNovio?: Grupo;
  padrinos?: Grupo;
  ceremonia?: { titulo: string; nombre: string; direccion: string; hora: string };
  dresscode?: { titulo: string; texto: string };
  regalos?: { texto: string; tiendas: { nombre: string; numero: string; url: string }[] };
  clabe?: { texto: string; titular: string; banco: string; clabe: string };
  traer?: { titulo: string; texto: string; asignaciones?: Record<string, string> };  // asignaciones: código de invitado → qué lleva

  // Formulario que llena el cliente (/datos/<llave>): estado y lo que escribió
  formulario?: { recibido?: string; cerrado?: boolean; maxFotos?: number; comentarios?: string; cancion?: string };
};

// Un renglón por persona o pareja. "Velación: Juan y Ana" muestra el rol aparte.
export type Grupo = { titulo: string; nombres: string };

export type Evento = {
  id: string;
  slug: string;
  nombre: string;
  fecha: string;              // ISO con zona horaria
  diseno: string;              // carpeta del template en plantillas/
  contenido: Contenido;
};

export type Invitado = {
  id: string | null;          // null = link general sin invitado
  codigo: string;
  nombre: string;
  pases: number | null;       // null = ilimitados
};

export type Confirmacion = { asiste: boolean; personas: number; mensaje: string | null };

// Lo que el panel de administrador lee y guarda de cada evento.
export type EventoAdmin = Evento & {
  tipo: string;
  folio: string;
  paquete: string;
  precio: number;
  cliente_nombre: string | null;
  cliente_whatsapp: string | null;
  notas: string | null;
  carpeta: string | null;
  admin_key: string;
  panel_hash?: string | null; // huella de la contraseña del panel del festejado
};

export type Pago = { id: string; monto: number; metodo: string; referencia: string | null; fecha: string; notas: string | null };
