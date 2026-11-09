// Lista de templates que aparecen en el panel de administrador.
// Para agregar uno: crea su carpeta (copiando una existente), y agrégalo
// aquí y en plantillas/index.ts.
import { info as bosque } from "./bosque/info";
import { info as navidad } from "./navidad/info";
import { info as confeti } from "./confeti/info";
import { info as xvElegante } from "./xv-elegante/info";
import { info as confetiAzul } from "./confeti-azul/info";
import { info as superheroes } from "./superheroes/info";
import { info as posada } from "./posada/info";
import { info as bautizo } from "./bautizo/info";

// Orden en que aparecen en el panel.
export const CATALOGO = [xvElegante, confeti, confetiAzul, superheroes, bautizo, bosque, posada, navidad];
export const PLANTILLA_DEFAULT = "xv-elegante";
