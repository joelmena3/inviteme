// Lista de templates que aparecen en el panel de administrador.
// Para agregar uno: crea su carpeta (copiando una existente), y agrégalo
// aquí y en plantillas/index.ts.
import { info as bosque } from "./bosque/info";
import { info as picnic } from "./picnic/info";
import { info as botanico } from "./botanico/info";
import { info as navidad } from "./navidad/info";
import { info as confeti } from "./confeti/info";
import { info as xvElegante } from "./xv-elegante/info";
import { info as confetiAzul } from "./confeti-azul/info";
import { info as superheroes } from "./superheroes/info";
import { info as posada } from "./posada/info";

// Orden en que aparecen en el panel. Picnic y Botánico están ocultos (oculto: true en su info.ts).
export const CATALOGO = [xvElegante, confeti, confetiAzul, superheroes, bosque, posada, navidad, picnic, botanico];
export const PLANTILLA_DEFAULT = "xv-elegante";
