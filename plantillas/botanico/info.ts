import type { InfoPlantilla } from "../tipos";

// Ficha del template: así aparece en el panel de administrador.
export const info: InfoPlantilla = {
  id: "botanico",                 // igual al nombre de la carpeta
  nombre: "Botánico",
  descripcion: "Elegante, con arcos y flores",
  muestra: ["#2F4A3A", "#E9DCC6"],   // los dos colores del cuadrito en el panel
  fuentes: "https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@300;400;500;600&display=swap",
  oculto: true,                 // ya no se ofrece para eventos nuevos; las invitaciones que lo usan siguen igual
};
