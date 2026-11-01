import { leerLocal, guardarLocal } from "./almacenInteracciones";

export type AvatarComentario =
  | "cassette"
  | "ovni"
  | "flor"
  | "pelota"
  | "corazon"
  | "vinilo"
  | "mate"
  | "estrella";

export interface ComentarioNoticia {
  id: string;
  slug: string;
  nombre: string;
  avatar: AvatarComentario;
  texto: string;
  fecha: string;
  respuestaA?: string;
}

export interface InteraccionesNoticia {
  likes: number;
  meGusta: boolean;
  comentarios: ComentarioNoticia[];
}

const API = import.meta.env.VITE_INTERACCION_API_URL?.replace(/\/$/, "");
const CLAVE_ULTIMO_COMENTARIO = "club-nostalgia-ultimo-comentario";

function estadoInicial(): InteraccionesNoticia {
  return { likes: 0, meGusta: false, comentarios: [] };
}

export async function obtenerInteracciones(slug: string): Promise<InteraccionesNoticia> {
  if (API) {
    const respuesta = await fetch(`${API}/noticias/${encodeURIComponent(slug)}`);
    if (!respuesta.ok) throw new Error("No se pudieron cargar las interacciones");
    return respuesta.json();
  }

  return leerLocal()[slug] ?? estadoInicial();
}

export async function alternarLike(slug: string): Promise<InteraccionesNoticia> {
  if (API) {
    const respuesta = await fetch(`${API}/noticias/${encodeURIComponent(slug)}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!respuesta.ok) throw new Error("No se pudo registrar la reacción");
    return respuesta.json();
  }

  const datos = leerLocal();
  const actual = datos[slug] ?? estadoInicial();
  const meGusta = !actual.meGusta;

  datos[slug] = {
    ...actual,
    meGusta,
    likes: Math.max(0, actual.likes + (meGusta ? 1 : -1)),
  };

  guardarLocal(datos);
  return datos[slug];
}

const PALABRAS_BLOQUEADAS = [
  "puto",
  "puta",
  "forro",
  "mierda",
  "pelotudo",
  "pelotuda",
];

interface DatosValidacionComentario {
  nombre: string;
  texto: string;
}

function validarComentario({ nombre, texto }: DatosValidacionComentario) {
  const nombreLimpio = nombre.trim();
  const textoLimpio = texto.trim();

  if (nombreLimpio.length < 2 || nombreLimpio.length > 24) {
    throw new Error("El nombre tiene que tener entre 2 y 24 caracteres.");
  }

  if (textoLimpio.length < 2 || textoLimpio.length > 500) {
    throw new Error("El comentario tiene que tener entre 2 y 500 caracteres.");
  }

  const normalizado = textoLimpio.toLowerCase();
  if (PALABRAS_BLOQUEADAS.some((palabra) => normalizado.includes(palabra))) {
    throw new Error("Ese comentario contiene palabras que preferimos evitar.");
  }

  if (!API) {
    const ultimo = Number(localStorage.getItem(CLAVE_ULTIMO_COMENTARIO) || 0);
    if (Date.now() - ultimo < 10000) {
      throw new Error("Esperá unos segundos antes de volver a comentar.");
    }
  }
}

export async function publicarComentario(
  slug: string,
  entrada: {
    nombre: string;
    avatar: AvatarComentario;
    texto: string;
    respuestaA?: string;
  }
): Promise<InteraccionesNoticia> {
  validarComentario(entrada);

  if (API) {
    const respuesta = await fetch(`${API}/noticias/${encodeURIComponent(slug)}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entrada),
    });
    if (!respuesta.ok) throw new Error("No se pudo publicar el comentario");
    return respuesta.json();
  }

  const datos = leerLocal();
  const actual = datos[slug] ?? estadoInicial();
  const comentario: ComentarioNoticia = {
    id: crypto.randomUUID(),
    slug,
    nombre: entrada.nombre.trim(),
    avatar: entrada.avatar,
    texto: entrada.texto.trim(),
    fecha: new Date().toISOString(),
    respuestaA: entrada.respuestaA,
  };

  datos[slug] = {
    ...actual,
    comentarios: [...actual.comentarios, comentario],
  };

  guardarLocal(datos);
  localStorage.setItem(CLAVE_ULTIMO_COMENTARIO, String(Date.now()));
  return datos[slug];
}
