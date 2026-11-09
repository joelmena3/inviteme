/* Dibujos del template «posada»: regalo, esfera, árbol de espiral dorada, estrellas, copos y luces.
   Cada dibujo ocupa un lugar fijo de la invitación:
     izquierda / derecha → regalo y esfera junto a la foto de portada, en el pie y en los pases
     centro              → árbol de espiral dorada del cierre y del "¡Gracias!"
     adorno              → estrella dorada (portada, separadores, línea del tiempo)
     hoja                → copo de nieve (separadores y puntos de la línea del tiempo)
     rama                → tira de luces de colores en las esquinas de la portada
   Los colores salen de las variables de estilos.css (--oro*, --rojo*, --nieve, --foco-*). */
(function () {
const S = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const r = (v) => `style="fill:var(${v})"`;
const t = (v, w = 2) => `style="fill:none;stroke:var(${v});stroke-width:${w};stroke-linecap:round;stroke-linejoin:round"`;
const estrella = (cx, cy, R, v = "--oro") => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? R * .42 : R, a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path ${r(v)} d="${d}Z"/>`;
};
const destello = (x, y, R, v = "--oro-luz") =>
  `<path ${r(v)} d="M${x} ${y - R} Q${x} ${y} ${x + R * .5} ${y} Q${x} ${y} ${x} ${y + R} Q${x} ${y} ${x - R * .5} ${y} Q${x} ${y} ${x} ${y - R}Z"/>`;

window.__DIBUJOS__ = {
  izquierda: () => S("0 0 120 112", `
    <rect x="18" y="46" width="84" height="60" rx="5" ${r("--regalo")}/>
    <rect x="12" y="34" width="96" height="18" rx="4" ${r("--regalo-claro")}/>
    <rect x="53" y="34" width="14" height="72" ${r("--oro")}/>
    <path d="M60 34 C 44 14, 22 18, 30 30 C 36 38, 52 36, 60 34 C 68 36, 84 38, 90 30 C 98 18, 76 14, 60 34Z" ${r("--oro")}/>
    <circle cx="60" cy="33" r="6" ${r("--oro-hondo")}/>
    <path d="M26 60 h8 M30 56 v8 M82 82 h8 M86 78 v8 M34 88 h6 M37 85 v6" ${t("--nieve", 2)}/>
    ${destello(108, 24, 8)}`),
  derecha: () => S("0 0 120 112", `
    <path d="M60 0 L60 22" ${t("--oro", 2)}/>
    <rect x="50" y="20" width="20" height="12" rx="3" ${r("--oro")}/>
    <circle cx="60" cy="68" r="38" ${r("--esfera")}/>
    <path d="M24 60 C 40 70, 80 70, 96 60" ${t("--oro", 4)}/><path d="M26 78 C 42 88, 78 88, 94 78" ${t("--oro", 2)}/>
    ${estrella(42, 70, 5, "--oro-luz")}${estrella(60, 72, 6, "--oro-luz")}${estrella(78, 70, 5, "--oro-luz")}
    <ellipse cx="44" cy="48" rx="10" ry="6" transform="rotate(-30 44 48)" style="fill:#fff;opacity:.35"/>`),
  centro: () => {
    // Árbol hecho con una espiral dorada que se cierra hacia arriba
    let d = "", vueltas = 6, pasos = 240;
    for (let i = 0; i <= pasos; i++) {
      const k = i / pasos, y = 140 - k * 112, ancho = (1 - k) * 56 + 4, a = k * vueltas * Math.PI * 2;
      d += `${i ? "L" : "M"}${(70 + Math.sin(a) * ancho).toFixed(1)} ${(y + Math.cos(a) * ancho * .14).toFixed(1)} `;
    }
    return S("0 0 140 150", `
      <ellipse cx="70" cy="144" rx="60" ry="6" style="fill:var(--oro);opacity:.25"/>
      <path d="${d}" ${t("--oro", 2.6)}/>
      ${estrella(70, 20, 15)}${destello(26, 46, 7)}${destello(118, 70, 6)}${destello(20, 112, 5)}${destello(124, 124, 7)}
      ${estrella(40, 92, 4, "--oro-luz")}${estrella(100, 104, 4, "--oro-luz")}${estrella(58, 62, 3.5, "--oro-luz")}`);
  },
  adorno: () => S("0 0 60 60", estrella(30, 31, 26)),
  hoja: () => S("0 0 60 60", `
    <g ${t("--nieve", 3)}>
      <path d="M30 4 V56 M7.5 17 L52.5 43 M7.5 43 L52.5 17"/>
      <path d="M24 10 L30 16 L36 10 M24 50 L30 44 L36 50 M9 26 L17 22 L13 14 M51 34 L43 38 L47 46 M9 34 L17 38 L13 46 M51 26 L43 22 L47 14"/>
    </g><circle cx="30" cy="30" r="4" ${r("--oro")}/>`),
  rama: () => {
    const focos = ["--foco-1", "--foco-2", "--foco-3", "--foco-4"];
    let s = `<path d="M0 8 C 30 34, 60 40, 130 26" ${t("--cable", 2)}/>`;
    [[10, 16], [30, 27], [52, 33], [74, 33], [96, 30], [118, 27]].forEach(([x, y], i) => {
      const v = focos[i % 4];
      s += `<circle cx="${x}" cy="${y + 10}" r="9" style="fill:var(${v});opacity:.35"/>`;
      s += `<rect x="${x - 3}" y="${y}" width="6" height="5" rx="1" ${r("--oro-hondo")}/>`;
      s += `<ellipse cx="${x}" cy="${y + 10}" rx="5" ry="7" ${r(v)}/><ellipse cx="${x - 1.6}" cy="${y + 7.5}" rx="1.5" ry="2.4" style="fill:#fff;opacity:.7"/>`;
    });
    return S("0 0 130 64", s);
  }
};
})();
