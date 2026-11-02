# Aporte de Euge – Comentarios y respuestas

## 1. Alcance del trabajo

Se revisó la sección de comunidad que aparece al final de cada noticia, implementada en `src/componentes/InteraccionNoticia.tsx`: botón «Me gusta», formulario con selección de avatar, lista de comentarios, respuestas anidadas y mensajes de validación.

El objetivo fue mejorar la calidad interna del componente sin modificar lo que ve el usuario. No se modificó `src/servicios/interacciones.ts`, que corresponde a otra integrante, y el componente sigue llamando a `obtenerInteracciones(slug)`, `alternarLike(slug)` y `publicarComentario(slug, entrada)` con los mismos nombres y parámetros.

## 2. Problemas identificados

**Problema 1. Componente con demasiadas responsabilidades**

- **Ubicación:** `src/componentes/InteraccionNoticia.tsx` – componente `InteraccionNoticia` (líneas 55–266 de la versión inicial).
- **Problema:** en un solo componente convivían la carga de datos, los likes, el formulario y la lista recursiva de comentarios (*Large Class* / componente dios; viola SRP). Un único estado `mensaje` se usaba para el error de carga, el error del like y los mensajes del formulario, y se mostraba dentro del formulario: un error del botón «Me gusta» aparecería debajo de «Publicar».
- **Impacto:** cualquier cambio en una de las cuatro tareas obliga a leer y modificar el mismo archivo, con riesgo de afectar a las demás.
- **Prioridad:** media. Se documenta y queda como mejora futura, ya que su corrección completa implica un rediseño interno mayor.

**Problema 2. Lógica de datos mezclada con la presentación**

- **Ubicación:** `renderComentario()` (líneas 117–119) y cálculo de `comentariosRaiz` (línea 82).
- **Problema:** para obtener las respuestas de cada comentario se filtraba la lista completa dentro de la función que dibuja la pantalla, incluso para las respuestas, que nunca tienen hijos. La regla que arma el árbol de comentarios quedaba dispersa en dos lugares.
- **Impacto:** el render es más difícil de leer y el costo crece de forma cuadrática con la cantidad de comentarios. Con pocos comentarios no hay un problema visible; la consecuencia principal es de mantenibilidad.
- **Prioridad:** media-alta.

**Problema 3. Acoplamiento oculto por ID fijo**

- **Ubicación:** línea 144, `document.getElementById("form-comentario")`, vinculada al `id` del formulario en la línea 185.
- **Problema:** el botón «Responder» ubicaba el formulario buscándolo en todo el documento por un texto repetido en dos lugares, sin usar el mecanismo propio de React.
- **Impacto:** si se renombraba el `id`, el scroll dejaba de funcionar sin error de compilación ni de lint. Dos instancias del componente generarían un `id` duplicado.
- **Prioridad:** baja-media.

## 3. Cambios realizados

**Refactoring 1. Extract Method: agrupación de respuestas**

Se extrajo la búsqueda de respuestas a la función pura `agruparRespuestas()`, ubicada fuera del componente. La función recorre los comentarios una sola vez y arma un `Map` cuya clave es el id del comentario padre. El resultado se calcula con `useMemo` junto a `comentariosRaiz`, y `renderComentario()` solo consulta el `Map`.

Antes:

```tsx
const respuestas = estado.comentarios.filter(
  (item) => item.respuestaA === comentario.id
);
```

Después:

```tsx
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

// en renderComentario()
const respuestas = respuestasPorComentario.get(comentario.id) ?? [];
```

Se conservó el criterio (`respuestaA === id`) y el orden de las respuestas. La mejora se relaciona con SRP y Clean Code: el render se limita a presentar y la lógica de datos queda nombrada y aislada.

Commit: `321aad8`.

**Refactoring 2. Referencia de React en lugar de ID fijo**

Se reemplazó `document.getElementById("form-comentario")` por una referencia tipada `useRef<HTMLFormElement>(null)`, asociada al formulario con `ref={formularioRef}`. Se eliminó el atributo `id`, que solo se usaba para esa búsqueda; la clase `.form-comentario` y sus estilos se conservaron.

Antes:

```tsx
document.getElementById("form-comentario")?.scrollIntoView({ behavior: "smooth", block: "center" });
<form id="form-comentario" className="form-comentario" onSubmit={enviarComentario}>
```

Después:

```tsx
const formularioRef = useRef<HTMLFormElement>(null);
formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
<form ref={formularioRef} className="form-comentario" onSubmit={enviarComentario}>
```

Durante el cambio, TypeScript marcó `Cannot find name 'formularioRef'` mientras la referencia aún no estaba declarada: con el `id` de texto, un error equivalente pasaba inadvertido. El vínculo entre el botón y el formulario ahora lo controla el compilador.

Commit: `513ec47`.

## 4. Pruebas y verificaciones

Antes de los cambios se verificaron siete funcionalidades: comentario válido, comentario vacío, elección de avatar, acción «Responder», respuesta anidada, límite de 10 segundos entre comentarios y persistencia al recargar. Las siete fueron satisfactorias. También se ejecutaron `npm run build` y `npm run lint`, sin errores.

Después de cada refactoring se repitieron los casos afectados, y al finalizar se repitieron los siete sobre una noticia sin interacciones previas:

| Caso | Antes | Después |
|------|-------|---------|
| Comentario válido | Se publica y muestra «Publicado.» | Igual |
| Comentario vacío | «El comentario tiene que tener entre 2 y 500 caracteres.» | Igual |
| Avatar | El comentario muestra el avatar elegido | Igual |
| Responder | «Respondiendo a [nombre]» con opción de cancelar y scroll al formulario | Igual |
| Respuesta anidada | Respuestas indentadas bajo su comentario, en orden de publicación | Igual |
| Límite de 10 s | «Esperá unos segundos antes de volver a comentar.»; el texto queda en el campo | Igual |
| Persistencia | Tras recargar se conservan comentarios y anidación | Igual |

- `npm run build` y `npm run lint` sin errores en las tres instancias (inicial, después de R1 y después de R2).
- El hash del CSS generado (`Ynkq4UXV`) es idéntico en las tres instancias: la presentación no se modificó.
- `src/servicios/` no tiene cambios respecto de `main`.

Durante las pruebas se observó que, al reiniciar el servidor, Vite pasó del puerto 5173 al 5174 y los comentarios previos dejaron de verse. En DevTools se comprobó que no se perdieron: `localStorage` se separa por origen (dominio y puerto). Es una limitación del mecanismo de persistencia del prototipo, no un efecto del refactoring.

Evidencias en `docs/evidencias/euge/`: `inicial/`, `r1-extract-method/`, `r2-useref/` y `final/`, cada una con sus capturas y, cuando corresponde, la salida de build y lint.

Commits de evidencias: `8b8e461` (estado inicial) y `b4a053e` (verificación final).

## 5. Conclusión

Se trabajó sobre el componente `InteraccionNoticia`, que concentraba demasiadas responsabilidades y violaba el primer principio SOLID (SRP): un *code smell* de tipo *Large Class* o componente dios. En un solo componente convivían la carga de datos, los likes, el formulario y la lista recursiva de comentarios, y el estado compartido `mensaje` evidenciaba un alto acoplamiento entre esas partes.

Además, `renderComentario()` mezclaba lógica de datos con presentación y repetía el filtrado de la lista por cada comentario; ahí se aplicó Extract Method, extrayendo la función `agruparRespuestas()`. Por último, se detectó un acoplamiento oculto por un ID fijo y acceso directo al DOM, que se reemplazó por una referencia con el hook `useRef`. Ambos cambios se verificaron con los mismos siete casos de prueba antes y después, sin regresiones.

Quedan pendientes como mejoras futuras extraer la presentación de cada comentario a un componente `ComentarioItem.tsx` y separar el estado `mensaje` por responsabilidad. El trabajo me sirvió para repasar los hooks de React, los principios SOLID como SRP, técnicas de refactoring como Extract Method y la importancia de dejar evidencia antes/después para demostrar que el comportamiento externo se conserva.

## 6. Uso de inteligencia artificial

Se utilizó Claude como apoyo para comprender la consigna y el reparto, revisar el diagnóstico del componente, evaluar alternativas de refactoring, guiar los casos de prueba y ordenar la documentación. Los cambios se escribieron, aplicaron y verificaron sobre el proyecto, revisando los resultados obtenidos. Las interacciones relevantes se conservarán como evidencia para el anexo del TPI.
