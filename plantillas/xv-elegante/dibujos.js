/* Dibujos del template «xv-elegante»: ornamentos clásicos de línea dorada (volutas, rombos, filigrana).
   Cada dibujo ocupa un lugar fijo de la invitación:
     izquierda / derecha → volutas a los lados del cierre y del pie (en la portada se ocultan desde estilos.css)
     centro              → ornamento central del cierre y del "¡Gracias!"
     adorno              → rombo pequeño (separadores)
     hoja                → voluta corta a los lados de los separadores
     rama                → filigrana de las esquinas de la portada
   Todo toma el color de las variables de estilos.css (--oro, --oro-luz). */
(function () {
const S = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const trazo = (ancho = 1.2) => `style="fill:none;stroke:var(--oro);stroke-width:${ancho};stroke-linecap:round;stroke-linejoin:round"`;
const relleno = (v = "--oro") => `style="fill:var(${v});stroke:none"`;
const rombo = (x, y, r, v = "--oro") => `<path ${relleno(v)} d="M${x} ${y - r} L${x + r * .62} ${y} L${x} ${y + r} L${x - r * .62} ${y}Z"/>`;

// Voluta larga: nace a la derecha (x = 118) y se enrosca hacia la izquierda
const voluta = `
  <path ${trazo(1.3)} d="M118 20 C 96 20, 88 31, 68 29 C 48 27, 42 12, 26 12 C 14 12, 8 19, 11 25 C 14 31, 23 30, 23 24 C 23 19, 18 18, 16 21"/>
  <path ${trazo(1)} d="M80 25 C 76 15, 83 8, 91 10 C 97 12, 97 19, 91 19"/>
  <path ${trazo(1)} d="M50 25 C 54 34, 47 38, 41 35"/>
  <path ${trazo(.8)} d="M100 21 C 104 27, 110 28, 113 25"/>
  ${rombo(118, 20, 3.4)}<circle cx="34" cy="24" r="1.3" ${relleno()}/>`;

window.__DIBUJOS__ = {
  izquierda: () => S("0 0 122 40", voluta),
  derecha: () => S("0 0 122 40", `<g transform="translate(122 0) scale(-1 1)">${voluta}</g>`),
  centro: () => S("0 0 140 60", `
    <path ${trazo(1.2)} d="M70 8 L84 30 L70 52 L56 30Z"/>
    <path ${trazo(.8)} d="M70 16 L79 30 L70 44 L61 30Z"/>
    ${rombo(70, 30, 5)}
    <path ${trazo(1.1)} d="M54 30 C 44 30, 40 22, 32 22 C 24 22, 22 30, 27 33 C 31 35, 34 31, 31 29"/>
    <path ${trazo(1.1)} d="M86 30 C 96 30, 100 22, 108 22 C 116 22, 118 30, 113 33 C 109 35, 106 31, 109 29"/>
    <path ${trazo(.9)} d="M40 34 C 30 40, 18 40, 6 34 M100 34 C 110 40, 122 40, 134 34"/>
    <circle cx="70" cy="3" r="1.6" ${relleno()}/><circle cx="70" cy="57" r="1.6" ${relleno()}/>
    <circle cx="4" cy="33" r="1.4" ${relleno()}/><circle cx="136" cy="33" r="1.4" ${relleno()}/>`),
  adorno: () => S("0 0 40 40", `
    <path ${trazo(1.1)} d="M20 4 L31 20 L20 36 L9 20Z"/>${rombo(20, 20, 6)}
    <circle cx="20" cy="1.6" r="1.2" ${relleno()}/><circle cx="20" cy="38.4" r="1.2" ${relleno()}/>`),
  hoja: (flip) => S("0 0 60 24", `<g ${flip ? 'transform="translate(60 0) scale(-1 1)"' : ""}>
    <path ${trazo(1.1)} d="M58 12 C 44 12, 38 20, 26 19 C 14 18, 10 8, 4 8 C 1 8, 0 12, 3 13"/>
    <path ${trazo(.8)} d="M40 15 C 38 8, 44 4, 49 6"/>
    <circle cx="58" cy="12" r="1.4" ${relleno()}/></g>`),
  rama: () => S("0 0 130 64", `
    <path ${trazo(1.1)} d="M4 4 L 126 4"/><path ${trazo(.7)} d="M10 9 L 96 9"/>
    <path ${trazo(1.1)} d="M4 4 L 4 60"/><path ${trazo(.7)} d="M9 10 L 9 44"/>
    <path ${trazo(1)} d="M9 9 C 22 9, 30 16, 30 24 C 30 31, 23 34, 19 30 C 16 27, 18 22, 22 23"/>
    <path ${trazo(.9)} d="M30 20 C 40 14, 50 16, 54 22 M24 32 C 22 40, 24 48, 30 52"/>
    ${rombo(126, 4, 3)}${rombo(4, 60, 3)}<circle cx="96" cy="9" r="1.2" ${relleno()}/><circle cx="9" cy="44" r="1.2" ${relleno()}/>`),
};
})();
