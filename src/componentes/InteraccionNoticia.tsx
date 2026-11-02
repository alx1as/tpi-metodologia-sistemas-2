import {
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  alternarLike,
  obtenerInteracciones,
  publicarComentario,
  type AvatarComentario,
  type ComentarioNoticia,
  type InteraccionesNoticia,
} from "../servicios/interacciones";
import "./InteraccionNoticia.css";

interface Propiedades {
  slug: string;
}

const AVATARES: Array<{
  id: AvatarComentario;
  nombre: string;
  emoji: string;
}> = [
  { id: "cassette", nombre: "Cassette", emoji: "📼" },
  { id: "ovni", nombre: "Alien", emoji: "👽" },
  { id: "flor", nombre: "Cactus", emoji: "🌵" },
  { id: "pelota", nombre: "Pelota", emoji: "⚽" },
  { id: "corazon", nombre: "Corazón", emoji: "💜" },
  { id: "vinilo", nombre: "Disco", emoji: "💿" },
  { id: "mate", nombre: "Hongo", emoji: "🍄" },
  { id: "estrella", nombre: "Sol", emoji: "🌞" },
];

function IconoAvatar({ avatar }: { avatar: AvatarComentario }) {
  const opcion = AVATARES.find((item) => item.id === avatar) ?? AVATARES[0];
  return <span className="avatar-emoji" aria-hidden="true">{opcion.emoji}</span>;
}

function tiempoRelativo(fecha: string) {
  const diferencia = Math.max(0, Date.now() - new Date(fecha).getTime());
  const minutos = Math.floor(diferencia / 60000);

  if (minutos < 1) return "recién";
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

function agruparRespuestas(comentarios: ComentarioNoticia[]) {
  const respuestasPorComentario = new Map<ComentarioNoticia["id"], ComentarioNoticia[]>();

  for (const comentario of comentarios) {
    if (!comentario.respuestaA) continue;

    const respuestas = respuestasPorComentario.get(comentario.respuestaA) ?? [];
    respuestas.push(comentario);
    respuestasPorComentario.set(comentario.respuestaA, respuestas);
  }

  return respuestasPorComentario;
}

function InteraccionNoticia({ slug }: Propiedades) {
  const [estado, setEstado] = useState<InteraccionesNoticia>({
    likes: 0,
    meGusta: false,
    comentarios: [],
  });
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");
  const [avatar, setAvatar] = useState<AvatarComentario>("cassette");
  const [respuestaA, setRespuestaA] = useState<ComentarioNoticia | null>(null);
  const [mensaje, setMensaje] = useState("");
  const formularioRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let activo = true;

    obtenerInteracciones(slug)
      .then((datos) => activo && setEstado(datos))
      .catch(() => activo && setMensaje("No pudimos cargar las interacciones."))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [slug]);

  const comentariosRaiz = useMemo(
    () => estado.comentarios.filter((comentario) => !comentario.respuestaA),
    [estado.comentarios]
  );

  const respuestasPorComentario = useMemo(
    () => agruparRespuestas(estado.comentarios),
    [estado.comentarios]
  );

  async function manejarLike() {
    try {
      setMensaje("");
      setEstado(await alternarLike(slug));
    } catch {
      setMensaje("No pudimos guardar la reacción.");
    }
  }

  async function enviarComentario(evento: FormEvent) {
    evento.preventDefault();

    try {
      setMensaje("");
      const nuevoEstado = await publicarComentario(slug, {
        nombre,
        avatar,
        texto,
        respuestaA: respuestaA?.id,
      });

      setEstado(nuevoEstado);
      setTexto("");
      setRespuestaA(null);
      setMensaje("Publicado.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No pudimos publicar.");
    }
  }

  function renderComentario(comentario: ComentarioNoticia, esRespuesta = false) {
    const respuestas = respuestasPorComentario.get(comentario.id) ?? [];

    return (
      <div
        key={comentario.id}
        className={`comentario-item ${esRespuesta ? "comentario-respuesta" : ""}`}
      >
        <div className={`comentario-avatar avatar-${comentario.avatar}`}>
          <IconoAvatar avatar={comentario.avatar} />
        </div>

        <div className="comentario-cuerpo">
          <div className="comentario-meta">
            <strong>{comentario.nombre}</strong>
            <span>{tiempoRelativo(comentario.fecha)}</span>
          </div>

          <p>{comentario.texto}</p>

          {!esRespuesta && (
            <button
              type="button"
              className="comentario-responder"
              onClick={() => {
                setRespuestaA(comentario);
                formularioRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            >
              Responder
            </button>
          )}

          {respuestas.length > 0 && (
            <div className="comentario-respuestas">
              {respuestas.map((respuesta) => renderComentario(respuesta, true))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="interaccion-noticia" aria-labelledby="titulo-comentarios">
      <div className="interaccion-cabecera">
        <div>
          <span className="interaccion-etiqueta">COMUNIDAD</span>
          <h2 id="titulo-comentarios">¿Qué te pareció?</h2>
        </div>

        <button
          type="button"
          className={`boton-like ${estado.meGusta ? "activo" : ""}`}
          onClick={manejarLike}
          aria-pressed={estado.meGusta}
        >
          <Heart size={22} strokeWidth={2.25} fill={estado.meGusta ? "currentColor" : "none"} />
          <span>{estado.meGusta ? "Te gustó" : "Me gusta"}</span>
          <strong>{estado.likes}</strong>
        </button>
      </div>

      <div className="interaccion-grilla">
        <form ref={formularioRef} className="form-comentario" onSubmit={enviarComentario}>
          <span className="form-etiqueta">DEJÁ TU COMENTARIO</span>

          <label>
            Tu nombre
            <input
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              maxLength={24}
              placeholder="Ej: Lorenzo"
            />
          </label>

          <fieldset>
            <legend>Elegí tu personaje</legend>
            <div className="selector-avatar">
              {AVATARES.map(({ id, nombre: nombreAvatar, emoji }) => (
                <button
                  key={id}
                  type="button"
                  className={`avatar-opcion avatar-${id} ${avatar === id ? "activo" : ""}`}
                  onClick={() => setAvatar(id)}
                  aria-label={nombreAvatar}
                  aria-pressed={avatar === id}
                  title={nombreAvatar}
                >
                  <span className="avatar-emoji" aria-hidden="true">{emoji}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {respuestaA && (
            <div className="respondiendo-a">
              Respondiendo a <strong>{respuestaA.nombre}</strong>
              <button type="button" onClick={() => setRespuestaA(null)}>×</button>
            </div>
          )}

          <label>
            Tu comentario
            <textarea
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              maxLength={500}
              rows={5}
              placeholder="Escribí algo..."
            />
          </label>

          <div className="form-comentario-pie">
            <small>{texto.length}/500</small>
            <button type="submit" className="boton-publicar">
              Publicar
              <Send size={16} strokeWidth={2.3} />
            </button>
          </div>

          {mensaje && <p className="mensaje-interaccion">{mensaje}</p>}
        </form>

        <div className="lista-comentarios">
          <div className="lista-comentarios-titulo">
            <MessageCircle size={20} strokeWidth={2.2} />
            <strong>Comentarios</strong>
            <span>{estado.comentarios.length}</span>
          </div>

          {cargando ? (
            <p className="comentarios-vacio">Cargando...</p>
          ) : comentariosRaiz.length === 0 ? (
            <p className="comentarios-vacio">
              Todavía no comentó nadie. Podés inaugurar esta parte del club.
            </p>
          ) : (
            comentariosRaiz.map((comentario) => renderComentario(comentario))
          )}
        </div>
      </div>
    </section>
  );
}

export default InteraccionNoticia;
