import type { InteraccionesNoticia } from "./interacciones";

const CLAVE = "club-nostalgia-interacciones-demo";

interface AlmacenLocal {
  [slug: string]: InteraccionesNoticia;
}

export function leerLocal(): AlmacenLocal {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "{}") as AlmacenLocal;
  } catch {
    return {};
  }
}

export function guardarLocal(datos: AlmacenLocal) {
  localStorage.setItem(CLAVE, JSON.stringify(datos));
}
