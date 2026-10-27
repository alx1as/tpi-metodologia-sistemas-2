// Acá defino la estructura de cada noticia

export interface Noticia {
  id: number;
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string;
  imagen: string;
  fecha: string;
  publicada: boolean;
}