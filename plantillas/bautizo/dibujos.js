/* Dibujos del template «bautizo»: símbolos católicos en línea fina verde olivo sobre beige.
   Cada dibujo ocupa un lugar fijo de la invitación:
     izquierda / derecha → paloma del Espíritu Santo con ramita de olivo (a los lados de la foto, del cierre y del pie)
     centro              → concha bautismal con gotas de agua y la cruz con destellos (cierre y "¡Gracias!")
     adorno              → cruz latina con halo (separadores, sobre el arco de la portada, línea del tiempo)
     hoja                → ramita de olivo (a los lados de los separadores)
     rama                → rama de olivo de las esquinas de la portada
   Todo toma el color de las variables de estilos.css (--verde, --verde-hondo, --verde-luz, --arena, --trigo, --paper). */
(function () {
const S = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const trazo = (ancho = 1.2, v = "--verde-hondo") => `style="fill:none;stroke:var(${v});stroke-width:${ancho};stroke-linecap:round;stroke-linejoin:round"`;
const relleno = (v = "--verde") => `style="fill:var(${v});stroke:none"`;
const pieza = (fondo, linea = "--verde-hondo", ancho = 1.3) => `style="fill:var(${fondo});stroke:var(${linea});stroke-width:${ancho};stroke-linejoin:round;stroke-linecap:round"`;
const n = (v) => Math.round(v * 10) / 10;

// Hoja de olivo: alargada y puntiaguda, nace en (x, y) y apunta al ángulo `a` (grados)
const hojaOlivo = (x, y, largo, a, v = "--verde") => {
  const w = largo * 0.22;
  return `<path ${relleno(v)} transform="translate(${n(x)} ${n(y)}) rotate(${n(a)})" d="M0 0 C ${n(largo * .3)} ${n(-w)}, ${n(largo * .72)} ${n(-w)}, ${largo} 0 C ${n(largo * .72)} ${n(w)}, ${n(largo * .3)} ${n(w)}, 0 0Z"/>`;
};
const aceituna = (x, y, r = 2.4) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${r}" ry="${n(r * 1.25)}" ${relleno("--verde-hondo")}/>`;

// Punto y ángulo de una curva Bézier cúbica (para repartir hojas a lo largo de una rama)
const bez = (p, t) => {
  const u = 1 - t;
  const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
  const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
  const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
  const dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
  return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
};
// Rama de olivo sobre una curva: tallo + hojas alternadas a cada lado (+ aceitunas opcionales)
const ramaOlivo = (p, hojas, largo, { desde = 0.1, ancho = 1.1, olivas = [] } = {}) => {
  let out = `<path ${trazo(ancho)} d="M${p[0]} ${p[1]} C ${p[2]} ${p[3]}, ${p[4]} ${p[5]}, ${p[6]} ${p[7]}"/>`;
  for (let i = 0; i < hojas; i++) {
    const t = desde + ((1 - desde) * i) / Math.max(hojas - 1, 1);
    const q = bez(p, Math.min(t, 0.98));
    const lado = i % 2 ? 1 : -1;
    const l = largo * (0.75 + 0.25 * (1 - Math.abs(t - 0.55)));
    out += hojaOlivo(q.x, q.y, l, q.a + lado * 38, i % 3 === 1 ? "--verde-hondo" : "--verde");
  }
  // Hoja final en la punta
  const fin = bez(p, 1);
  out += hojaOlivo(fin.x, fin.y, largo * 0.8, fin.a, "--verde");
  for (const t of olivas) { const q = bez(p, t); out += aceituna(q.x + 3, q.y + 4); }
  return out;
};

// Paloma en vuelo mirando a la derecha, con ramita de olivo en el pico
const paloma = `
  <path ${pieza("--paper", "--verde-hondo", 1.2)} d="M70 44 C 70 28, 64 16, 52 6 C 70 12, 82 26, 81 42Z"/>
  <path ${pieza("--paper")} d="M38 53 L 12 47 L 17 53 L 8 57 L 17 60 L 12 66 L 41 59Z"/>
  <path ${trazo(.7, "--verde")} d="M16 54 L 36 56 M16 60 L 37 58"/>
  <path ${pieza("--paper")} d="M24 57 L 36 51 C 50 53, 66 51, 78 45 C 84 41, 86 33, 93 30 C 99 28, 103 31, 104 35 L 111 37 L 103 39.5 C 100 46, 92 53, 82 57 C 68 63, 50 63, 36 59Z"/>
  <path ${pieza("--paper")} d="M60 48 C 52 31, 40 18, 20 9 C 32 21, 31 27, 42 30 C 33 32, 36 38, 46 40 C 41 43, 46 47, 60 48Z"/>
  <path ${trazo(.7, "--verde")} d="M54 44 C 46 34, 38 26, 28 18 M52 38 C 46 34, 41 32, 36 31"/>
  <circle cx="96" cy="33.5" r="1.4" ${relleno("--verde-hondo")}/>
  <path ${trazo(1)} d="M106 38 C 109 43, 113 47, 118 50"/>
  ${hojaOlivo(109, 42, 9, 120)}${hojaOlivo(112, 45, 9, 10, "--verde-hondo")}${hojaOlivo(115, 48, 8, 115)}${hojaOlivo(118, 50, 7, 40)}`;

// Concha bautismal: abanico con bordes ondulados, abierto hacia arriba
const concha = (cx, cy, r) => {
  const pasos = 8, a0 = 200, a1 = 340;
  const pt = (a, rr) => [cx + rr * Math.cos((a * Math.PI) / 180), cy + rr * Math.sin((a * Math.PI) / 180)];
  let borde = `M${n(cx - 6)} ${cy} L ${pt(a0, r).map(n).join(" ")}`;
  let costillas = "";
  for (let i = 0; i < pasos; i++) {
    const a = a0 + ((a1 - a0) * i) / pasos, b = a0 + ((a1 - a0) * (i + 1)) / pasos;
    const c = pt((a + b) / 2, r + 7), fin = pt(b, r);
    borde += ` Q ${n(c[0])} ${n(c[1])}, ${n(fin[0])} ${n(fin[1])}`;
    if (i > 0) { const p = pt(a, r); costillas += `<path ${trazo(.8)} d="M${cx} ${cy - 2} L ${n(p[0])} ${n(p[1])}"/>`; }
  }
  borde += ` L ${n(cx + 6)} ${cy}Z`;
  return `<path ${pieza("--arena-luz", "--verde-hondo", 1.3)} d="${borde}"/>${costillas}
    <path ${pieza("--arena", "--verde-hondo", 1.1)} d="M${cx - 9} ${cy + 6} L ${cx + 9} ${cy + 6} L ${cx + 5} ${cy - 1} L ${cx - 5} ${cy - 1}Z"/>`;
};
const gota = (x, y, s = 1) => `<path ${pieza("--verde-luz", "--verde", 1)} d="M${x} ${n(y - 5 * s)} C ${n(x + 3 * s)} ${n(y - 1 * s)}, ${n(x + 3.6 * s)} ${n(y + 2 * s)}, ${x} ${n(y + 3.6 * s)} C ${n(x - 3.6 * s)} ${n(y + 2 * s)}, ${n(x - 3 * s)} ${n(y - 1 * s)}, ${x} ${n(y - 5 * s)}Z"/>`;
const destellos = (cx, cy, r1, r2, cuantos = 12) => {
  let d = "";
  for (let i = 0; i < cuantos; i++) {
    const a = (i * 360) / cuantos, rad = (a * Math.PI) / 180, largo = i % 2 ? r2 * .82 : r2;
    d += `M${n(cx + r1 * Math.cos(rad))} ${n(cy + r1 * Math.sin(rad))} L ${n(cx + largo * Math.cos(rad))} ${n(cy + largo * Math.sin(rad))} `;
  }
  return `<path ${trazo(.8, "--trigo")} d="${d}"/>`;
};
// Cruz latina con extremos ligeramente ensanchados
const cruz = (cx, top, alto, v = "--verde-hondo") => {
  const g = alto * 0.13, brazo = alto * 0.34, yb = top + alto * 0.3;
  return `<path ${relleno(v)} d="M${n(cx - g / 2)} ${n(top + g * .5)} L ${n(cx - g * .8)} ${top} L ${n(cx + g * .8)} ${top} L ${n(cx + g / 2)} ${n(top + g * .5)}
    L ${n(cx + g / 2)} ${n(yb - g / 2)} L ${n(cx + brazo - g * .5)} ${n(yb - g / 2)} L ${n(cx + brazo)} ${n(yb - g * .8)} L ${n(cx + brazo)} ${n(yb + g * .8)} L ${n(cx + brazo - g * .5)} ${n(yb + g / 2)}
    L ${n(cx + g / 2)} ${n(yb + g / 2)} L ${n(cx + g / 2)} ${n(top + alto - g * .5)} L ${n(cx + g * .8)} ${n(top + alto)} L ${n(cx - g * .8)} ${n(top + alto)} L ${n(cx - g / 2)} ${n(top + alto - g * .5)}
    L ${n(cx - g / 2)} ${n(yb + g / 2)} L ${n(cx - brazo + g * .5)} ${n(yb + g / 2)} L ${n(cx - brazo)} ${n(yb + g * .8)} L ${n(cx - brazo)} ${n(yb - g * .8)} L ${n(cx - brazo + g * .5)} ${n(yb - g / 2)}
    L ${n(cx - g / 2)} ${n(yb - g / 2)}Z"/>`;
};

window.__DIBUJOS__ = {
  izquierda: () => S("0 0 122 70", paloma),
  derecha: () => S("0 0 122 70", `<g transform="translate(122 0) scale(-1 1)">${paloma}</g>`),
  centro: () => S("0 0 160 110", `
    ${destellos(80, 20, 13, 21, 16)}
    <circle cx="80" cy="20" r="10" ${trazo(.8, "--trigo")}/>
    ${cruz(80, 4, 36)}
    ${gota(70, 52, .9)}${gota(80, 57, 1.1)}${gota(90, 52, .9)}
    ${ramaOlivo([76, 104, 56, 104, 30, 96, 10, 76], 7, 12, { desde: .2, olivas: [.55] })}
    ${ramaOlivo([84, 104, 104, 104, 130, 96, 150, 76], 7, 12, { desde: .2, olivas: [.55] })}
    ${concha(80, 102, 34)}`),
  adorno: () => S("0 0 40 40", `
    <circle cx="20" cy="13" r="8.5" ${trazo(.8, "--trigo")}/>
    ${cruz(20, 2, 36, "--verde")}`),
  hoja: (flip) => S("0 0 60 24", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    ${ramaOlivo([58, 13, 44, 13, 22, 10, 3, 13], 6, 9, { desde: .12, ancho: 1 })}
    ${aceituna(30, 17.5, 2)}</g>`),
  rama: () => S("0 0 130 80", `
    ${ramaOlivo([4, 6, 40, 4, 84, 10, 126, 30], 11, 13, { desde: .08, olivas: [.38, .74] })}
    ${ramaOlivo([6, 8, 4, 30, 8, 52, 20, 74], 7, 12, { desde: .14, olivas: [.5] })}
    ${cruz(6, 1, 13, "--verde-hondo")}`),
};
})();
