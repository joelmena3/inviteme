import type { InfoPlantilla } from "../tipos";

// Ficha del template: así aparece en el panel de administrador.
export const info: InfoPlantilla = {
  id: "picnic",                 // igual al nombre de la carpeta
  nombre: "Picnic",
  descripcion: "Colores alegres de día de campo",
  muestra: ["#E8735A", "#F6D776"],   // los dos colores del cuadrito en el panel
  fuentes: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap",
};
