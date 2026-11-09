import "server-only";
import { CATALOGO } from "@/plantillas/catalogo";
import { leerVisibilidad } from "./visibilidad";

// Qué templates ve el cliente en la portada (inviteme.mx/#ejemplos).
// Solo los públicos: los eliges en el panel (pestaña Templates → Publicar en la web).
// Los privados y los ocultos no aparecen. Solo se muestra el nombre y sus colores;
// el tipo de evento lo dice el cliente.

// El que aparece primero (y abierto) en la portada, si es público.
export const PRIMERO_EN_PORTADA = "confeti";

export type PlantillaPublica = { id: string; nombre: string; muestra: [string, string] };

export async function plantillasPublicas(): Promise<PlantillaPublica[]> {
  const { publicas } = await leerVisibilidad();
  const visibles = CATALOGO.filter((p) => publicas.has(p.id));
  const primero = visibles.filter((p) => p.id === PRIMERO_EN_PORTADA);
  const resto = visibles.filter((p) => p.id !== PRIMERO_EN_PORTADA);
  return [...primero, ...resto].map((p) => ({ id: p.id, nombre: p.nombre, muestra: p.muestra }));
}

export async function esPublica(id: string): Promise<boolean> {
  return (await leerVisibilidad()).publicas.has(id);
}
