import type { InfoPlantilla } from "../tipos";

// Ficha del template: así aparece en el panel de administrador.
export const info: InfoPlantilla = {
  id: "navidad",                 // igual al nombre de la carpeta
  nombre: "Navidad",
  descripcion: "Rojo, pino y dorado: reno, muñeco de nieve y esferas",
  muestra: ["#C0322F", "#2F6B45"],   // los dos colores del cuadrito en el panel
  fuentes: "https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Nunito:wght@400;600;700;800&display=swap",
};
