/* Motor de invitaciones: interacción de la página.
   Los datos llegan del servidor en window.__INVITACION__. */
(function () {
const D = window.__INVITACION__;
const $ = id => document.getElementById(id);
/* =========================================================
   2) ILUSTRACIONES ORIGINALES (zorrito, conejita, erizo,
      hongos y hojas). Sus colores salen de la capa de diseño.
   ========================================================= */
const S = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="svg-fill">${inner}</svg>`;
const f = v => `style="fill:var(${v})"`;
const ART = {
  fox: () => S("0 0 120 112", `
    <path ${f("--c-fox")} d="M22 54 L28 10 L54 38 Z"/><path ${f("--c-fox")} d="M98 54 L92 10 L66 38 Z"/>
    <path ${f("--c-bunny-in")} style="stroke:none" d="M30 22 L46 40 L31 46Z"/><path ${f("--c-bunny-in")} style="stroke:none" d="M90 22 L74 40 L89 46Z"/>
    <path ${f("--c-fox")} d="M16 56 C 20 32, 100 32, 104 56 C 102 82, 80 102, 60 106 C 40 102, 18 82, 16 56Z"/>
    <path ${f("--c-fox-light")} d="M22 66 C 38 70, 50 78, 60 84 C 70 78, 82 70, 98 66 C 92 88, 76 101, 60 106 C 44 101, 28 88, 22 66Z"/>
    <path d="M38 62 q6 5 12 0 M70 62 q6 5 12 0" style="fill:none;stroke:var(--c-eye);stroke-width:2.8"/>
    <circle cx="36" cy="74" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="84" cy="74" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <ellipse cx="60" cy="88" rx="5.5" ry="4" style="fill:var(--c-eye);stroke:none"/>`),
  bunny: () => S("0 0 120 112", `
    <ellipse cx="44" cy="32" rx="11" ry="27" transform="rotate(-9 44 32)" ${f("--c-bunny")}/>
    <ellipse cx="76" cy="32" rx="11" ry="27" transform="rotate(9 76 32)" ${f("--c-bunny")}/>
    <ellipse cx="44" cy="34" rx="5" ry="18" transform="rotate(-9 44 34)" ${f("--c-bunny-in")} style="stroke:none"/>
    <ellipse cx="76" cy="34" rx="5" ry="18" transform="rotate(9 76 34)" ${f("--c-bunny-in")} style="stroke:none"/>
    <ellipse cx="60" cy="78" rx="35" ry="30" ${f("--c-bunny")}/>
    <circle cx="47" cy="75" r="3.6" style="fill:var(--c-eye);stroke:none"/><circle cx="73" cy="75" r="3.6" style="fill:var(--c-eye);stroke:none"/>
    <circle cx="48.2" cy="73.8" r="1.1" style="fill:#fff;stroke:none"/><circle cx="74.2" cy="73.8" r="1.1" style="fill:#fff;stroke:none"/>
    <circle cx="40" cy="86" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="80" cy="86" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <ellipse cx="60" cy="84" rx="3.6" ry="2.6" ${f("--c-cheek")} style="stroke:none"/>
    <path d="M60 86.5 v3.5 M60 90 q-3.5 3 -6.5 0 M60 90 q3.5 3 6.5 0" style="fill:none;stroke:var(--c-eye);stroke-width:1.6"/>`),
  hedgehog: () => S("0 0 140 104", `
    <path ${f("--c-hedge")} d="M18 84 L12 68 L24 62 L18 48 L32 46 L30 32 L46 34 L50 20 L62 30 L74 18 L82 32 L96 26 L98 40 L112 40 L110 54 L124 60 L116 72 L124 84 Z"/>
    <ellipse cx="70" cy="74" rx="34" ry="24" ${f("--c-face")}/>
    <circle cx="58" cy="70" r="3.4" style="fill:var(--c-eye);stroke:none"/><circle cx="82" cy="70" r="3.4" style="fill:var(--c-eye);stroke:none"/>
    <circle cx="50" cy="80" r="5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="90" cy="80" r="5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <ellipse cx="70" cy="78" rx="4.5" ry="3.4" style="fill:var(--c-eye);stroke:none"/>
    <path d="M64 86 q6 5 12 0" style="fill:none;stroke:var(--c-eye);stroke-width:1.8"/>`),
  mushroom: () => S("0 0 60 60", `
    <rect x="23" y="30" width="14" height="24" rx="6" ${f("--c-stem")}/>
    <path ${f("--c-mush")} d="M6 34 C 6 10, 54 10, 54 34 Q 30 41 6 34Z"/>
    <circle cx="20" cy="24" r="3.6" style="fill:#fff;stroke:none"/><circle cx="34" cy="18" r="3" style="fill:#fff;stroke:none"/><circle cx="42" cy="28" r="2.6" style="fill:#fff;stroke:none"/>`),
  leaf: (flip) => S("0 0 60 60", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    <path d="M8 54 C 22 40, 34 26, 52 8" style="fill:none;stroke:var(--leaf-deep);stroke-width:2"/>
    <path d="M30 32 C 18 30, 12 20, 14 12 C 24 14, 32 22, 30 32Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <path d="M40 20 C 46 10, 56 8, 60 12 C 56 20, 48 24, 40 20Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <path d="M22 44 C 30 46, 38 42, 42 34 C 32 32, 24 36, 22 44Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/></g>`),
  sprig: () => {
    let leaves = "";
    for (let i = 0; i < 6; i++) {
      const t = i / 5, x = 10 + t * 108, y = 50 - t * 38;
      const r = -30 - t * 10;
      leaves += `<ellipse cx="${x}" cy="${y - 9}" rx="5" ry="11" transform="rotate(${r + 70} ${x} ${y})" style="fill:var(--leaf);opacity:.85"/>`;
      leaves += `<ellipse cx="${x}" cy="${y + 9}" rx="5" ry="11" transform="rotate(${r + 110} ${x} ${y})" style="fill:var(--blush);opacity:.9"/>`;
    }
    return `<svg viewBox="0 0 130 64" xmlns="http://www.w3.org/2000/svg"><path d="M4 56 C 40 48, 90 28, 124 8" style="fill:none;stroke:var(--leaf-deep);stroke-width:1.6"/>${leaves}</svg>`;
  }
};
/* ---- Juego de dibujos "Navidad": reemplaza a los animalitos del bosque ----
   fox → reno · bunny → muñeco de nieve · hedgehog → árbol · mushroom → esfera
   leaf → acebo · sprig → rama de pino con esferas */
const ART_NAVIDAD = {
  fox: () => S("0 0 120 112", `
    <path d="M42 44 C 36 30, 32 20, 24 8 M31 23 L16 20 M36 32 L22 34 M78 44 C 84 30, 88 20, 96 8 M89 23 L104 20 M84 32 L98 34" style="fill:none;stroke:#8A5A36;stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/>
    <ellipse cx="25" cy="54" rx="13" ry="6.5" transform="rotate(-24 25 54)" ${f("--c-fox")}/><ellipse cx="95" cy="54" rx="13" ry="6.5" transform="rotate(24 95 54)" ${f("--c-fox")}/>
    <ellipse cx="60" cy="70" rx="33" ry="32" ${f("--c-fox")}/>
    <ellipse cx="60" cy="88" rx="21" ry="15" ${f("--c-fox-light")}/>
    <circle cx="47" cy="66" r="3.6" style="fill:var(--c-eye);stroke:none"/><circle cx="73" cy="66" r="3.6" style="fill:var(--c-eye);stroke:none"/>
    <circle cx="48.2" cy="64.8" r="1.1" style="fill:#fff;stroke:none"/><circle cx="74.2" cy="64.8" r="1.1" style="fill:#fff;stroke:none"/>
    <circle cx="37" cy="78" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="83" cy="78" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <circle cx="60" cy="81" r="7.5" ${f("--c-mush")}/><circle cx="57.5" cy="78.5" r="2" style="fill:#fff;stroke:none;opacity:.8"/>
    <path d="M53 93 q7 6 14 0" style="fill:none;stroke:var(--c-eye);stroke-width:1.8;stroke-linecap:round"/>`),
  bunny: () => S("0 0 120 112", `
    <circle cx="60" cy="82" r="27" style="fill:var(--c-bunny);stroke:#D9CDBE;stroke-width:1.6"/>
    <circle cx="60" cy="44" r="20" style="fill:var(--c-bunny);stroke:#D9CDBE;stroke-width:1.6"/>
    <rect x="45" y="10" width="30" height="17" rx="2" style="fill:var(--ink);stroke:none"/>
    <rect x="45" y="20" width="30" height="4.5" style="fill:var(--c-mush);stroke:none"/>
    <rect x="38" y="26" width="44" height="5" rx="2.5" style="fill:var(--ink);stroke:none"/>
    <circle cx="53" cy="42" r="2.7" style="fill:var(--c-eye);stroke:none"/><circle cx="67" cy="42" r="2.7" style="fill:var(--c-eye);stroke:none"/>
    <path d="M60 47 L74 50 L60 52 Z" style="fill:#E8833A;stroke:none"/>
    <circle cx="48" cy="51" r="4" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="72" cy="51" r="4" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <rect x="41" y="60" width="38" height="8" rx="4" ${f("--c-mush")} style="stroke:none"/>
    <rect x="64" y="63" width="9" height="19" rx="3" transform="rotate(-10 68 63)" ${f("--c-mush")} style="stroke:none"/>
    <circle cx="60" cy="78" r="2.8" style="fill:var(--ink);stroke:none"/><circle cx="60" cy="90" r="2.8" style="fill:var(--ink);stroke:none"/>`),
  hedgehog: () => S("0 0 140 104", `
    <rect x="63" y="88" width="14" height="14" rx="2" style="fill:#8A5A36;stroke:none"/>
    <path ${f("--c-hedge")} d="M70 20 L44 52 L96 52 Z"/><path ${f("--c-hedge")} d="M70 36 L36 72 L104 72 Z"/><path ${f("--c-hedge")} d="M70 54 L28 92 L112 92 Z"/>
    <path ${f("--c-stem")} style="stroke:none" d="M70 3 L73.5 11 L82 11.5 L75.5 17 L77.5 25.5 L70 21 L62.5 25.5 L64.5 17 L58 11.5 L66.5 11 Z"/>
    <circle cx="58" cy="47" r="4" ${f("--c-mush")} style="stroke:none"/><circle cx="80" cy="44" r="3.4" ${f("--c-stem")} style="stroke:none"/>
    <circle cx="85" cy="65" r="4" ${f("--c-mush")} style="stroke:none"/><circle cx="54" cy="66" r="3.4" ${f("--c-stem")} style="stroke:none"/>
    <circle cx="62" cy="84" r="4" ${f("--c-stem")} style="stroke:none"/><circle cx="93" cy="86" r="4" ${f("--c-mush")} style="stroke:none"/><circle cx="44" cy="86" r="4" ${f("--c-mush")} style="stroke:none"/>`),
  mushroom: () => S("0 0 60 60", `
    <circle cx="30" cy="6" r="3.2" style="fill:none;stroke:var(--c-stem);stroke-width:1.8"/>
    <rect x="24" y="8" width="12" height="8" rx="2" ${f("--c-stem")} style="stroke:none"/>
    <circle cx="30" cy="36" r="20" ${f("--c-mush")}/>
    <path d="M11 32 Q30 41 49 32" style="fill:none;stroke:var(--c-stem);stroke-width:3"/>
    <ellipse cx="22" cy="27" rx="5" ry="3" transform="rotate(-30 22 27)" style="fill:#fff;stroke:none;opacity:.55"/>`),
  leaf: (flip) => S("0 0 60 60", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    <path d="M30 34 Q23 31 22 25 Q15 25 13 19 Q8 17 8 10 Q17 10 21 14 Q25 11 30 16 Q33 24 30 34Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <path d="M30 34 Q37 31 38 25 Q45 25 47 19 Q52 17 52 10 Q43 10 39 14 Q35 11 30 16 Q27 24 30 34Z" style="fill:var(--leaf-deep);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <circle cx="25" cy="38" r="5.5" style="fill:var(--c-mush);stroke:none"/><circle cx="35" cy="38" r="5.5" style="fill:var(--c-mush);stroke:none"/><circle cx="30" cy="46" r="5.5" style="fill:var(--c-mush);stroke:none"/>
    <circle cx="23.5" cy="36.5" r="1.4" style="fill:#fff;stroke:none;opacity:.8"/><circle cx="33.5" cy="36.5" r="1.4" style="fill:#fff;stroke:none;opacity:.8"/></g>`),
  sprig: () => {
    let agujas = "", esferas = "";
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, x = 8 + t * 112, y = 54 - t * 44;
      agujas += `M${x} ${y} l-7 -8 M${x} ${y} l8 -5 M${x} ${y} l-3 9 M${x} ${y} l7 4 `;
    }
    [[.28, "--c-mush"], [.58, "--c-stem"], [.86, "--c-mush"]].forEach(([t, c]) => {
      const x = 8 + t * 112, y = 54 - t * 44;
      esferas += `<path d="M${x} ${y} v9" style="stroke:var(--c-stem);stroke-width:1.2;fill:none"/><circle cx="${x}" cy="${y + 14}" r="5" style="fill:var(${c})"/>`;
    });
    return `<svg viewBox="0 0 130 74" xmlns="http://www.w3.org/2000/svg"><path d="M4 58 C 40 50, 90 30, 124 6" style="fill:none;stroke:var(--leaf-deep);stroke-width:2"/>
      <path d="${agujas}" style="fill:none;stroke:var(--leaf);stroke-width:2.6;stroke-linecap:round"/>${esferas}</svg>`;
  }
};
const ART_SETS = { navidad: ART_NAVIDAD };

function paintArt(root = document) {
  const set = ART_SETS[document.body.dataset.design] || {};
  root.querySelectorAll("[data-art]").forEach(el => {
    const dibujo = set[el.dataset.art] || ART[el.dataset.art];
    if (dibujo) el.innerHTML = dibujo(el.dataset.flip);
  });
}

/* ---- Cuenta regresiva ---- */
function startCountdown() {
  const target = new Date(D.fechaISO).getTime();
  const pad = n => String(n).padStart(2, "0");
  let t = null;
  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (s === 0) { $("count").hidden = true; $("countDone").hidden = false; clearInterval(t); return; }
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    $("cd-d").textContent = pad(d); $("cd-h").textContent = pad(h); $("cd-m").textContent = pad(m); $("cd-s").textContent = pad(s);
  };
  tick(); t = setInterval(tick, 1000);
}

/* ---- Copiar dirección ---- */
function setupMap() {
  $("copyAddr").addEventListener("click", () => {
    const done = msg => { $("copyToast").textContent = msg; setTimeout(() => $("copyToast").textContent = "", 2500); };
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents($("addrText"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      done("Dirección seleccionada: cópiala con tu teclado");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(D.direccionCompleta).then(() => done("Dirección copiada"), fallback);
    } else fallback();
  });
}

/* ---- Pases y confirmación ---- */
const G = D.invitado;
const unlimited = G.pases == null;
const general = !G.codigo;
const plural = (n, a, b) => n === 1 ? a : b;

function renderGuest() {
  $("nameField").hidden = !general;
  if (unlimited) {
    $("seats").hidden = true;
    $("passNote").innerHTML = "¡Hay lugar para <b>toda la familia</b>! Los esperamos a todos.";
    $("howMany").innerHTML = '<option value="">Elige cuántos</option>' +
      Array.from({ length: 20 }, (_, i) => '<option value="' + (i + 1) + '">' + (i + 1) + " " + plural(i + 1, "persona", "personas") + "</option>").join("");
    $("howMany").value = "";
  } else {
    $("passNote").innerHTML = "Hemos reservado <b>" + G.pases + " " + plural(G.pases, "lugar", "lugares") + "</b> para ti.";
    $("seats").innerHTML = Array.from({ length: G.pases }, () => '<span class="seat"><span data-art="bunny"></span></span>').join("");
    paintArt($("seats"));
    $("howMany").innerHTML = Array.from({ length: G.pases }, (_, i) => '<option value="' + (i + 1) + '">' + (i + 1) + " " + plural(i + 1, "persona", "personas") + "</option>").join("");
    $("howMany").value = String(G.pases);
  }
  D.previa ? showThanks(D.previa, G.nombre) : showForm();
}
function showForm() { $("rsvpForm").hidden = false; $("thanks").hidden = true; }
function showThanks(r, nombre) {
  $("rsvpForm").hidden = true; $("thanks").hidden = false;
  if (r.asiste) {
    const cuantos = unlimited ? r.personas + " " + plural(r.personas, "persona", "personas")
                              : r.personas + " de " + G.pases + " " + plural(G.pases, "lugar", "lugares");
    $("thanksTitle").textContent = "¡Gracias, " + nombre + "!";
    $("thanksText").textContent = "Confirmaste " + cuantos + ". " + D.nombre + " te espera el " + D.fechaLarga.toLowerCase() + " a las " + D.hora + ".";
  } else {
    $("thanksTitle").textContent = "Te vamos a extrañar";
    $("thanksText").textContent = "Gracias por avisarnos, " + nombre + ". Le daremos a " + D.nombre + " un abrazo de tu parte.";
  }
}
function setupRsvp() {
  document.querySelectorAll('input[name="att"]').forEach(r => r.addEventListener("change", () => {
    $("howManyField").hidden = $("att-no").checked;
  }));
  $("form").addEventListener("submit", async e => {
    e.preventDefault();
    const asiste = $("att-yes").checked;
    const nombreLibre = $("guestInput").value.trim();
    if (general && !nombreLibre) { $("formMsg").textContent = "Escribe tu nombre para saber quién confirma."; $("guestInput").focus(); return; }
    if (asiste && !$("howMany").value) { $("formMsg").textContent = "Elige cuántas personas asistirán."; $("howMany").focus(); return; }
    const body = {
      evento: D.evento, invitado: G.codigo, asiste,
      personas: asiste ? Number($("howMany").value) : 0,
      mensaje: $("note").value.trim(), nombre: nombreLibre
    };
    $("formMsg").textContent = "Enviando…"; $("sendBtn").disabled = true;
    try {
      const res = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "No se pudo enviar.");
      $("formMsg").textContent = "";
      showThanks(body, general ? nombreLibre : G.nombre);
      $("thanks").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    } catch (err) {
      $("formMsg").textContent = (err && err.message ? err.message : "No se pudo enviar.") + " Revisa tu conexión e inténtalo de nuevo.";
    } finally { $("sendBtn").disabled = false; }
  });
  $("changeRsvp").addEventListener("click", showForm);
}
/* ---- Música: canciones del evento en ciclo; si fallan, cajita musical (WebAudio) ---- */
const MELODY = [
  ["E5",1],["G5",1],["C6",2],["B5",1],["A5",1],["G5",2],
  ["F5",1],["A5",1],["D6",2],["C6",1],["B5",1],["C6",2],
  ["E5",1],["G5",1],["A5",1],["G5",1],["E5",1],["D5",1],["C5",2],
  ["D5",1],["E5",1],["G5",1],["E5",1],["D5",2],["C5",2]
];
const FREQ = n => { const m = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }; const midi = 12 * (Number(n.slice(-1)) + 1) + m[n[0]]; return 440 * Math.pow(2, (midi - 69) / 12); };
let ctx = null, playing = false, timer = null, nextTime = 0, step = 0;
function chime(freq, t) {
  [1, 2, 3.01].forEach((mult, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = i ? "sine" : "triangle"; o.frequency.value = freq * mult;
    const peak = [0.16, 0.05, 0.025][i];
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / mult);
    o.connect(g).connect(ctx.master); o.start(t); o.stop(t + 1.8);
  });
}
function schedule() {
  const beat = 0.34;
  while (nextTime < ctx.currentTime + 0.6) {
    const [n, d] = MELODY[step % MELODY.length];
    chime(FREQ(n), nextTime);
    nextTime += d * beat; step++;
    if (step % MELODY.length === 0) nextTime += beat * 2;
  }
}
function toggleChime() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.master = ctx.createGain(); ctx.master.gain.value = 0.7;
      const delay = ctx.createDelay(); delay.delayTime.value = 0.28; const fb = ctx.createGain(); fb.gain.value = 0.25;
      ctx.master.connect(ctx.destination); ctx.master.connect(delay); delay.connect(fb).connect(delay); delay.connect(ctx.destination);
    }
    playing = !playing;
    if (playing) { ctx.resume(); nextTime = ctx.currentTime + 0.05; timer = setInterval(schedule, 120); schedule(); }
    else { clearInterval(timer); ctx.suspend(); }
    $("music").setAttribute("aria-pressed", String(playing));
    $("musicLabel").textContent = playing ? "Pausar" : "Música";
    $("music").setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  } catch (e) { $("musicLabel").textContent = "Sin audio"; }
}


const PLAYLIST = D.musica || [];
let track = 0, songOk = PLAYLIST.length > 0, songOn = false;
const song = songOk ? new Audio(PLAYLIST[0]) : null;
if (song) {
  song.preload = "auto"; song.volume = 0.85;
  song.addEventListener("ended", () => {
    track = (track + 1) % PLAYLIST.length;
    song.src = PLAYLIST[track];
    if (songOn) song.play().catch(() => {});
  });
  song.addEventListener("error", () => { songOk = false; if (songOn) { songOn = false; toggleChime(); } });
}
function setMusicUi(on) {
  $("music").setAttribute("aria-pressed", String(on));
  $("musicLabel").textContent = on ? "Pausar" : "Música";
  $("music").setAttribute("aria-label", on ? "Pausar música" : "Reproducir música");
}
function toggleMusic() {
  if (!songOk) return toggleChime();
  if (songOn) { song.pause(); songOn = false; setMusicUi(false); return; }
  songOn = true; setMusicUi(true);
  const p = song.play();
  if (p && p.catch) p.catch(() => { songOk = false; songOn = false; toggleChime(); });
}
/* ---- Visor de fotos ---- */
let lbIndex = 0, lastFocus = null;
function openLb(i) {
  lbIndex = (i + ALL_PHOTOS.length) % ALL_PHOTOS.length;
  const p = ALL_PHOTOS[lbIndex];
  $("lbImg").src = p.src; $("lbImg").alt = D.nombre + ", " + p.label.toLowerCase();
  $("lbTitle").innerHTML = `${p.label}<small>${p.when} · ${lbIndex + 1} de ${ALL_PHOTOS.length}</small>`;
  if ($("lightbox").hidden) { lastFocus = document.activeElement; $("lightbox").hidden = false; $("lbClose").focus(); }
}
function closeLb() { $("lightbox").hidden = true; lastFocus && lastFocus.focus(); }
function setupLightbox() {
  document.querySelectorAll("#timeline button[data-idx]").forEach(b => ALL_PHOTOS.push({ src: b.dataset.src, label: b.dataset.label, when: b.dataset.when }));
  $("timeline")?.addEventListener("click", e => { const b = e.target.closest("button[data-idx]"); if (b) openLb(Number(b.dataset.idx)); });
  $("lbClose").addEventListener("click", closeLb);
  $("lbPrev").addEventListener("click", () => openLb(lbIndex - 1));
  $("lbNext").addEventListener("click", () => openLb(lbIndex + 1));
  $("lightbox").addEventListener("click", e => { if (e.target.id === "lightbox" || e.target.classList.contains("pic")) closeLb(); });
  document.addEventListener("keydown", e => {
    if ($("lightbox").hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") openLb(lbIndex + 1);
    if (e.key === "ArrowLeft") openLb(lbIndex - 1);
  });
  let x0 = null;
  $("lightbox").addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
  $("lightbox").addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) openLb(lbIndex + (dx < 0 ? 1 : -1)); x0 = null; });
}


const ALL_PHOTOS = [];
paintArt();
startCountdown();
setupMap();
setupRsvp();
setupLightbox();
renderGuest();
$("music").addEventListener("click", toggleMusic);
})();
