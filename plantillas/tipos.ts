// Ficha que cada template declara en su info.ts
export type InfoPlantilla = {
  id: string;
  nombre: string;
  descripcion: string;
  muestra: [string, string];
  fuentes?: string; // link de Google Fonts con las letras que usa
  // true = ya no se ofrece para eventos nuevos, pero las invitaciones que ya lo
  // usan siguen funcionando igual. Es la forma segura de "quitar" un template.
  oculto?: boolean;
};
