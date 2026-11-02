import { CATALOGO } from "@/plantillas/catalogo";

// Qué templates ve el cliente en la portada (inviteme.mx/#ejemplos).
// Salen solos de plantillas/catalogo.ts: los que tienen `oculto: true` no aparecen,
// y uno nuevo aparece en cuanto se publica en main. Solo se muestra el nombre y sus
// colores; el tipo de evento lo dice el cliente.

// El que aparece primero (y abierto) en la portada.
export const PRIMERO_EN_PORTADA = "confeti";

export type PlantillaPublica = { id: string; nombre: string; muestra: [string, string] };

export function plantillasPublicas(): PlantillaPublica[] {
  const visibles = CATALOGO.filter((p) => !p.oculto);
  const primero = visibles.filter((p) => p.id === PRIMERO_EN_PORTADA);
  const resto = visibles.filter((p) => p.id !== PRIMERO_EN_PORTADA);
  return [...primero, ...resto].map((p) => ({ id: p.id, nombre: p.nombre, muestra: p.muestra }));
}

export function esPublica(id: string): boolean {
  return CATALOGO.some((p) => p.id === id && !p.oculto);
}
