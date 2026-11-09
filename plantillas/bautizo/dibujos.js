/* Dibujos del template «bautizo»: rosas color crema con hojas verde salvia (estilo acuarela)
   y detalles dorados (cruz, paloma, ramitas de línea fina).
   Cada dibujo ocupa un lugar fijo de la invitación:
     rama                → ramo de rosas de las esquinas (arriba en la portada y abajo en el pie)
     izquierda / derecha → ramito de rosas bajo la foto y a los lados del cierre
     centro              → paloma dorada con ramita de olivo (entre papás y padrinos, cierre y "¡Gracias!")
     adorno              → cruz dorada con laureles (arriba de la portada, separadores, pie)
     hoja                → ramita dorada de línea fina (a los lados de los separadores)
   Todo toma el color de las variables de estilos.css (--petalo, --rosa-centro, --verde, --oro…). */
(function () {
let k = 0;
const n = (v) => Math.round(v * 10) / 10;
const sc = (v) => `style="stop-color:var(${v})"`;

// Degradados propios de cada dibujo (ids únicos para que no choquen entre sí)
const defs = (u) => `<defs>
  <radialGradient id="${u}p" cx=".5" cy="1" r="1"><stop offset="0" ${sc("--rosa-centro")}/><stop offset=".55" ${sc("--petalo")}/><stop offset="1" ${sc("--petalo-orilla")}/></radialGradient>
  <radialGradient id="${u}c" cx=".5" cy=".5" r=".6"><stop offset="0" ${sc("--rosa-hondo")}/><stop offset="1" ${sc("--rosa-centro")}/></radialGradient>
  <linearGradient id="${u}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" ${sc("--verde-hondo")}/><stop offset=".55" ${sc("--verde")}/><stop offset="1" ${sc("--verde-claro")}/></linearGradient>
  <linearGradient id="${u}o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" ${sc("--oro-hondo")}/><stop offset=".42" ${sc("--oro")}/><stop offset=".58" ${sc("--oro-luz")}/><stop offset="1" ${sc("--oro")}/></linearGradient>
  <linearGradient id="${u}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc("--paper")}/><stop offset="1" ${sc("--oro-luz")}/></linearGradient>
  <filter id="${u}b" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>`;
const S = (vb, pinta) => { const u = `bz${++k}-`; return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${defs(u)}${pinta(u)}</svg>`; };
const linea = (v, ancho = 1) => `style="fill:none;stroke:var(${v});stroke-width:${ancho};stroke-linecap:round;stroke-linejoin:round"`;

// ---------- Piezas ----------
// Rosa vista desde arriba: sombra suave, 6 pétalos de fuera, 5 de en medio y el centro en espiral
const rosa = (u, x, y, r, giro = 0) => {
  let s = `<g transform="translate(${x} ${y}) rotate(${giro})">`;
  s += `<ellipse cx="${n(r * .1)}" cy="${n(r * .22)}" rx="${n(r * 1.02)}" ry="${n(r * .92)}" style="fill:var(--sombra);opacity:.32" filter="url(#${u}b)"/>`;
  for (let i = 0; i < 6; i++)
    s += `<ellipse cx="0" cy="${n(-r * .5)}" rx="${n(r * .56)}" ry="${n(r * .5)}" transform="rotate(${i * 60 + 12})" style="fill:url(#${u}p);stroke:var(--petalo-linea);stroke-width:.6"/>`;
  for (let i = 0; i < 5; i++)
    s += `<ellipse cx="0" cy="${n(-r * .3)}" rx="${n(r * .4)}" ry="${n(r * .33)}" transform="rotate(${i * 72 + 40})" style="fill:url(#${u}p);stroke:var(--petalo-linea);stroke-width:.55"/>`;
  for (let i = 0; i < 4; i++)
    s += `<ellipse cx="0" cy="${n(-r * .17)}" rx="${n(r * .27)}" ry="${n(r * .22)}" transform="rotate(${i * 90 + 10})" style="fill:url(#${u}p);stroke:var(--petalo-linea);stroke-width:.5"/>`;
  s += `<circle r="${n(r * .22)}" style="fill:url(#${u}c);stroke:var(--petalo-linea);stroke-width:.5"/>`;
  s += `<path ${linea("--rosa-trazo", .8)} d="M${n(-r * .2)} ${n(r * .02)} A ${n(r * .19)} ${n(r * .19)} 0 1 1 ${n(r * .12)} ${n(r * .15)} M${n(-r * .09)} ${n(-r * .04)} A ${n(r * .09)} ${n(r * .09)} 0 1 0 ${n(r * .08)} ${n(r * .03)}"/>`;
  s += `<path ${linea("--petalo-linea", .7)} d="M${n(-r * .62)} ${n(-r * .28)} Q ${n(-r * .5)} ${n(-r * .58)}, ${n(-r * .18)} ${n(-r * .66)} M${n(r * .58)} ${n(r * .3)} Q ${n(r * .62)} ${n(r * .58)}, ${n(r * .28)} ${n(r * .7)}"/>`;
  return s + "</g>";
};
// Flor pequeña de cinco pétalos blancos con centro dorado
const florecita = (x, y, r, giro = 0) => {
  let s = `<g transform="translate(${x} ${y}) rotate(${giro})">`;
  for (let i = 0; i < 5; i++)
    s += `<ellipse cx="0" cy="${n(-r * .52)}" rx="${n(r * .36)}" ry="${n(r * .54)}" transform="rotate(${i * 72})" style="fill:var(--petalo-blanco);stroke:var(--petalo-linea);stroke-width:.5"/>`;
  s += `<circle r="${n(r * .22)}" style="fill:var(--oro)"/>`;
  for (let i = 0; i < 6; i++) { const a = (i * 60 * Math.PI) / 180; s += `<circle cx="${n(Math.cos(a) * r * .32)}" cy="${n(Math.sin(a) * r * .32)}" r="${n(r * .05)}" style="fill:var(--oro-hondo)"/>`; }
  return s + "</g>";
};
// Botón de rosa con su cáliz verde, apuntando al ángulo `a`
const boton = (u, x, y, r, a) => `<g transform="translate(${x} ${y}) rotate(${a})">
  <path style="fill:url(#${u}p);stroke:var(--petalo-linea);stroke-width:.6" d="M0 0 C ${n(r * .9)} ${n(-r * .7)}, ${n(r * 1.9)} ${n(-r * .5)}, ${n(r * 2.1)} 0 C ${n(r * 1.9)} ${n(r * .5)}, ${n(r * .9)} ${n(r * .7)}, 0 0Z"/>
  <path style="fill:var(--verde);stroke:none" d="M-1 0 C ${n(r * .5)} ${n(-r * .6)}, ${n(r * .9)} ${n(-r * .6)}, ${n(r * 1.2)} ${n(-r * .2)} C ${n(r * .8)} 0, ${n(r * .4)} 0, -1 0Z M-1 0 C ${n(r * .5)} ${n(r * .6)}, ${n(r * .9)} ${n(r * .6)}, ${n(r * 1.2)} ${n(r * .2)} C ${n(r * .8)} 0, ${n(r * .4)} 0, -1 0Z"/>
  <path ${linea("--verde-hondo", 1)} d="M0 0 L ${n(-r * 1.4)} ${n(r * .1)}"/></g>`;
// Hoja de rosal: punta fina, degradado verde y nervadura clara
const hoja = (u, x, y, largo, a, ancho = .3) => {
  const w = largo * ancho;
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(a)})">
  <path style="fill:url(#${u}h);opacity:.92" d="M0 0 C ${n(largo * .25)} ${n(-w)}, ${n(largo * .7)} ${n(-w * .9)}, ${largo} 0 C ${n(largo * .7)} ${n(w * .9)}, ${n(largo * .25)} ${n(w)}, 0 0Z"/>
  <path ${linea("--verde-nervio", .6)} d="M${n(largo * .05)} 0 L ${n(largo * .86)} 0"/></g>`;
};
// Punto y ángulo sobre una curva Bézier (para repartir hojas a lo largo de un tallo)
const bez = (p, t) => {
  const v = 1 - t;
  const x = v * v * v * p[0] + 3 * v * v * t * p[2] + 3 * v * t * t * p[4] + t * t * t * p[6];
  const y = v * v * v * p[1] + 3 * v * v * t * p[3] + 3 * v * t * t * p[5] + t * t * t * p[7];
  const dx = 3 * v * v * (p[2] - p[0]) + 6 * v * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
  const dy = 3 * v * v * (p[3] - p[1]) + 6 * v * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
  return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
};
const curva = (p) => `M${p[0]} ${p[1]} C ${p[2]} ${p[3]}, ${p[4]} ${p[5]}, ${p[6]} ${p[7]}`;
// Tallo verde con hojas alternadas
const tallo = (u, p, hojas, largo, desde = .15) => {
  let s = `<path ${linea("--verde-hondo", 1.1)} d="${curva(p)}"/>`;
  for (let i = 0; i < hojas; i++) {
    const t = desde + ((1 - desde) * i) / Math.max(hojas - 1, 1);
    const q = bez(p, Math.min(t, .97));
    s += hoja(u, q.x, q.y, largo * (1 - t * .35), q.a + (i % 2 ? 42 : -42));
  }
  const f = bez(p, 1);
  return s + hoja(u, f.x, f.y, largo * .6, f.a);
};
// Rama de eucalipto: hojitas redondas verde grisáceo
const eucalipto = (p, cuantas, r) => {
  let s = `<path ${linea("--salvia-hondo", .9)} d="${curva(p)}"/>`;
  for (let i = 0; i < cuantas; i++) {
    const t = .12 + (.86 * i) / Math.max(cuantas - 1, 1), q = bez(p, t), lado = i % 2 ? 1 : -1;
    const rad = ((q.a + lado * 90) * Math.PI) / 180, rr = r * (1 - t * .4);
    s += `<circle cx="${n(q.x + Math.cos(rad) * rr * .9)}" cy="${n(q.y + Math.sin(rad) * rr * .9)}" r="${n(rr)}" style="fill:var(--salvia);opacity:.85"/>`;
  }
  return s;
};
// Ramita dorada de línea fina (contornos de hojas)
const ramitaOro = (p, cuantas, largo) => {
  let s = `<path ${linea("--oro", .9)} d="${curva(p)}"/>`;
  for (let i = 0; i < cuantas; i++) {
    const t = .15 + (.8 * i) / Math.max(cuantas - 1, 1), q = bez(p, t), a = q.a + (i % 2 ? 48 : -48), l = largo * (1 - t * .3), w = l * .32;
    s += `<path ${linea("--oro", .8)} transform="translate(${n(q.x)} ${n(q.y)}) rotate(${n(a)})" d="M0 0 C ${n(l * .3)} ${n(-w)}, ${n(l * .7)} ${n(-w)}, ${n(l)} 0 C ${n(l * .7)} ${n(w)}, ${n(l * .3)} ${n(w)}, 0 0Z M${n(l * .1)} 0 L ${n(l * .7)} 0"/>`;
  }
  return s;
};
const brillos = (pts) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:var(--oro);opacity:.75"/>`).join("");

// Cruz latina con extremos ensanchados, rellena de dorado
const cruz = (u, cx, top, alto) => {
  const g = alto * .14, brazo = alto * .33, yb = top + alto * .3;
  const P = [
    [cx - g / 2, top + g * .5], [cx - g * .8, top], [cx + g * .8, top], [cx + g / 2, top + g * .5],
    [cx + g / 2, yb - g / 2], [cx + brazo - g * .5, yb - g / 2], [cx + brazo, yb - g * .8], [cx + brazo, yb + g * .8], [cx + brazo - g * .5, yb + g / 2],
    [cx + g / 2, yb + g / 2], [cx + g / 2, top + alto - g * .5], [cx + g * .8, top + alto], [cx - g * .8, top + alto], [cx - g / 2, top + alto - g * .5],
    [cx - g / 2, yb + g / 2], [cx - brazo + g * .5, yb + g / 2], [cx - brazo, yb + g * .8], [cx - brazo, yb - g * .8], [cx - brazo + g * .5, yb - g / 2], [cx - g / 2, yb - g / 2],
  ];
  return `<path style="fill:url(#${u}o);stroke:var(--oro-hondo);stroke-width:.6;stroke-linejoin:round" d="M${P.map(([x, y]) => `${n(x)} ${n(y)}`).join(" L ")}Z"/>`;
};

// Paloma en vuelo mirando a la derecha, con ramita de olivo en el pico
const paloma = (u) => `
  <path style="fill:url(#${u}d);stroke:var(--oro);stroke-width:1.1;stroke-linejoin:round" d="M70 44 C 70 28, 64 16, 52 6 C 70 12, 82 26, 81 42Z"/>
  <path style="fill:url(#${u}d);stroke:var(--oro);stroke-width:1.1;stroke-linejoin:round" d="M38 53 L 12 47 L 17 53 L 8 57 L 17 60 L 12 66 L 41 59Z"/>
  <path style="fill:url(#${u}d);stroke:var(--oro);stroke-width:1.2;stroke-linejoin:round" d="M24 57 L 36 51 C 50 53, 66 51, 78 45 C 84 41, 86 33, 93 30 C 99 28, 103 31, 104 35 L 111 37 L 103 39.5 C 100 46, 92 53, 82 57 C 68 63, 50 63, 36 59Z"/>
  <path style="fill:url(#${u}d);stroke:var(--oro);stroke-width:1.1;stroke-linejoin:round" d="M60 48 C 52 31, 40 18, 20 9 C 32 21, 31 27, 42 30 C 33 32, 36 38, 46 40 C 41 43, 46 47, 60 48Z"/>
  <path ${linea("--oro", .7)} d="M54 44 C 46 34, 38 26, 28 18 M52 38 C 46 34, 41 32, 36 31 M16 54 L 36 56 M16 60 L 37 58 M48 56 C 56 58, 66 56, 74 52"/>
  <circle cx="96" cy="33.5" r="1.4" style="fill:var(--oro-hondo)"/>
  <path ${linea("--oro", 1)} d="M106 38 C 109 43, 113 47, 118 50"/>
  ${hoja(u, 109, 42, 9, 120)}${hoja(u, 112, 45, 9, 10)}${hoja(u, 115, 48, 8, 115)}${hoja(u, 118, 50, 7, 40)}`;

// Ramito para la foto: una rosa al frente y tallos que salen hacia la izquierda
const ramito = (u) => `
  ${ramitaOro([118, 50, 90, 30, 50, 22, 10, 8], 6, 11)}
  ${eucalipto([116, 60, 90, 72, 60, 82, 18, 86], 8, 5)}
  ${tallo(u, [120, 52, 96, 44, 60, 40, 14, 36], 7, 20)}
  ${tallo(u, [124, 62, 104, 76, 80, 88, 50, 96], 4, 17)}
  ${boton(u, 70, 36, 7, 200)}
  ${florecita(88, 70, 11, 15)}
  ${rosa(u, 150, 60, 15, 30)}
  ${rosa(u, 122, 54, 25)}
  ${florecita(102, 34, 9, 40)}
  ${brillos([[36, 20, 1.2], [58, 64, 1], [80, 18, 1.4], [26, 70, 1], [140, 28, 1.1]])}`;

window.__DIBUJOS__ = {
  rama: () => S("0 0 220 200", (u) => `
    ${ramitaOro([140, 6, 168, 14, 196, 30, 214, 62], 6, 12)}
    ${ramitaOro([8, 140, 16, 160, 22, 180, 34, 198], 5, 11)}
    ${eucalipto([70, 60, 104, 86, 132, 106, 158, 134], 10, 6.5)}
    ${eucalipto([150, 20, 172, 36, 190, 50, 204, 84], 7, 5)}
    ${tallo(u, [70, 36, 110, 18, 160, 26, 210, 18], 9, 26)}
    ${tallo(u, [40, 70, 24, 100, 36, 142, 20, 192], 7, 24)}
    ${tallo(u, [84, 60, 104, 72, 116, 96, 120, 124], 5, 20)}
    ${hoja(u, 60, 50, 52, 8)}${hoja(u, 58, 58, 50, 40)}${hoja(u, 50, 62, 48, 72)}${hoja(u, 42, 64, 46, 104)}
    ${hoja(u, 128, 40, 36, -12)}${hoja(u, 126, 48, 34, 30)}${hoja(u, 40, 128, 34, 70)}${hoja(u, 46, 124, 32, 30)}
    ${boton(u, 172, 44, 8, 20)}${boton(u, 52, 156, 7, 110)}${boton(u, 150, 60, 6, 40)}
    ${rosa(u, 120, 34, 27, 20)}
    ${rosa(u, 32, 116, 25, -15)}
    ${rosa(u, 90, 82, 17, 50)}
    ${rosa(u, 36, 34, 46)}
    ${florecita(156, 22, 11, 10)}${florecita(70, 96, 11, 30)}${florecita(14, 160, 9)}${florecita(142, 74, 8, 50)}${florecita(96, 14, 8, 20)}
    ${brillos([[126, 88, 1.4], [150, 100, 1], [104, 124, 1.2], [180, 74, 1.5], [72, 146, 1], [192, 46, 1], [98, 152, 1.3], [62, 180, 1], [168, 112, 1.1]])}`),
  izquierda: () => S("0 0 170 100", ramito),
  derecha: () => S("0 0 170 100", (u) => `<g transform="translate(170 0) scale(-1 1)">${ramito(u)}</g>`),
  centro: () => S("0 0 124 72", paloma),
  adorno: () => S("0 0 60 60", (u) => `
    <path ${linea("--oro", .9)} d="M30 50 C 22 50, 14 46, 9 38 M30 50 C 38 50, 46 46, 51 38"/>
    ${[[24, 50, 160], [18, 48.5, 175], [13, 45, 195], [9.5, 40, 215]].map(([x, y, a]) => `<path ${linea("--oro", .8)} transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C 2 -2.4, 5 -2.4, 7 0 C 5 2.4, 2 2.4, 0 0Z"/>`).join("")}
    ${[[36, 50, 20], [42, 48.5, 5], [47, 45, -15], [50.5, 40, -35]].map(([x, y, a]) => `<path ${linea("--oro", .8)} transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C 2 -2.4, 5 -2.4, 7 0 C 5 2.4, 2 2.4, 0 0Z"/>`).join("")}
    ${cruz(u, 30, 3, 44)}
    <path style="fill:var(--oro)" d="M30 58 C 27 55.5, 25.5 54, 25.5 52.6 C 25.5 51, 27.6 50.4, 30 52.2 C 32.4 50.4, 34.5 51, 34.5 52.6 C 34.5 54, 33 55.5, 30 58Z"/>`),
  hoja: (flip) => S("0 0 70 24", (u) => `<g ${flip ? 'transform="translate(70 0) scale(-1 1)"' : ""}>
    ${ramitaOro([68, 12, 50, 12, 26, 10, 4, 13], 6, 9)}
    <circle cx="68" cy="12" r="1.6" style="fill:var(--oro)"/></g>`),
};
})();
