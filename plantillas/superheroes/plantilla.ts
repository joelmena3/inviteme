import { secciones, type DatosPlantilla } from "../_comun/secciones";

// Acomodo del template «Superhéroes».
// `s` trae cada sección ya armada con la información del evento; aquí decides
// el orden, cuáles van y cuáles no. Las secciones opcionales que el evento no
// tenga activas llegan vacías.
// La trama de puntos y los rayos del fondo viven en estilos.css (body::before y ::after).
export default function plantilla(d: DatosPlantilla): string {
  const s = secciones(d);
  return `
${s.musica}
<main class="wrap">
  ${s.portada}
  ${s.mensaje}
  ${s.cuenta}
  ${s.familias}
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
