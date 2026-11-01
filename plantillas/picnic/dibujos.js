/* Dibujos del template «picnic»: zorrito, conejita, erizo, hongos y hojas.
   Cada dibujo ocupa un lugar fijo de la invitación:
     izquierda / derecha → personajes junto a la foto de portada y en el pie
     centro              → personaje grande del cierre y del "¡Gracias!"
     adorno              → detalle pequeño (junto a la portada, separadores, línea del tiempo)
     hoja                → separadores y puntos de la línea del tiempo
     rama                → ramas de las esquinas de la portada
   Los colores salen de las variables de estilos.css (--c-fox, --leaf, etc.). */
(function () {
const S = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="svg-fill">${inner}</svg>`;
const f = v => `style="fill:var(${v})"`;
window.__DIBUJOS__ = {
  izquierda: () => S("0 0 120 112", `
    <path ${f("--c-fox")} d="M22 54 L28 10 L54 38 Z"/><path ${f("--c-fox")} d="M98 54 L92 10 L66 38 Z"/>
    <path ${f("--c-bunny-in")} style="stroke:none" d="M30 22 L46 40 L31 46Z"/><path ${f("--c-bunny-in")} style="stroke:none" d="M90 22 L74 40 L89 46Z"/>
    <path ${f("--c-fox")} d="M16 56 C 20 32, 100 32, 104 56 C 102 82, 80 102, 60 106 C 40 102, 18 82, 16 56Z"/>
    <path ${f("--c-fox-light")} d="M22 66 C 38 70, 50 78, 60 84 C 70 78, 82 70, 98 66 C 92 88, 76 101, 60 106 C 44 101, 28 88, 22 66Z"/>
    <path d="M38 62 q6 5 12 0 M70 62 q6 5 12 0" style="fill:none;stroke:var(--c-eye);stroke-width:2.8"/>
    <circle cx="36" cy="74" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="84" cy="74" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <ellipse cx="60" cy="88" rx="5.5" ry="4" style="fill:var(--c-eye);stroke:none"/>`),
  derecha: () => S("0 0 120 112", `
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
  centro: () => S("0 0 140 104", `
    <path ${f("--c-hedge")} d="M18 84 L12 68 L24 62 L18 48 L32 46 L30 32 L46 34 L50 20 L62 30 L74 18 L82 32 L96 26 L98 40 L112 40 L110 54 L124 60 L116 72 L124 84 Z"/>
    <ellipse cx="70" cy="74" rx="34" ry="24" ${f("--c-face")}/>
    <circle cx="58" cy="70" r="3.4" style="fill:var(--c-eye);stroke:none"/><circle cx="82" cy="70" r="3.4" style="fill:var(--c-eye);stroke:none"/>
    <circle cx="50" cy="80" r="5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="90" cy="80" r="5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <ellipse cx="70" cy="78" rx="4.5" ry="3.4" style="fill:var(--c-eye);stroke:none"/>
    <path d="M64 86 q6 5 12 0" style="fill:none;stroke:var(--c-eye);stroke-width:1.8"/>`),
  adorno: () => S("0 0 60 60", `
    <rect x="23" y="30" width="14" height="24" rx="6" ${f("--c-stem")}/>
    <path ${f("--c-mush")} d="M6 34 C 6 10, 54 10, 54 34 Q 30 41 6 34Z"/>
    <circle cx="20" cy="24" r="3.6" style="fill:#fff;stroke:none"/><circle cx="34" cy="18" r="3" style="fill:#fff;stroke:none"/><circle cx="42" cy="28" r="2.6" style="fill:#fff;stroke:none"/>`),
  hoja: (flip) => S("0 0 60 60", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    <path d="M8 54 C 22 40, 34 26, 52 8" style="fill:none;stroke:var(--leaf-deep);stroke-width:2"/>
    <path d="M30 32 C 18 30, 12 20, 14 12 C 24 14, 32 22, 30 32Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <path d="M40 20 C 46 10, 56 8, 60 12 C 56 20, 48 24, 40 20Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <path d="M22 44 C 30 46, 38 42, 42 34 C 32 32, 24 36, 22 44Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/></g>`),
  rama: () => {
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
})();
