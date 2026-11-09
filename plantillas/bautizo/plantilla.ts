import { esc, secciones, type DatosPlantilla } from "../_comun/secciones";

// Acomodo del template «Bautizo»: una hoja de invitación marfil con marco dorado,
// rosas en las esquinas, cruz arriba, la fila de símbolos (copa, concha, Biblia y vela) y papás | padrinos en dos columnas con una paloma al centro.
// `s` trae cada sección ya armada con la información del evento. La portada y el pie
// están escritos aquí mismo (con los mismos datos, siempre pasados por esc()).
export default function plantilla(d: DatosPlantilla): string {
  // Fotos siempre en galería; si el evento no trae su propio texto, arriba dice "Galería".
  const c0 = d.ev.contenido;
  const s = secciones({ ...d, ev: { ...d.ev, contenido: { ...c0, vistaFotos: "galeria", lineaEyebrow: c0.lineaEyebrow ?? "Galería" } } });
  const { ev } = d;
  const c = ev.contenido;

  // ---------- Portada ----------
  const foto = c.portada?.src
    ? `<div class="stage">
      <div class="aro"><img src="${esc(c.portada.src)}" alt="${esc(c.portada.alt || ev.nombre)}" width="${esc(c.portada.w)}" height="${esc(c.portada.h)}"></div>
      <span class="flor l" data-art="izquierda" aria-hidden="true"></span>
      <span class="flor r" data-art="derecha" aria-hidden="true"></span>
    </div>`
    : "";
  const portada = `
  <section class="hero" aria-label="Portada">
    <span class="rama l" data-art="rama" aria-hidden="true"></span>
    <span class="rama r" data-art="rama" aria-hidden="true"></span>
    <span class="cruz" data-art="adorno" aria-hidden="true"></span>
    ${c.eyebrow ? `<p class="eyebrow">${esc(c.eyebrow)}</p>` : ""}
    ${c.kicker ? `<p class="kicker">${esc(c.kicker)}</p>` : ""}
    ${foto}
    <h1 class="name">${esc(ev.nombre)}</h1>${s.saludo}
    <div class="fecha" aria-label="${esc(c.fecha.larga)}, ${esc(c.fecha.hora)}">
      <span class="f-lado">${esc(c.fecha.dia)}</span>
      <span class="f-centro"><small>${esc(c.fecha.mes)}</small><b>${esc(c.fecha.numero)}</b></span>
      <span class="f-lado">${esc(c.fecha.hora)}</span>
    </div>
    <div class="simbolos" aria-hidden="true">
      <span data-art="copa"></span><i></i><span data-art="concha"></span><i></i><span data-art="biblia"></span><i></i><span data-art="vela"></span>
    </div>
  </section>`;

  // ---------- Papás | padrinos ----------
  // Si hay exactamente dos grupos, van lado a lado con la paloma dorada al centro.
  const conNombres = [c.padres, c.padresNovia, c.padresNovio, c.padrinos].filter((g) => g && String(g.nombres || "").trim()).length;
  const familias = conNombres === 2
    ? s.familias.replace('<div class="card fams">', '<div class="card fams dos"><span class="fams-paloma" data-art="centro" aria-hidden="true"></span>')
    : s.familias;

  // ---------- Pie con rosas en las esquinas de abajo ----------
  const pie = `
  <footer class="pie">
    <span class="adorno-pie" data-art="copa" aria-hidden="true"></span>
    <span class="sig">${esc(ev.nombre)}</span>
    ${c.pie ? `<span class="pie-txt">${esc(c.pie)}</span>` : ""}
    <span class="rama bl" data-art="rama" aria-hidden="true"></span>
    <span class="rama br" data-art="rama" aria-hidden="true"></span>
  </footer>`;

  return `
${s.musica}
<main class="wrap">
  ${portada}
  ${s.mensaje}
  ${familias}
  ${s.cuenta}
  ${s.lugar}
  ${s.dresscode}
  ${s.fotos}
  ${s.regalos}
  ${s.traer}
  ${s.confirmacion}
  ${pie}
</main>
${s.visor}
${s.datos}`;
}
