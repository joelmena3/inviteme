import "server-only";
import type { DatosPlantilla } from "./_comun/secciones";
import { CATALOGO, PLANTILLA_DEFAULT } from "./catalogo";
import bosque from "./bosque/plantilla";
import picnic from "./picnic/plantilla";
import botanico from "./botanico/plantilla";
import navidad from "./navidad/plantilla";
import confeti from "./confeti/plantilla";
import xvElegante from "./xv-elegante/plantilla";
import confetiAzul from "./confeti-azul/plantilla";

// Qué función arma cada template. Al agregar un template nuevo, súmalo aquí.
const ACOMODOS: Record<string, (d: DatosPlantilla) => string> = { bosque, picnic, botanico, navidad, confeti, "xv-elegante": xvElegante, "confeti-azul": confetiAzul };

export function plantillaDe(id: string) {
  const clave = ACOMODOS[id] ? id : PLANTILLA_DEFAULT;
  return { render: ACOMODOS[clave], info: CATALOGO.find((p) => p.id === clave)! };
}
