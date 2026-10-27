import type { ReactNode } from "react";

interface Propiedades {
  texto: string;
  className?: string;
  permitirBloques?: boolean;
}

function renderizarInline(texto: string, claveBase: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return partes.map((parte, indice) => {
    const clave = `${claveBase}-${indice}`;

    if (parte.startsWith("**") && parte.endsWith("**")) {
      return <strong key={clave}>{parte.slice(2, -2)}</strong>;
    }

    if (parte.startsWith("*") && parte.endsWith("*")) {
      return <em key={clave}>{parte.slice(1, -1)}</em>;
    }

    return parte;
  });
}

function renderizarConSaltos(texto: string, claveBase: string) {
  return texto.split("\n").flatMap((linea, indice, lineas) => {
    const contenido = renderizarInline(linea, `${claveBase}-${indice}`);

    if (indice === lineas.length - 1) {
      return contenido;
    }

    return [...contenido, <br key={`${claveBase}-br-${indice}`} />];
  });
}

function TextoEnriquecido({
  texto,
  className,
  permitirBloques = true,
}: Propiedades) {
  const contenido = texto.trim();

  if (!contenido) return null;

  if (!permitirBloques) {
    return (
      <span className={className}>
        {renderizarConSaltos(contenido, "inline")}
      </span>
    );
  }

  const lineas = contenido.replace(/\r\n/g, "\n").split("\n");
  const bloques: ReactNode[] = [];
  let indice = 0;

  while (indice < lineas.length) {
    const linea = lineas[indice];

    if (!linea.trim()) {
      indice += 1;
      continue;
    }

    if (linea.startsWith("## ")) {
      bloques.push(
        <h2 key={`subtitulo-${indice}`} className="texto-enriquecido-subtitulo">
          {renderizarInline(linea.slice(3).trim(), `subtitulo-${indice}`)}
        </h2>
      );
      indice += 1;
      continue;
    }

    if (linea.startsWith("- ")) {
      const items: ReactNode[] = [];

      while (indice < lineas.length && lineas[indice].startsWith("- ")) {
        items.push(
          <li key={`item-${indice}`}>
            {renderizarInline(lineas[indice].slice(2).trim(), `item-${indice}`)}
          </li>
        );
        indice += 1;
      }

      bloques.push(
        <ul key={`lista-${indice}`} className="texto-enriquecido-lista">
          {items}
        </ul>
      );
      continue;
    }

    const parrafo: string[] = [];
    const inicio = indice;

    while (
      indice < lineas.length &&
      lineas[indice].trim() &&
      !lineas[indice].startsWith("## ") &&
      !lineas[indice].startsWith("- ")
    ) {
      parrafo.push(lineas[indice]);
      indice += 1;
    }

    bloques.push(
      <p key={`parrafo-${inicio}`}>
        {renderizarConSaltos(parrafo.join("\n"), `parrafo-${inicio}`)}
      </p>
    );
  }

  return <div className={className}>{bloques}</div>;
}

export default TextoEnriquecido;
