import type { InfoPlantilla } from "../tipos";

// Ficha del template: así aparece en el panel de administrador.
export const info: InfoPlantilla = {
  id: "bosque",                 // igual al nombre de la carpeta
  nombre: "Bosque",
  descripcion: "Verde salvia y rosa, animalitos del bosque",
  muestra: ["#9AB591", "#F5D0D7"],   // los dos colores del cuadrito en el panel
  fuentes: "https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Nunito:wght@400;600;700;800&display=swap",
};
