import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Noticias from "./paginas/Noticias";
import DetalleNoticia from "./paginas/DetalleNoticia";
import "./Aplicacion.css";

function Aplicacion() {
  return (
    <BrowserRouter>
      <header className="cabecera-tpi">
        <div className="contenedor cabecera-tpi-contenido">
          <Link className="marca-tpi" to="/noticias" aria-label="Ir a las noticias">
            <span className="marca-tpi-arriba">El Club de la Nostalgia</span>
            <span className="marca-tpi-abajo">NOTICIAS<span className="punto-tpi">.</span></span>
          </Link>
          <nav aria-label="Navegación"><Link to="/noticias">Todas las noticias</Link></nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/noticias" replace />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:slug" element={<DetalleNoticia />} />
          <Route path="*" element={<Navigate to="/noticias" replace />} />
        </Routes>
      </main>
      <footer className="pie-tpi">
        <div className="contenedor">
          <span>El Club de la Nostalgia · Módulo académico de noticias</span>
          <span>Prototipo independiente · TPI Metodología de Sistemas II</span>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default Aplicacion;
