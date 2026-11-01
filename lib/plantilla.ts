import type { Confirmacion, Evento, Invitado } from "./tipos";

// Convierte los datos de un evento en el HTML de la invitación.
// El HTML sale completo desde el servidor (se ve aunque el JavaScript tarde);
// /motor/invitacion.js le agrega la interacción.

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function renderInvitacion(ev: Evento, inv: Invitado, previa: Confirmacion | null): string {
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
        <div class="tl-dot" aria-hidden="true"><span data-art="${i % 2 ? "mushroom" : "leaf"}"></span></div>
        <div class="tl-body">
          <div class="tl-head"><h3>${esc(m.label)}</h3><span>${esc(m.when)}</span></div>
          <figure class="polaroid"><div class="shots ${m.fotos.length > 1 ? "two" : ""}">${shots}</div><figcaption>${esc(m.cap)}</figcaption></figure>
        </div></li>`;
    })
    .join("");

  const cierre = c.cierre
    ? `<li class="tl-item">
        <div class="tl-dot" aria-hidden="true"><span data-art="mushroom"></span></div>
        <div class="tl-body">
          <div class="tl-head"><h3>${esc(c.cierre.label)}</h3><span>${esc(c.cierre.when)}</span></div>
          <div class="finale">
            <div class="critters" aria-hidden="true"><span data-art="fox"></span><span data-art="hedgehog" class="h"></span><span data-art="bunny"></span></div>
            <p class="big">${esc(c.cierre.titulo)}</p>
            <p>${esc(c.cierre.texto)}</p>
          </div>
        </div></li>`
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

  return `
<button class="music" id="music" type="button" aria-pressed="false" aria-label="Reproducir música">
  <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span id="musicLabel">Música</span>
</button>

<main class="wrap">
  <section class="hero" aria-label="Portada">
    <span class="sprig l" data-art="sprig" aria-hidden="true"></span>
    <span class="sprig r" data-art="sprig" aria-hidden="true"></span>
    <p class="eyebrow">${esc(c.eyebrow)}</p>
    <div class="stage">
      <div class="arch">${c.portada?.src ? `<img src="${esc(c.portada.src)}" alt="${esc(c.portada.alt || ev.nombre)}" width="${c.portada.w}" height="${c.portada.h}">` : ""}</div>
      <span class="critter fox" data-art="fox" aria-hidden="true"></span>
      <span class="critter bunny" data-art="bunny" aria-hidden="true"></span>
      <span class="critter mush1" data-art="mushroom" aria-hidden="true"></span>
      <span class="critter mush2" data-art="mushroom" aria-hidden="true"></span>
    </div>
    <p class="kicker">${esc(c.kicker)}</p>
    <h1 class="name">${esc(ev.nombre)}</h1>
    <div class="dateline" aria-label="${esc(c.fecha.larga)}, ${esc(c.fecha.hora)}">
      <span>${esc(c.fecha.dia)}</span><span class="bar"></span><span class="big">${esc(c.fecha.numero)}</span><span class="bar"></span><span>${esc(c.fecha.mes)} · ${esc(c.fecha.hora)}</span>
    </div>
  </section>

  <section class="message" aria-label="Mensaje">
    <div class="divider" aria-hidden="true"><span data-art="leaf"></span><span data-art="mushroom"></span><span data-art="leaf" data-flip="1"></span></div>
    <p class="quote">${esc(c.mensaje)}</p>
  </section>

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
  </section>

  <section aria-labelledby="h-where">
    <p class="eyebrow">Te esperamos</p>
    <h2 id="h-where">Cuándo y dónde</h2>
    <div class="card where">
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
  </section>

  ${linea || cierre ? `<section aria-labelledby="h-time">
    <p class="eyebrow">${esc(c.lineaEyebrow ?? "Mi primer año")}</p>
    <h2 id="h-time">${esc(c.lineaTitulo || "Así he crecido")}</h2>
    <p class="intro">${esc(c.lineaIntro || "Toca cualquier foto para verla en grande.")}</p>
    <ol class="timeline" id="timeline">${linea}${cierre}</ol>
  </section>` : ""}

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
        <span data-art="hedgehog" aria-hidden="true"></span>
        <h3 id="thanksTitle">¡Gracias!</h3>
        <p id="thanksText"></p>
        <button class="btn ghost" type="button" id="changeRsvp">Cambiar respuesta</button>
      </div>
    </div>
  </section>

  <footer>
    <div class="divider" aria-hidden="true"><span data-art="fox"></span><span data-art="bunny"></span></div>
    <span class="sig">${esc(ev.nombre)}</span>
    <span>${esc(c.pie)}</span>
  </footer>
</main>

<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Foto ampliada">
  <div class="top"><p id="lbTitle"></p><button class="lb-btn" type="button" id="lbClose">Cerrar</button></div>
  <div class="pic"><img id="lbImg" alt=""></div>
  <div class="nav"><button class="lb-btn" type="button" id="lbPrev">← Anterior</button><button class="lb-btn" type="button" id="lbNext">Siguiente →</button></div>
</div>

<script>window.__INVITACION__ = ${json};</script>`;
}
