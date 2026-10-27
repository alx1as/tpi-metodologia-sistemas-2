import { Link } from "react-router-dom";

import type { Noticia } from "../tipos/Noticia";
import { formatearFecha } from "../utilidades/formatearFecha";

import "./TarjetaNoticia.css";


interface Propiedades {
  noticia: Noticia;
}


function TarjetaNoticia({
  noticia,
}: Propiedades) {
  return (
    <article className="tarjeta-noticia">
      <div className="tarjeta-entrada">

        <div className="noticia-imagen">
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
          />
        </div>


        <div className="noticia-contenido">

          <span className="noticia-fecha">
            {formatearFecha(
              noticia.fecha
            )}
          </span>

          <h3>
            {noticia.titulo}
          </h3>

          <p>
            {noticia.resumen}
          </p>


          <Link
            to={`/noticias/${noticia.slug}`}
            className="boton-leer"
          >
            Leer nota
            <span>→</span>
          </Link>

        </div>

      </div>
    </article>
  );
}

export default TarjetaNoticia;