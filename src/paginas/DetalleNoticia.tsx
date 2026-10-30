import {
  Link,
  useParams,
} from "react-router-dom";

import TextoEnriquecido from "../componentes/TextoEnriquecido";
import InteraccionNoticia from "../componentes/InteraccionNoticia";
import { obtenerNoticiaPorSlug } from "../datos/noticias";
import { formatearFecha } from "../utilidades/formatearFecha";

import "./DetalleNoticia.css";


/*DETALLE*/

function DetalleNoticia() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const noticia = slug
    ? obtenerNoticiaPorSlug(slug)
    : undefined;


  /*NOTICIA NO ENCONTRADA*/

  if (!noticia) {
    return (
      <section className="noticia-no-encontrada">
        <div className="contenedor">

          <span className="etiqueta-seccion">
            ERROR 404
          </span>

          <h1>
            Nota no encontrada
          </h1>

          <p>
            La noticia que buscás no existe o
            ya no está publicada.
          </p>

          <Link
            to="/noticias"
            className="enlace-volver"
          >
            ← Volver a noticias
          </Link>

        </div>
      </section>
    );
  }


  /*NOTICIA*/

  return (
    <article className="detalle-noticia">

      <div className="contenedor detalle-noticia-contenido">

        <Link
          to="/noticias"
          className="enlace-volver"
        >
          ← Todas las noticias
        </Link>


        {/* Encabezado */}

        <header className="detalle-noticia-encabezado">

          <span className="detalle-noticia-fecha">
            {formatearFecha(
              noticia.fecha
            )}
          </span>

          <h1>
            {noticia.titulo}
          </h1>

          <p className="detalle-noticia-resumen">
            {noticia.resumen}
          </p>

        </header>


        {/* Imagen */}

        <div className="detalle-noticia-imagen">

          <img
            src={noticia.imagen}
            alt={noticia.titulo}
          />

        </div>


        {/* Contenido */}

        <TextoEnriquecido
          texto={noticia.contenido}
          className="detalle-noticia-texto"
        />


        <InteraccionNoticia slug={noticia.slug} />

        <Link
          to="/noticias"
          className="enlace-volver detalle-noticia-volver"
        >
          ← Volver a noticias
        </Link>

      </div>

    </article>
  );
}

export default DetalleNoticia;