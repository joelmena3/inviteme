import "server-only";
import type { DatosPlantilla } from "./_comun/secciones";
import { CATALOGO, PLANTILLA_DEFAULT } from "./catalogo";
import bosque from "./bosque/plantilla";
import navidad from "./navidad/plantilla";
import confeti from "./confeti/plantilla";
import xvElegante from "./xv-elegante/plantilla";
import confetiAzul from "./confeti-azul/plantilla";
import superheroes from "./superheroes/plantilla";
import posada from "./posada/plantilla";
import bautizo from "./bautizo/plantilla";

// Qué función arma cada template. Al agregar un template nuevo, súmalo aquí.
const ACOMODOS: Record<string, (d: DatosPlantilla) => string> = { bosque, navidad, confeti, "xv-elegante": xvElegante, "confeti-azul": confetiAzul, superheroes, posada, bautizo };

export function plantillaDe(id: string) {
  const clave = ACOMODOS[id] ? id : PLANTILLA_DEFAULT;
  return { render: ACOMODOS[clave], info: CATALOGO.find((p) => p.id === clave)! };
}
