// Ficha que cada template declara en su info.ts
export type InfoPlantilla = {
  id: string;
  nombre: string;
  descripcion: string;
  muestra: [string, string];
  fuentes?: string; // link de Google Fonts con las letras que usa
};
