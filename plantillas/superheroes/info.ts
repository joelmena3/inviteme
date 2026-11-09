import type { InfoPlantilla } from "../tipos";

// Ficha del template: así aparece en el panel de administrador.
export const info: InfoPlantilla = {
  id: "superheroes",                 // igual al nombre de la carpeta
  nombre: "Superhéroes",
  descripcion: "Estilo cómic: rojo, azul y amarillo, rayos y ¡POW!; para niños más grandes",
  muestra: ["#E63946", "#FFD60A"],   // los dos colores del cuadrito en el panel
  fuentes: "https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800;900&display=swap",
};
