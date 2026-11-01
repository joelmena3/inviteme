/* Motor común de las invitaciones: cuenta regresiva, confirmación, música,
   visor de fotos y botones de copiar. Lo comparten todos los templates.
   Los datos llegan del servidor en window.__INVITACION__. */
(function () {
const D = window.__INVITACION__;
const $ = id => document.getElementById(id);
/* Los dibujos los define cada template en su archivo dibujos.js
   (window.__DIBUJOS__). Aquí solo se pintan donde haya data-art. */
function paintArt(root = document) {
  const DIB = window.__DIBUJOS__ || {};
  root.querySelectorAll("[data-art]").forEach(el => {
    const dibujo = DIB[el.dataset.art];
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

/* ---- Botones de copiar (número de mesa de regalos, CLABE) ---- */
function setupCopy() {
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const t = $("copyGiftToast");
    const aviso = msg => { if (t) { t.textContent = msg; setTimeout(() => t.textContent = "", 2500); } };
    try { await navigator.clipboard.writeText(b.dataset.copy); aviso(b.dataset.copied || "Copiado"); }
    catch { prompt("Copia este dato:", b.dataset.copy); }
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
    $("seats").innerHTML = Array.from({ length: G.pases }, () => '<span class="seat"><span data-art="derecha"></span></span>').join("");
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
setupCopy();
setupRsvp();
setupLightbox();
renderGuest();
$("music").addEventListener("click", toggleMusic);
})();
