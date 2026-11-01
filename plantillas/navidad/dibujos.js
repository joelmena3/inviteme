/* Dibujos del template «navidad»: reno, muñeco de nieve, árbol, esferas, acebo y pino.
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
    <path d="M42 44 C 36 30, 32 20, 24 8 M31 23 L16 20 M36 32 L22 34 M78 44 C 84 30, 88 20, 96 8 M89 23 L104 20 M84 32 L98 34" style="fill:none;stroke:#8A5A36;stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/>
    <ellipse cx="25" cy="54" rx="13" ry="6.5" transform="rotate(-24 25 54)" ${f("--c-fox")}/><ellipse cx="95" cy="54" rx="13" ry="6.5" transform="rotate(24 95 54)" ${f("--c-fox")}/>
    <ellipse cx="60" cy="70" rx="33" ry="32" ${f("--c-fox")}/>
    <ellipse cx="60" cy="88" rx="21" ry="15" ${f("--c-fox-light")}/>
    <circle cx="47" cy="66" r="3.6" style="fill:var(--c-eye);stroke:none"/><circle cx="73" cy="66" r="3.6" style="fill:var(--c-eye);stroke:none"/>
    <circle cx="48.2" cy="64.8" r="1.1" style="fill:#fff;stroke:none"/><circle cx="74.2" cy="64.8" r="1.1" style="fill:#fff;stroke:none"/>
    <circle cx="37" cy="78" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/><circle cx="83" cy="78" r="5.5" ${f("--c-cheek")} style="stroke:none;opacity:.8"/>
    <circle cx="60" cy="81" r="7.5" ${f("--c-mush")}/><circle cx="57.5" cy="78.5" r="2" style="fill:#fff;stroke:none;opacity:.8"/>
    <path d="M53 93 q7 6 14 0" style="fill:none;stroke:var(--c-eye);stroke-width:1.8;stroke-linecap:round"/>`),
  derecha: () => S("0 0 120 112", `
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
  centro: () => S("0 0 140 104", `
    <rect x="63" y="88" width="14" height="14" rx="2" style="fill:#8A5A36;stroke:none"/>
    <path ${f("--c-hedge")} d="M70 20 L44 52 L96 52 Z"/><path ${f("--c-hedge")} d="M70 36 L36 72 L104 72 Z"/><path ${f("--c-hedge")} d="M70 54 L28 92 L112 92 Z"/>
    <path ${f("--c-stem")} style="stroke:none" d="M70 3 L73.5 11 L82 11.5 L75.5 17 L77.5 25.5 L70 21 L62.5 25.5 L64.5 17 L58 11.5 L66.5 11 Z"/>
    <circle cx="58" cy="47" r="4" ${f("--c-mush")} style="stroke:none"/><circle cx="80" cy="44" r="3.4" ${f("--c-stem")} style="stroke:none"/>
    <circle cx="85" cy="65" r="4" ${f("--c-mush")} style="stroke:none"/><circle cx="54" cy="66" r="3.4" ${f("--c-stem")} style="stroke:none"/>
    <circle cx="62" cy="84" r="4" ${f("--c-stem")} style="stroke:none"/><circle cx="93" cy="86" r="4" ${f("--c-mush")} style="stroke:none"/><circle cx="44" cy="86" r="4" ${f("--c-mush")} style="stroke:none"/>`),
  adorno: () => S("0 0 60 60", `
    <circle cx="30" cy="6" r="3.2" style="fill:none;stroke:var(--c-stem);stroke-width:1.8"/>
    <rect x="24" y="8" width="12" height="8" rx="2" ${f("--c-stem")} style="stroke:none"/>
    <circle cx="30" cy="36" r="20" ${f("--c-mush")}/>
    <path d="M11 32 Q30 41 49 32" style="fill:none;stroke:var(--c-stem);stroke-width:3"/>
    <ellipse cx="22" cy="27" rx="5" ry="3" transform="rotate(-30 22 27)" style="fill:#fff;stroke:none;opacity:.55"/>`),
  hoja: (flip) => S("0 0 60 60", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    <path d="M30 34 Q23 31 22 25 Q15 25 13 19 Q8 17 8 10 Q17 10 21 14 Q25 11 30 16 Q33 24 30 34Z" style="fill:var(--leaf);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <path d="M30 34 Q37 31 38 25 Q45 25 47 19 Q52 17 52 10 Q43 10 39 14 Q35 11 30 16 Q27 24 30 34Z" style="fill:var(--leaf-deep);stroke:var(--c-line);stroke-width:calc(var(--sw) * .6)"/>
    <circle cx="25" cy="38" r="5.5" style="fill:var(--c-mush);stroke:none"/><circle cx="35" cy="38" r="5.5" style="fill:var(--c-mush);stroke:none"/><circle cx="30" cy="46" r="5.5" style="fill:var(--c-mush);stroke:none"/>
    <circle cx="23.5" cy="36.5" r="1.4" style="fill:#fff;stroke:none;opacity:.8"/><circle cx="33.5" cy="36.5" r="1.4" style="fill:#fff;stroke:none;opacity:.8"/></g>`),
  rama: () => {
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
})();
