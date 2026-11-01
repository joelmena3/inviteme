// Lista de templates que aparecen en el panel de administrador.
// Para agregar uno: crea su carpeta (copiando una existente), y agrégalo
// aquí y en plantillas/index.ts.
import { info as bosque } from "./bosque/info";
import { info as picnic } from "./picnic/info";
import { info as botanico } from "./botanico/info";
import { info as navidad } from "./navidad/info";

export const CATALOGO = [bosque, picnic, botanico, navidad];
export const PLANTILLA_DEFAULT = "bosque";
