import { secciones, type DatosPlantilla } from "../_comun/secciones";

// Acomodo del template «XV Elegante».
// `s` trae cada sección ya armada con la información del evento; aquí decides
// el orden, cuáles van y cuáles no. También puedes escribir tu propio HTML
// usando los datos directamente: d.ev (evento), d.ev.contenido (textos, fotos,
// secciones opcionales), d.inv (invitado) y d.previa (su última respuesta).
// Las secciones opcionales que el evento no tenga activas llegan vacías.
export default function plantilla(d: DatosPlantilla): string {
  // Este diseño siempre muestra las fotos en galería (cuadrícula), sin importar
  // la opción de vista elegida en el panel. Si el evento no trae su propio texto
  // arriba de las fotos, dice "Galería" en lugar de "Mi primer año".
  const c = d.ev.contenido;
  const s = secciones({ ...d, ev: { ...d.ev, contenido: { ...c, vistaFotos: "galeria", lineaEyebrow: c.lineaEyebrow ?? "Galería" } } });
  return `
${s.musica}
<main class="wrap">
  ${s.portada}
  ${s.mensaje}
  ${s.familias}
  ${s.cuenta}
  ${s.lugar}
  ${s.dresscode}
  ${s.fotos}
  ${s.regalos}
  ${s.traer}
  ${s.confirmacion}
  ${s.pie}
</main>
${s.visor}
${s.datos}`;
}
