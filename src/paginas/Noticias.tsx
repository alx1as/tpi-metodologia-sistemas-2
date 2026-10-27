import TarjetaNoticia from "../componentes/TarjetaNoticia";
import { obtenerNoticiasPublicadas } from "../datos/noticias";
import "./Noticias.css";

function Noticias() {
  const noticiasPublicadas =
    obtenerNoticiasPublicadas();

  return (
    <section className="pagina-noticias">
      <div className="contenedor">
        <div className="pagina-noticias-encabezado">
          <div>
            <span className="etiqueta-seccion">
              ACTUALIDAD
            </span>

            <h1>Noticias</h1>
          </div>

          <p>
            Música, cultura, historias y
            novedades de El Club de la Nostalgia.
          </p>
        </div>

        {noticiasPublicadas.length > 0 ? (
          <div className="pagina-noticias-grilla">
            {noticiasPublicadas.map(
              (noticia) => (
                <TarjetaNoticia
                  key={noticia.id}
                  noticia={noticia}
                />
              )
            )}
          </div>
        ) : (
          <p className="pagina-noticias-vacia">
            Todavía no hay noticias publicadas.
          </p>
        )}
      </div>
    </section>
  );
}

export default Noticias;
