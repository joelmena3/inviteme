/* Dibujos del template «superheroes»: estilo cómic, todos originales (sin personajes ni logotipos de marcas).
   Cada dibujo ocupa un lugar fijo de la invitación:
     izquierda / derecha → estallido "¡POW!" y antifaz junto a la foto de portada, en el pie y en los pases
     centro              → superhéroe niño con capa del cierre y del "¡Gracias!"
     adorno              → rayo (portada, separadores, línea del tiempo)
     hoja                → estrellitas de cómic (separadores y puntos de la línea del tiempo)
     rama                → ciudad de noche en las esquinas de la portada
   Los colores salen de las variables de estilos.css (--c1 … --c6, --c-line, --piel, --pelo). */
(function () {
const S = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="svg-fill">${inner}</svg>`;
const f = v => `style="fill:var(${v})"`;
const sinTrazo = v => `style="fill:var(${v});stroke:none"`;

// Estallido de cómic: polígono de picos alrededor de (cx, cy)
const estallido = (cx, cy, rFuera, rDentro, picos, giro = 0) => {
  let d = "";
  for (let i = 0; i < picos * 2; i++) {
    const r = i % 2 ? rDentro : rFuera * (i % 4 === 0 ? 1 : .88);
    const a = (i / (picos * 2)) * Math.PI * 2 + giro;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} `;
  }
  return d + "Z";
};
const estrella = (cx, cy, r, v) => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * .45 : r, a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path ${f(v)} d="${d}Z"/>`;
};
const rayo = (v = "--c2") => `<path ${f(v)} d="M34 2 L10 34 L26 34 L18 58 L50 22 L33 22 L42 2 Z"/>`;

window.__DIBUJOS__ = {
  izquierda: () => S("0 0 120 112", `
    <path ${f("--c2")} d="${estallido(60, 56, 56, 34, 12, .2)}"/>
    <path ${sinTrazo("--c1")} d="${estallido(60, 56, 38, 24, 12, .45)}"/>
    <text x="60" y="66" text-anchor="middle" transform="rotate(-10 60 56)" style="font-family:var(--f-name);font-size:30px;fill:var(--paper);stroke:var(--c-line);stroke-width:2.4;paint-order:stroke;letter-spacing:1px">¡POW!</text>`),
  derecha: () => S("0 0 120 112", `
    <path ${f("--c3")} d="M8 50 C 10 32, 30 26, 46 34 C 52 37, 56 40, 60 40 C 64 40, 68 37, 74 34 C 90 26, 110 32, 112 50 C 114 70, 98 80, 82 76 C 72 74, 66 66, 60 66 C 54 66, 48 74, 38 76 C 22 80, 6 70, 8 50 Z"/>
    <path ${f("--paper")} d="M24 52 C 28 42, 42 42, 46 52 C 42 58, 28 58, 24 52 Z"/>
    <path ${f("--paper")} d="M74 52 C 78 42, 92 42, 96 52 C 92 58, 78 58, 74 52 Z"/>
    <path d="M10 46 C 0 40, -2 30, 4 24 M110 46 C 120 40, 122 30, 116 24" style="fill:none;stroke:var(--c3);stroke-width:7;stroke-linecap:round"/>
    <path d="M16 38 C 28 30, 40 32, 48 38" style="fill:none;stroke:var(--paper);stroke-width:3;stroke-linecap:round;opacity:.7"/>`),
  centro: () => S("0 0 140 150", `
    <path ${f("--c1")} d="M44 52 C 30 80, 18 112, 10 142 L 70 132 L 130 142 C 122 112, 110 80, 96 52 Z"/>
    <path ${f("--c3")} d="M50 112 L 48 136 L 66 136 L 68 112 Z"/><path ${f("--c3")} d="M72 112 L 74 136 L 92 136 L 90 112 Z"/>
    <path ${f("--c1")} d="M44 132 L 44 146 L 70 146 L 68 132 Z"/><path ${f("--c1")} d="M72 132 L 74 146 L 98 146 L 94 132 Z"/>
    <path ${f("--c3")} d="M46 62 C 46 54, 52 50, 70 50 C 88 50, 94 54, 94 62 L 92 114 L 48 114 Z"/>
    <path d="M48 66 C 34 74, 30 88, 44 96 M92 66 C 106 74, 110 88, 96 96" style="fill:none;stroke:var(--c3);stroke-width:12;stroke-linecap:round"/>
    <circle cx="44" cy="96" r="8" ${f("--c1")}/><circle cx="96" cy="96" r="8" ${f("--c1")}/>
    <path ${f("--c2")} d="M48 102 L 92 102 L 92 112 L 48 112 Z"/><rect x="64" y="101" width="12" height="12" rx="2" ${f("--c1")}/>
    <circle cx="70" cy="76" r="14" ${f("--c2")}/>${estrella(70, 76, 10, "--c1")}
    <circle cx="70" cy="30" r="22" ${f("--piel")}/>
    <path ${f("--pelo")} d="M48 28 C 46 10, 64 4, 74 8 C 84 4, 96 14, 92 28 C 86 18, 78 16, 70 18 C 62 14, 54 18, 48 28 Z"/>
    <path ${f("--c1")} d="M47 30 C 52 24, 62 24, 70 28 C 78 24, 88 24, 93 30 C 92 38, 84 40, 78 38 C 74 36, 72 34, 70 34 C 68 34, 66 36, 62 38 C 56 40, 48 38, 47 30 Z"/>
    <ellipse cx="59" cy="31" rx="4.5" ry="3" ${sinTrazo("--paper")}/><ellipse cx="81" cy="31" rx="4.5" ry="3" ${sinTrazo("--paper")}/>
    <path d="M62 42 C 66 47, 74 47, 78 42" style="fill:none;stroke:var(--c-line);stroke-width:2.4;stroke-linecap:round"/>`),
  adorno: () => S("0 0 60 60", rayo()),
  hoja: (flip) => S("0 0 60 60", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    ${estrella(20, 38, 16, "--c2")}${estrella(44, 16, 11, "--c1")}${estrella(48, 46, 7, "--c3")}</g>`),
  rama: () => {
    const edif = [[0, 30, 18], [16, 14, 20], [34, 24, 16], [48, 6, 22], [68, 22, 18], [84, 34, 16], [98, 18, 16], [112, 30, 18]];
    let s = "";
    edif.forEach(([x, top, w], i) => {
      s += `<rect x="${x}" y="${top}" width="${w}" height="${64 - top}" ${f(i % 2 ? "--c4" : "--c3")}/>`;
      for (let y = top + 6; y < 58; y += 9) for (let k = 0; k < 2; k++)
        if ((x + y + k * 7) % 3) s += `<rect x="${x + 4 + k * (w / 2 - 2)}" y="${y}" width="4" height="4" style="fill:var(--c2);stroke:none"/>`;
    });
    return S("0 0 130 64", s + `<g transform="translate(96 -6) scale(.42)">${rayo()}</g>`);
  }
};
})();
