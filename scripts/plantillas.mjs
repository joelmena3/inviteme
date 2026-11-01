// Herramientas para los templates de invitaciones.
//
//   npm run validar             → revisa todos los templates
//   npm run validar -- bosque   → revisa solo uno
//   npm run vista -- bosque     → genera .vista/bosque.html (autocontenida) para verlo
//
// La validación arma cada template con dos eventos de prueba
// (scripts/pruebas/evento-completo.json y evento-minimo.json) y comprueba que:
//   - tenga sus archivos, su id coincida con la carpeta y esté registrado;
//   - conserve todos los elementos que el motor necesita (cuenta, confirmación, visor…);
//   - no deje "undefined" ni datos rotos en la invitación;
//   - sus dibujos.js definan los seis dibujos;
//   - sus estilos.css no apunten a imágenes que no existen.
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const RAIZ = resolve(dirname(new URL(import.meta.url).pathname), "..");
const PL = join(RAIZ, "plantillas");
const SALIDA = join(RAIZ, ".vista");
const BUILD = join(SALIDA, ".build");
const DIBUJOS = ["izquierda", "derecha", "centro", "adorno", "hoja", "rama"];
const PRUEBAS = ["evento-completo", "evento-minimo"].map((n) => ({
  nombre: n,
  datos: JSON.parse(readFileSync(join(RAIZ, "scripts/pruebas", `${n}.json`), "utf8")),
}));

// ---------- Compila plantillas/**/*.ts a CommonJS en .vista/.build ----------
function compilar() {
  rmSync(BUILD, { recursive: true, force: true });
  const recorrer = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { recorrer(p); continue; }
      if (extname(f) !== ".ts") continue;
      let src = readFileSync(p, "utf8").replace(/^import\s+["']server-only["'];?\s*$/m, "");
      const out = ts.transpileModule(src, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        fileName: p,
      }).outputText;
      const dest = join(BUILD, relative(PL, p)).replace(/\.ts$/, ".js");
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, out);
    }
  };
  recorrer(PL);
  writeFileSync(join(BUILD, "package.json"), '{"type":"commonjs"}');
  const req = createRequire(join(BUILD, "x.js"));
  return {
    index: req("./index.js"),
    catalogo: req("./catalogo.js"),
    secciones: req("./_comun/secciones.js"),
  };
}

const ids = (html) => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

function carpetas() {
  return readdirSync(PL).filter((d) => !d.startsWith("_") && statSync(join(PL, d)).isDirectory()).sort();
}

// ---------- Validación de un template ----------
function validar(id, mod) {
  const errores = [];
  const avisos = [];
  const dir = join(PL, id);

  for (const f of ["info.ts", "plantilla.ts", "estilos.css", "dibujos.js"])
    if (!existsSync(join(dir, f))) errores.push(`falta el archivo ${f}`);
  if (errores.length) return { errores, avisos };

  if (!/^[a-z0-9-]+$/.test(id)) errores.push(`el nombre de carpeta "${id}" solo puede tener minúsculas, números y guiones`);

  // info.ts
  const req = createRequire(join(BUILD, "x.js"));
  const info = req(`./${id}/info.js`).info;
  if (!info) errores.push("info.ts no exporta `info`");
  else {
    if (info.id !== id) errores.push(`info.id es "${info.id}" pero la carpeta se llama "${id}"`);
    if (!info.nombre) errores.push("info.nombre está vacío");
    if (!info.descripcion) errores.push("info.descripcion está vacía");
    const hex = /^#[0-9a-fA-F]{6}$/;
    if (!Array.isArray(info.muestra) || info.muestra.length !== 2 || !info.muestra.every((c) => hex.test(c)))
      errores.push('info.muestra debe ser dos colores tipo "#AABBCC"');
    if (info.fuentes && !info.fuentes.startsWith("https://fonts.googleapis.com/"))
      errores.push("info.fuentes debe ser un link de Google Fonts");
  }

  // Registro
  if (!mod.catalogo.CATALOGO.some((p) => p.id === id)) errores.push("no está en plantillas/catalogo.ts (CATALOGO)");
  const render = req(`./${id}/plantilla.js`).default;
  if (typeof render !== "function") { errores.push("plantilla.ts no exporta por defecto una función"); return { errores, avisos }; }
  if (mod.index.plantillaDe(id).info.id !== id) errores.push("no está en plantillas/index.ts (ACOMODOS); se mostraría el template por defecto");

  // Render con datos de prueba
  for (const p of PRUEBAS) {
    let html;
    try {
      html = render(p.datos);
    } catch (e) {
      errores.push(`[${p.nombre}] falla al armar la invitación: ${e.message}`);
      continue;
    }
    const base = Object.values(mod.secciones.secciones(p.datos)).join("\n");
    const faltan = [...ids(base)].filter((x) => !ids(html).has(x));
    if (faltan.length) errores.push(`[${p.nombre}] faltan elementos que usa el motor: ${faltan.map((x) => `#${x}`).join(", ")}`);
    if (!html.includes("window.__INVITACION__")) errores.push(`[${p.nombre}] falta \${s.datos} (los datos para el motor)`);
    const texto = html.replace(/<script[\s\S]*?<\/script>/g, "");
    for (const malo of ["undefined", "[object Object]", "NaN", "null"])
      if (new RegExp(`>[^<]*\\b${malo.replace(/[[\]]/g, "\\$&")}\\b[^<]*<|="${malo}"`).test(texto))
        errores.push(`[${p.nombre}] aparece "${malo}" en la invitación: algún dato se está leyendo mal`);
  }

  // dibujos.js
  try {
    const ventana = {};
    vm.runInNewContext(readFileSync(join(dir, "dibujos.js"), "utf8"), { window: ventana }, { timeout: 2000 });
    const dib = ventana.__DIBUJOS__ || {};
    for (const n of DIBUJOS) {
      if (typeof dib[n] !== "function") errores.push(`dibujos.js no define "${n}"`);
      else if (!String(dib[n]()).includes("<svg")) errores.push(`el dibujo "${n}" no devuelve un <svg>`);
    }
  } catch (e) {
    errores.push(`dibujos.js tiene un error: ${e.message}`);
  }

  // estilos.css
  const css = readFileSync(join(dir, "estilos.css"), "utf8");
  const abre = (css.match(/{/g) || []).length, cierra = (css.match(/}/g) || []).length;
  if (abre !== cierra) errores.push(`estilos.css tiene llaves desbalanceadas ({ ${abre} vs } ${cierra})`);
  for (const [, u] of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (/^(data:|https?:|#)/.test(u)) continue;
    if (u.startsWith("/")) { if (!existsSync(join(RAIZ, "public", u))) errores.push(`estilos.css usa ${u} y no existe en public/`); continue; }
    if (!existsSync(join(dir, u))) errores.push(`estilos.css usa ${u} y no existe en plantillas/${id}/`);
  }
  if (/@import\s+url\(["']?https?:/.test(css) && !/fonts\.googleapis\.com/.test(css))
    avisos.push("estilos.css importa recursos externos que no son Google Fonts");

  return { errores, avisos };
}

// ---------- Vista previa autocontenida ----------
function vista(id, mod) {
  const { render, info } = mod.index.plantillaDe(id);
  const datos = PRUEBAS[0].datos;
  const leer = (p) => readFileSync(join(RAIZ, p), "utf8");
  const dir = `plantillas/${info.id}`;
  const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };
  const embeber = (ruta) => {
    if (!existsSync(ruta)) return null;
    return `data:${mime[extname(ruta).toLowerCase()] || "application/octet-stream"};base64,${readFileSync(ruta).toString("base64")}`;
  };
  let css = leer(`${dir}/estilos.css`).replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (m, u) => {
    if (/^(data:|https?:|#)/.test(u)) return m;
    const d = embeber(u.startsWith("/") ? join(RAIZ, "public", u) : join(RAIZ, dir, u));
    return d ? `url("${d}")` : m;
  });
  let html = render(datos).replace(/(src|data-src)="(\/[^"]+)"/g, (m, a, u) => {
    const d = embeber(join(RAIZ, "public", u));
    return d ? `${a}="${d}"` : m;
  });
  // La música no se embebe (pesa mucho); el botón aparece pero no suena en la vista previa.
  const pagina = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vista previa · ${info.nombre}</title>
${info.fuentes ? `<link rel="stylesheet" href="${info.fuentes}">` : ""}
<style>${css}</style></head>
<body data-design="${info.id}"><div data-design="${info.id}" class="invitacion">${html}</div>
<script>${leer(`${dir}/dibujos.js`)}</script>
<script>${leer("plantillas/_comun/motor.js")}</script>
</body></html>`;
  mkdirSync(SALIDA, { recursive: true });
  const archivo = join(SALIDA, `${info.id}.html`);
  writeFileSync(archivo, pagina);
  return archivo;
}

// ---------- Línea de comandos ----------
const [cmd, ...args] = process.argv.slice(2);
const mod = compilar();
const todas = carpetas();

if (cmd === "vista") {
  const lista = args.length ? args : todas;
  for (const id of lista) {
    if (!todas.includes(id)) { console.error(`No existe plantillas/${id}/`); process.exit(1); }
    console.log(`Vista previa: ${relative(RAIZ, vista(id, mod))}`);
  }
} else if (cmd === "validar") {
  const lista = args.length ? args : todas;
  let mal = 0;
  // Registros que apuntan a carpetas que ya no existen
  for (const p of mod.catalogo.CATALOGO)
    if (!todas.includes(p.id)) { console.log(`✗ catalogo.ts registra "${p.id}" pero no existe su carpeta`); mal++; }
  if (!todas.includes(mod.catalogo.PLANTILLA_DEFAULT)) { console.log(`✗ PLANTILLA_DEFAULT "${mod.catalogo.PLANTILLA_DEFAULT}" no existe`); mal++; }
  else if (mod.catalogo.CATALOGO.find((p) => p.id === mod.catalogo.PLANTILLA_DEFAULT)?.oculto)
    { console.log("✗ PLANTILLA_DEFAULT no puede ser un template oculto"); mal++; }

  for (const id of lista) {
    if (!todas.includes(id)) { console.log(`✗ ${id}: no existe plantillas/${id}/`); mal++; continue; }
    const { errores, avisos } = validar(id, mod);
    const oculto = mod.catalogo.CATALOGO.find((p) => p.id === id)?.oculto ? " (oculto)" : "";
    if (errores.length) {
      mal++;
      console.log(`✗ ${id}${oculto}`);
      errores.forEach((e) => console.log(`    - ${e}`));
    } else console.log(`✓ ${id}${oculto}`);
    avisos.forEach((a) => console.log(`    ! ${a}`));
  }
  console.log(mal ? `\n${mal} problema(s). Corrígelos antes de subir.` : "\nTodo bien.");
  process.exit(mal ? 1 : 0);
} else if (cmd === "cambios") {
  // Candado: falla si hay archivos modificados fuera de las carpetas de templates.
  // Compara contra origin/main (o la rama que se pase) e incluye lo no guardado.
  const { execSync } = await import("node:child_process");
  const base = args[0] || "origin/main";
  const git = (c) => execSync(`git ${c}`, { cwd: RAIZ, encoding: "utf8" }).split("\n").filter(Boolean);
  let enRama = [];
  try { enRama = git(`diff --name-only ${base}...HEAD`); }
  catch { console.log(`(no se pudo comparar contra ${base}; reviso solo lo no guardado)`); }
  const archivos = [...new Set([...enRama, ...git("diff --name-only HEAD"), ...git("ls-files --others --exclude-standard")])];
  const permitido = (f) =>
    f.startsWith("plantillas/") && !f.startsWith("plantillas/_comun/") && f !== "plantillas/tipos.ts";
  const fuera = archivos.filter((f) => !permitido(f));
  if (!archivos.length) console.log("Sin cambios.");
  else if (fuera.length) {
    console.log("✗ Hay cambios fuera de los templates (no permitidos en modo plantillas):");
    fuera.forEach((f) => console.log(`    - ${f}`));
    process.exit(1);
  } else console.log(`✓ ${archivos.length} archivo(s) cambiado(s), todos dentro de plantillas/.`);
} else {
  console.log("Uso: node scripts/plantillas.mjs validar [id…] | vista [id…] | cambios [rama-base]");
  process.exit(1);
}
