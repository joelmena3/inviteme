/* Dibujos del template «confeti»: globos, regalo, pastel, estrella, serpentinas y banderines.
   Cada dibujo ocupa un lugar fijo de la invitación:
     izquierda / derecha → globos y regalo junto a la foto de portada y en el pie
     centro              → pastel grande del cierre y del "¡Gracias!"
     adorno              → estrella (junto a la portada, separadores, línea del tiempo)
     hoja                → serpentinas (separadores y puntos de la línea del tiempo)
     rama                → banderines de las esquinas de la portada
   Los colores salen de las variables de estilos.css (--c1 … --c6, --c-line). */
(function () {
const S = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="svg-fill">${inner}</svg>`;
const f = v => `style="fill:var(${v})"`;
const brillo = (cx, cy, rx, ry, r) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${cx} ${cy})" style="fill:#fff;stroke:none;opacity:.75"/>`;
const hilo = d => `<path d="${d}" style="fill:none;stroke:var(--c-line);stroke-width:1.6"/>`;

window.__DIBUJOS__ = {
  // Tres globos amarrados
  izquierda: () => S("0 0 120 124", `
    ${hilo("M40 72 C 34 88, 52 98, 58 120")}${hilo("M82 64 C 90 84, 66 98, 60 120")}${hilo("M62 84 C 58 96, 64 106, 60 120")}
    <ellipse cx="40" cy="40" rx="24" ry="29" ${f("--c1")}/>
    <path d="M36 72 L44 72 L40 66Z" ${f("--c1")}/>
    ${brillo(31, 28, 5, 9, 25)}
    <ellipse cx="82" cy="34" rx="22" ry="27" ${f("--c3")}/>
    <path d="M78 64 L86 64 L82 58Z" ${f("--c3")}/>
    ${brillo(74, 23, 4.5, 8, 25)}
    <ellipse cx="62" cy="58" rx="20" ry="24" ${f("--c2")}/>
    <path d="M58 85 L66 85 L62 80Z" ${f("--c2")}/>
    ${brillo(55, 48, 4, 7, 25)}`),

  // Regalo con moño
  derecha: () => S("0 0 120 112", `
    <rect x="20" y="52" width="80" height="54" rx="6" ${f("--c3")}/>
    <rect x="13" y="38" width="94" height="18" rx="5" ${f("--c6")}/>
    <rect x="52" y="38" width="16" height="68" ${f("--c2")}/>
    <path d="M60 38 C 40 14, 22 24, 34 36 C 40 41, 52 40, 60 38Z" ${f("--c1")}/>
    <path d="M60 38 C 80 14, 98 24, 86 36 C 80 41, 68 40, 60 38Z" ${f("--c1")}/>
    <circle cx="60" cy="38" r="6" ${f("--c5")}/>
    <circle cx="34" cy="70" r="3.4" style="fill:#fff;stroke:none"/><circle cx="40" cy="90" r="3" style="fill:#fff;stroke:none"/>
    <circle cx="84" cy="68" r="3" style="fill:#fff;stroke:none"/><circle cx="82" cy="92" r="3.4" style="fill:#fff;stroke:none"/>`),

  // Pastel de dos pisos con velitas
  centro: () => {
    const velas = [["--c2", 54], ["--c3", 68], ["--c6", 82]].map(([c, x]) => `
      <rect x="${x - 3.5}" y="20" width="7" height="20" rx="2" ${f(c)}/>
      <path d="M${x} 6 C ${x + 6} 13, ${x + 4} 18, ${x} 18 C ${x - 4} 18, ${x - 6} 13, ${x} 6Z" style="fill:var(--c5);stroke:var(--c-line);stroke-width:1.4"/>`).join("");
    const chispas = [[34, 80, "--c2", 20], [52, 86, "--c3", -30], [74, 78, "--c6", 40], [94, 86, "--c2", -10], [106, 76, "--c3", 25],
      [56, 54, "--c1", 30], [80, 56, "--c2", -25]]
      .map(([x, y, c, r]) => `<rect x="${x - 4}" y="${y - 1.6}" width="8" height="3.2" rx="1.6" transform="rotate(${r} ${x} ${y})" style="fill:var(${c});stroke:none"/>`).join("");
    return S("0 0 140 104", `
      <ellipse cx="70" cy="96" rx="62" ry="7" ${f("--paper")}/>
      <rect x="22" y="62" width="96" height="32" rx="8" ${f("--c1")}/>
      <path d="M22 70 C 22 62, 26 62, 30 62 L110 62 C 114 62, 118 62, 118 70 C 112 78, 106 70, 100 76 C 94 82, 88 70, 80 76 C 72 82, 66 70, 58 76 C 50 82, 44 70, 38 76 C 32 82, 26 72, 22 70Z" style="fill:#fff"/>
      <rect x="40" y="40" width="60" height="24" rx="7" ${f("--c4")}/>
      <path d="M40 47 C 40 40, 44 40, 47 40 L93 40 C 96 40, 100 40, 100 47 C 94 53, 90 46, 84 51 C 78 56, 74 46, 68 51 C 62 56, 58 46, 52 51 C 48 54, 44 50, 40 47Z" style="fill:#fff"/>
      ${velas}${chispas}`);
  },

  // Estrella con destello
  adorno: () => S("0 0 60 60", `
    <path ${f("--c2")} d="M30 6 L36.5 21.5 L53 22.5 L40.5 33.5 L44.5 50 L30 41 L15.5 50 L19.5 33.5 L7 22.5 L23.5 21.5 Z"/>
    <circle cx="25" cy="27" r="2.6" style="fill:#fff;stroke:none"/>
    <path d="M52 44 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2Z" style="fill:var(--c1);stroke:none"/>`),

  // Serpentinas y confeti
  hoja: (flip) => S("0 0 60 60", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    <path d="M6 52 C 14 40, 24 50, 28 38 C 32 26, 20 22, 28 14 C 34 8, 44 14, 52 6" style="fill:none;stroke:var(--c-line);stroke-width:7.4"/>
    <path d="M6 52 C 14 40, 24 50, 28 38 C 32 26, 20 22, 28 14 C 34 8, 44 14, 52 6" style="fill:none;stroke:var(--c1);stroke-width:4.4"/>
    <path d="M30 56 C 36 48, 44 54, 48 44 C 51 36, 46 32, 54 26" style="fill:none;stroke:var(--c-line);stroke-width:6.4"/>
    <path d="M30 56 C 36 48, 44 54, 48 44 C 51 36, 46 32, 54 26" style="fill:none;stroke:var(--c3);stroke-width:3.6"/>
    <rect x="8" y="14" width="9" height="5" rx="1.5" transform="rotate(-25 12 16)" style="fill:var(--c2);stroke:none"/>
    <circle cx="14" cy="32" r="3" style="fill:var(--c4);stroke:none"/>
    <rect x="40" y="30" width="7" height="4" rx="1.2" transform="rotate(35 43 32)" style="fill:var(--c6);stroke:none"/></g>`),

  // Banderines de colores colgando de un cordón
  rama: () => {
    const p0 = [2, 6], p1 = [60, 54], p2 = [128, 26];
    const q = (t, i) => (1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t ** 2 * p2[i];
    const colores = ["--c1", "--c2", "--c3", "--c4", "--c5", "--c6"];
    let flags = "";
    for (let i = 0; i < 6; i++) {
      const t = 0.08 + i * 0.165, x = q(t, 0), y = q(t, 1);
      const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
      const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      flags += `<path d="M-8 0 L8 0 L0 19Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang * 0.6).toFixed(1)})" style="fill:var(${colores[i]});stroke:var(--c-line);stroke-width:1.6;stroke-linejoin:round"/>`;
    }
    return `<svg viewBox="0 0 130 82" xmlns="http://www.w3.org/2000/svg"><path d="M${p0} Q ${p1} ${p2}" style="fill:none;stroke:var(--c-line);stroke-width:1.6"/>${flags}</svg>`;
  }
};
})();
