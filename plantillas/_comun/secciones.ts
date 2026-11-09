import type { Confirmacion, Evento, Grupo, Invitado } from "@/lib/tipos";

// Piezas de HTML que todos los templates comparten, ya llenas con la
// información del evento que capturas en el panel de administrador.
// Cada template (plantillas/<nombre>/plantilla.ts) decide en qué orden
// las acomoda, cuáles usa, o si escribe su propio HTML con los mismos datos.
//
// Los dibujos se marcan con data-art="izquierda|derecha|centro|adorno|hoja|rama"
// y cada template los dibuja a su manera en su archivo dibujos.js.


export type DatosPlantilla = { ev: Evento; inv: Invitado; previa: Confirmacion | null };

export type Secciones = {
  musica: string; portada: string; saludo: string; mensaje: string; familias: string; cuenta: string; lugar: string; dresscode: string;
  fotos: string; regalos: string; traer: string; confirmacion: string; pie: string; visor: string; datos: string;
};

// Texto que va después de "¡Hola, <invitado>!" cuando el evento no tiene uno propio.
export const SALUDO_TEXTO = "Te invitamos a celebrar con nosotros";

export const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function secciones({ ev, inv, previa }: DatosPlantilla): Secciones {
  const c = ev.contenido;
  let idx = 0;

  const linea = (c.linea || [])
    .map((m, i) => {
      const shots = m.fotos
        .map(
          (f) =>
            `<button type="button" data-idx="${idx++}" data-src="${esc(f.src)}" data-label="${esc(m.label)}" data-when="${esc(m.when)}" aria-label="Ver foto de ${esc(m.label)} en grande"><img src="${esc(f.src)}" alt="${esc(f.alt || `${ev.nombre}, ${m.label.toLowerCase()}`)}" loading="lazy" width="${f.w}" height="${f.h}"></button>`
        )
        .join("");
      return `<li class="tl-item">
        <div class="tl-dot" aria-hidden="true"><span data-art="${i % 2 ? "adorno" : "hoja"}"></span></div>
        <div class="tl-body">
          <div class="tl-head"><h3>${esc(m.label)}</h3><span>${esc(m.when)}</span></div>
          <figure class="polaroid"><div class="shots ${m.fotos.length > 1 ? "two" : ""}">${shots}</div><figcaption>${esc(m.cap)}</figcaption></figure>
        </div></li>`;
    })
    .join("");

  const finale = c.cierre
    ? `<div class="finale">
            <div class="critters" aria-hidden="true"><span data-art="izquierda"></span><span data-art="centro" class="h"></span><span data-art="derecha"></span></div>
            <p class="big">${esc(c.cierre.titulo)}</p>
            <p>${esc(c.cierre.texto)}</p>
          </div>`
    : "";
  const cierre = c.cierre
    ? `<li class="tl-item">
        <div class="tl-dot" aria-hidden="true"><span data-art="adorno"></span></div>
        <div class="tl-body">
          <div class="tl-head"><h3>${esc(c.cierre.label)}</h3><span>${esc(c.cierre.when)}</span></div>
          ${finale}
        </div></li>`
    : "";

  // ---------- Secciones opcionales ----------
  const mapas = (q: string) =>
    `<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(q)}">Google Maps</a>
        <a class="btn ghost" target="_blank" rel="noopener" href="https://waze.com/ul?q=${encodeURIComponent(q)}&amp;navigate=yes">Waze</a>`;
  const renglones = (t: string) => String(t || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Galería: las mismas fotos de la línea del tiempo, en cuadrícula
  const enGaleria = c.vistaFotos === "galeria";
  let g = 0;
  const galeria = (c.linea || [])
    .flatMap((m) =>
      m.fotos.map(
        (f) =>
          `<button type="button" data-idx="${g++}" data-src="${esc(f.src)}" data-label="${esc(m.label)}" data-when="${esc(m.when)}" aria-label="Ver foto de ${esc(m.label)} en grande"><img src="${esc(f.src)}" alt="${esc(f.alt || `${ev.nombre}, ${m.label.toLowerCase()}`)}" loading="lazy" width="${f.w}" height="${f.h}"></button>`
      )
    )
    .join("");
  const hayFotos = enGaleria ? !!(galeria || finale) : !!(linea || cierre);
  const fotos = enGaleria
    ? `<div class="gallery" id="timeline">${galeria}</div>${finale ? `<div class="card">${finale}</div>` : ""}`
    : `<ol class="timeline" id="timeline">${linea}${cierre}</ol>`;

  // Familias: padres, padres de los novios y padrinos
  const grupo = (gr?: Grupo) => {
    const ls = gr ? renglones(gr.nombres) : [];
    if (!gr || !ls.length) return "";
    const filas = ls
      .map((l) => {
        const m = l.match(/^([^:]{2,40}):\s*(.+)$/);
        return m ? `<p class="fam-n"><small>${esc(m[1])}</small>${esc(m[2])}</p>` : `<p class="fam-n">${esc(l)}</p>`;
      })
      .join("");
    return `<div class="fam"><p class="lbl">${esc(gr.titulo)}</p>${filas}</div>`;
  };
  const familias = [c.padres, c.padresNovia, c.padresNovio, c.padrinos].map(grupo).join("");
  const seccionFamilias = familias
    ? `<section aria-labelledby="h-fam">
    <p class="eyebrow">Con todo nuestro cariño</p>
    <h2 id="h-fam">${esc(c.familiasTitulo || "Con la bendición de")}</h2>
    <div class="card fams">${familias}</div>
  </section>`
    : "";

  // Ceremonia religiosa (además del lugar de la fiesta)
  const cer = c.ceremonia;
  const ceremonia = cer && (cer.nombre || cer.direccion)
    ? `<div class="card where">
        <p class="where-tag">${esc(cer.titulo || "Ceremonia religiosa")}</p>
        ${cer.hora ? `<div class="row one"><div><span class="lbl">Hora</span><span class="val">${esc(cer.hora)}</span></div></div>` : ""}
        <p class="addr"><strong>${esc(cer.nombre)}</strong><span>${esc(cer.direccion)}</span></p>
        <div class="btns">${mapas([cer.nombre, cer.direccion].filter(Boolean).join(", "))}</div>
      </div>`
    : "";

  const dc = c.dresscode;
  const dresscode = dc && (dc.titulo || dc.texto)
    ? `<section aria-labelledby="h-dress">
    <p class="eyebrow">Código de vestimenta</p>
    <h2 id="h-dress">Dress code</h2>
    <div class="card dress">${dc.titulo ? `<p class="dress-t">${esc(dc.titulo)}</p>` : ""}${dc.texto ? `<p>${esc(dc.texto)}</p>` : ""}</div>
  </section>`
    : "";

  // Mesa de regalos y CLABE para regalo en efectivo
  const tiendas = (c.regalos?.tiendas || []).filter((t) => t.nombre);
  const mesa = c.regalos && (c.regalos.texto || tiendas.length)
    ? `<div class="card gifts">
        ${c.regalos.texto ? `<p class="gift-msg">${esc(c.regalos.texto)}</p>` : ""}
        ${tiendas
          .map(
            (t) => `<div class="gift"><div><b>${esc(t.nombre)}</b>${t.numero ? `<span>No. de evento: <strong>${esc(t.numero)}</strong></span>` : ""}</div>${
              t.url
                ? `<a class="btn ghost" target="_blank" rel="noopener" href="${esc(t.url)}">Ver mesa</a>`
                : t.numero
                  ? `<button type="button" class="btn ghost" data-copy="${esc(t.numero)}" data-copied="Número copiado">Copiar número</button>`
                  : ""
            }</div>`
          )
          .join("")}
      </div>`
    : "";
  const cb = c.clabe;
  const clabe = cb && cb.clabe
    ? `<div class="card gifts clabe">
        <p class="lbl">Regalo en efectivo</p>
        ${cb.texto ? `<p class="gift-msg">${esc(cb.texto)}</p>` : ""}
        <p class="clabe-n">${esc(cb.clabe.replace(/(\d{4})(?=\d)/g, "$1 "))}</p>
        <p class="clabe-d">${[cb.banco, cb.titular].filter(Boolean).map(esc).join(" · ")}</p>
        <button type="button" class="btn" data-copy="${esc(cb.clabe)}" data-copied="CLABE copiada">Copiar CLABE</button>
      </div>`
    : "";
  const seccionRegalos = mesa || clabe
    ? `<section aria-labelledby="h-gift">
    <p class="eyebrow">Regalos</p>
    <h2 id="h-gift">Mesa de regalos</h2>
    ${mesa}${clabe}
    <p class="toast center" id="copyGiftToast" role="status"></p>
  </section>`
    : "";

  // Qué te toca llevar: mensaje general y, si hay, lo asignado a este invitado
  const tr = c.traer;
  const asignado = tr && inv.codigo ? tr.asignaciones?.[inv.codigo] || "" : "";
  const traer = tr && (tr.texto || asignado)
    ? `<section aria-labelledby="h-bring">
    <p class="eyebrow">Para compartir</p>
    <h2 id="h-bring">${esc(tr.titulo || "¿Qué te toca llevar?")}</h2>
    <div class="card bring">
      ${asignado ? `<p class="lbl">A ${esc(inv.nombre)} le toca llevar</p><p class="bring-t">${esc(asignado)}</p>` : ""}
      ${tr.texto ? `<p>${esc(tr.texto)}</p>` : ""}
    </div>
  </section>`
    : "";

  // Saludo personal en la portada: solo en links de invitado (el link general no tiene nombre)
  const invitadoNombre = inv.id ? String(inv.nombre || "").trim() : "";
  const saludoTexto = String(c.saludo?.texto ?? SALUDO_TEXTO).trim();
  const saludo = invitadoNombre && c.saludo?.activo !== false
    ? `
    <div class="saludo">
      <p class="saludo-hola">¡Hola, <b>${esc(invitadoNombre)}</b>!</p>
      ${saludoTexto ? `<p class="saludo-txt">${esc(saludoTexto)}</p>` : ""}
    </div>`
    : "";

  const datosCliente = {
    evento: ev.slug,
    nombre: ev.nombre,
    fechaISO: ev.fecha,
    fechaLarga: c.fecha.larga,
    hora: c.fecha.hora,
    busqueda: c.lugar.busqueda,
    direccionCompleta: `${c.lugar.nombre}, ${c.lugar.direccion}`,
    musica: c.musica || [],
    invitado: { codigo: inv.codigo, nombre: inv.nombre, pases: inv.pases },
    previa,
  };
  // JSON seguro para incrustar dentro de <script>
  const json = JSON.stringify(datosCliente).replace(/</g, "\\u003c");

  return {
    musica: `
<button class="music" id="music" type="button" aria-pressed="false" aria-label="Reproducir música">
  <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span id="musicLabel">Música</span>
</button>`,
    portada: `
  <section class="hero" aria-label="Portada">
    <span class="rama l" data-art="rama" aria-hidden="true"></span>
    <span class="rama r" data-art="rama" aria-hidden="true"></span>
    <p class="eyebrow">${esc(c.eyebrow)}</p>
    <div class="stage">
      <div class="arch">${c.portada?.src ? `<img src="${esc(c.portada.src)}" alt="${esc(c.portada.alt || ev.nombre)}" width="${c.portada.w}" height="${c.portada.h}">` : ""}</div>
      <span class="critter izquierda" data-art="izquierda" aria-hidden="true"></span>
      <span class="critter derecha" data-art="derecha" aria-hidden="true"></span>
      <span class="critter adorno1" data-art="adorno" aria-hidden="true"></span>
      <span class="critter adorno2" data-art="adorno" aria-hidden="true"></span>
    </div>
    <p class="kicker">${esc(c.kicker)}</p>
    <h1 class="name">${esc(ev.nombre)}</h1>${saludo}
    <div class="dateline" aria-label="${esc(c.fecha.larga)}, ${esc(c.fecha.hora)}">
      <span>${esc(c.fecha.dia)}</span><span class="bar"></span><span class="big">${esc(c.fecha.numero)}</span><span class="bar"></span><span>${esc(c.fecha.mes)} · ${esc(c.fecha.hora)}</span>
    </div>
  </section>`,
    // Ya viene dentro de `portada`. Úsalo solo si un template escribe su propia portada.
    saludo,
    mensaje: `
  <section class="message" aria-label="Mensaje">
    <div class="divider" aria-hidden="true"><span data-art="hoja"></span><span data-art="adorno"></span><span data-art="hoja" data-flip="1"></span></div>
    <p class="quote">${esc(c.mensaje)}</p>
  </section>`,
    familias: seccionFamilias,
    cuenta: `
  <section aria-labelledby="h-count">
    <p class="eyebrow">Faltan</p>
    <h2 id="h-count">Cuenta regresiva</h2>
    <div class="card">
      <div class="count" id="count">
        <div><b id="cd-d">00</b><small>Días</small></div>
        <div><b id="cd-h">00</b><small>Horas</small></div>
        <div><b id="cd-m">00</b><small>Min</small></div>
        <div><b id="cd-s">00</b><small>Seg</small></div>
      </div>
      <p class="count-done" id="countDone" hidden>¡Hoy es el gran día!</p>
    </div>
  </section>`,
    lugar: `
  <section aria-labelledby="h-where">
    <p class="eyebrow">Te esperamos</p>
    <h2 id="h-where">Cuándo y dónde</h2>
    ${ceremonia}
    <div class="card where">
      ${ceremonia ? `<p class="where-tag">Recepción</p>` : ""}
      <div class="row">
        <div><span class="lbl">Fecha</span><span class="val">${esc(c.fecha.larga)}</span></div>
        <div><span class="lbl">Hora</span><span class="val">${esc(c.fecha.hora)}</span></div>
      </div>
      <p class="addr"><strong>${esc(c.lugar.nombre)}</strong><span id="addrText">${esc(c.lugar.direccion)}</span></p>
      <div class="btns">
        <a class="btn" id="mapsLink" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(c.lugar.busqueda)}">Abrir en Google Maps</a>
        <a class="btn ghost" id="wazeLink" target="_blank" rel="noopener" href="https://waze.com/ul?q=${encodeURIComponent(c.lugar.busqueda)}&amp;navigate=yes">Abrir en Waze</a>
        <button class="btn ghost" type="button" id="copyAddr">Copiar dirección</button>
      </div>
      <p class="toast" id="copyToast" role="status"></p>
    </div>
  </section>`,
    dresscode,
    fotos: hayFotos
      ? `<section aria-labelledby="h-time">
    <p class="eyebrow">${esc(c.lineaEyebrow ?? "Mi primer año")}</p>
    <h2 id="h-time">${esc(c.lineaTitulo || "Así he crecido")}</h2>
    <p class="intro">${esc(c.lineaIntro || "Toca cualquier foto para verla en grande.")}</p>
    ${fotos}
  </section>`
      : "",
    regalos: seccionRegalos,
    traer,
    confirmacion: `
  <section aria-labelledby="h-rsvp">
    <p class="eyebrow">Confirma tu asistencia</p>
    <h2 id="h-rsvp">¿Nos acompañas?</h2>
    <div class="card">
      <div id="rsvpForm">
        <div class="passes">
          <p class="who" id="guestName">${esc(inv.nombre)}</p>
          <div class="seat-row" id="seats" aria-hidden="true"></div>
          <p class="note" id="passNote"></p>
        </div>
        <form id="form" novalidate>
          <fieldset>
            <legend>¿Asistirás?</legend>
            <div class="choice">
              <input type="radio" name="att" id="att-yes" value="si" checked><label for="att-yes">Sí, ahí estaré</label>
              <input type="radio" name="att" id="att-no" value="no"><label for="att-no">No podré ir</label>
            </div>
          </fieldset>
          <div class="field" id="howManyField">
            <label class="lbl" for="howMany">¿Cuántas personas asistirán?</label>
            <select id="howMany"></select>
          </div>
          <div class="field" id="nameField" hidden>
            <label class="lbl" for="guestInput">Tu nombre</label>
            <input type="text" id="guestInput" maxlength="80" autocomplete="name" placeholder="Ej. Familia Pérez">
          </div>
          <div class="field">
            <label class="lbl" for="note">Mensaje para ${esc(ev.nombre)} (opcional)</label>
            <textarea id="note" maxlength="280" placeholder="Escribe unas palabras bonitas…"></textarea>
          </div>
          <p class="toast" id="formMsg" role="status"></p>
          <button class="btn rose" type="submit" id="sendBtn" style="justify-content:center">Enviar confirmación</button>
        </form>
      </div>
      <div class="thanks" id="thanks" hidden>
        <span data-art="centro" aria-hidden="true"></span>
        <h3 id="thanksTitle">¡Gracias!</h3>
        <p id="thanksText"></p>
        <button class="btn ghost" type="button" id="changeRsvp">Cambiar respuesta</button>
      </div>
    </div>
  </section>`,
    pie: `
  <footer>
    <div class="divider" aria-hidden="true"><span data-art="izquierda"></span><span data-art="derecha"></span></div>
    <span class="sig">${esc(ev.nombre)}</span>
    <span>${esc(c.pie)}</span>
  </footer>`,
    visor: `
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Foto ampliada">
  <div class="top"><p id="lbTitle"></p><button class="lb-btn" type="button" id="lbClose">Cerrar</button></div>
  <div class="pic"><img id="lbImg" alt=""></div>
  <div class="nav"><button class="lb-btn" type="button" id="lbPrev">← Anterior</button><button class="lb-btn" type="button" id="lbNext">Siguiente →</button></div>
</div>`,
    datos: `<script>window.__INVITACION__ = ${json};</script>`,
  };
}
