// Copia los archivos públicos de cada template (estilos, dibujos, imágenes,
// tipografías) de plantillas/<nombre>/ a public/plantillas/<nombre>/ para que
// el sitio pueda servirlos. Corre solo antes de "dev" y "build".
// Los archivos .ts y .md no se copian: se usan del lado del servidor o son notas.
import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const ORIGEN = "plantillas";
const DESTINO = join("public", "plantillas");

if (existsSync(DESTINO)) rmSync(DESTINO, { recursive: true, force: true });
let n = 0;
for (const dir of readdirSync(ORIGEN)) {
  if (!statSync(join(ORIGEN, dir)).isDirectory()) continue;
  cpSync(join(ORIGEN, dir), join(DESTINO, dir), {
    recursive: true,
    filter: (src) => statSync(src).isDirectory() || !/\.(ts|tsx|md)$/.test(src),
  });
  n++;
}
console.log(`Plantillas copiadas a public/plantillas (${n} carpetas).`);
