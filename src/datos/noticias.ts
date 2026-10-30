import type { Noticia } from "../tipos/Noticia";
import datosNoticias from "./noticias.json";

export const noticias: Noticia[] = datosNoticias;

export function obtenerNoticiasPublicadas() {
  return [...noticias]
    .filter((noticia) => noticia.publicada)
    .sort((a, b) =>
      b.fecha.localeCompare(a.fecha)
    );
}

export function obtenerUltimasNoticias(
  cantidad = 3
) {
  return obtenerNoticiasPublicadas()
    .slice(0, cantidad);
}

export function obtenerNoticiaPorSlug(
  slug: string
) {
  return noticias.find(
    (noticia) =>
      noticia.publicada &&
      noticia.slug === slug
  );
}
