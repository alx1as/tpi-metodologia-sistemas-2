# TPI · Metodología de Sistemas II — Módulo de Noticias

Trabajo Práctico Integrador de la Tecnicatura Universitaria en Programación (UTN). Se analiza y mejora la calidad interna del módulo **Noticias** de *El Club de la Nostalgia*, reutilizado como prototipo académico independiente.

**Integrantes:** Alexia Rubin, Eugenia Demarchi y María Victoria Volpe.

**Repositorio:** https://github.com/alx1as/tpi-metodologia-sistemas-2

## Funcionalidades

- Listado de cinco noticias publicadas, ordenadas por fecha descendente.
- Consulta del detalle de una noticia mediante su `slug` y mensaje «Nota no encontrada» cuando no existe o no está publicada.
- Presentación de fechas en español y detección de fechas inválidas.
- Reacciones «Me gusta» por noticia.
- Comentarios con nombre, avatar, validación de contenido y límite de diez segundos entre publicaciones.
- Respuestas asociadas a un comentario y mostradas debajo de él.
- Persistencia local de likes y comentarios al recargar la página en el mismo origen del navegador.

## Tecnologías

React, TypeScript, Vite, React Router, ESLint y Lucide React. Las noticias se cargan desde `src/datos/noticias.json`.

## Ejecución local

Se requiere Node.js y npm compatibles con la versión de Vite utilizada en el proyecto.

```bash
npm install
npm run dev
```

Abrir la dirección local indicada por Vite. La aplicación redirige desde `/` a `/noticias`.

Otros comandos:

```bash
npm run build     # Comprobación de TypeScript y construcción de producción
npm run lint      # Análisis estático con ESLint
npm run preview   # Vista previa de la compilación
```

No se definió un script de pruebas automatizadas en `package.json`. Las verificaciones funcionales antes y después de los cambios están registradas en las evidencias y en el informe del TPI.

## Organización del código

| Ubicación | Responsabilidad |
|---|---|
| `src/paginas/` | Listado y detalle de noticias. |
| `src/componentes/` | Tarjetas, contenido enriquecido y comunidad de comentarios. |
| `src/datos/` | Noticias del prototipo y funciones de consulta. |
| `src/tipos/` | Definición de la estructura `Noticia`. |
| `src/utilidades/` | Formateo y validación de fechas. |
| `src/servicios/interacciones.ts` | Reglas de likes, comentarios y sus validaciones. |
| `src/servicios/almacenInteracciones.ts` | Lectura y escritura de interacciones en `localStorage`. |
| `docs/` | Aportes individuales y evidencias de las modificaciones. |

## Diagnóstico y mejoras realizadas

El trabajo parte de un módulo funcional y se centra en problemas de **mantenibilidad, legibilidad, cohesión y acoplamiento**.

| Intervención | Cambio | Criterio técnico |
|---|---|---|
| R1 · Consulta por `slug` | Búsqueda directa de una noticia publicada, sin ordenar toda la colección. | Simplificación de lógica y eliminación de trabajo innecesario. |
| R2 · Respuestas | Extracción de `agruparRespuestas()` y uso de `Map` con `useMemo`. | Separación entre transformación de datos y presentación. |
| R3 · Formulario | Sustitución de `getElementById()` por una referencia tipada con `useRef`. | Menor dependencia del DOM global y de identificadores de texto. |
| R4 · Persistencia | Traslado de `leerLocal()` y `guardarLocal()` a `almacenInteracciones.ts`. | Reubicación de responsabilidades y aplicación de SRP. |
| R5 · Validación | `validarComentario()` recibe el objeto de entrada en lugar de argumentos separados. | Simplificación de parámetros y mayor claridad. |

También se corrigió la validación de fechas imposibles y se reemplazó una afirmación `as Noticia[]` por un tipado explícito. Esas dos intervenciones se documentan **separadas de los refactorings** porque responden a objetivos distintos.

## Persistencia y alcance

Por defecto, las interacciones se almacenan en `localStorage`, separadas por noticia. Este mecanismo conserva los datos al recargar **si se mantiene el mismo origen** (protocolo, dominio y puerto); por ejemplo, `localhost:5173` y `localhost:5174` utilizan almacenamientos distintos.

El servicio contempla la variable opcional `VITE_INTERACCION_API_URL` para consumir una API externa. **El repositorio no incluye un backend**: la demostración documentada utiliza la persistencia local.

## Documentación y evidencias

- [Aporte de Noticias — Alexia](docs/aporte-alexia.md)
- [Aporte de Comentarios — Eugenia](docs/aporte-euge.md)
- [Evidencias de Comentarios: estado inicial y verificaciones posteriores](docs/evidencias/euge/)

Las evidencias complementarias de Noticias e Interacciones se incorporaron al informe grupal y a los documentos individuales del equipo. La revisión cruzada, los hitos de Git y las pruebas finales se registran como parte del proceso de cierre del TPI.
