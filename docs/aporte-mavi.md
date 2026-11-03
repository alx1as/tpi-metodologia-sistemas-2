# Aporte de Mavi – Interacciones y persistencia

## 1. Alcance del trabajo

Se revisó el servicio `src/servicios/interacciones.ts`, responsable de obtener las interacciones de una noticia, alternar likes, publicar comentarios y validar sus datos. En el prototipo, el servicio utiliza `localStorage` cuando no se configura una API externa.

El objetivo fue mejorar la organización interna del servicio sin alterar las operaciones que utiliza la interfaz:

- `obtenerInteracciones(slug)`
- `alternarLike(slug)`
- `publicarComentario(slug, entrada)`

## 2. Problemas identificados

**Problema 1. Reglas de interacción y persistencia en el mismo módulo**

- **Ubicación:** `src/servicios/interacciones.ts`, funciones `leerLocal()` y `guardarLocal()` de la versión inicial.
- **Problema:** el servicio combinaba decisiones sobre likes y comentarios con lectura y escritura directa en `localStorage`.
- **Impacto:** aumentaba el acoplamiento entre reglas de interacción y almacenamiento. Modificar la persistencia requería intervenir en el archivo que contiene la lógica del servicio.
- **Prioridad:** media.

**Problema 2. Datos de validación pasados como parámetros separados**

- **Ubicación:** `validarComentario(nombre, texto)` en `src/servicios/interacciones.ts`.
- **Problema:** `publicarComentario()` ya recibía un objeto `entrada`, pero desarmaba sus propiedades para llamar a la validación.
- **Impacto:** se utilizaban dos formas de representar datos relacionados y se agregaban argumentos innecesarios a una función interna.
- **Prioridad:** baja-media.

**Problema 3. Falta de validación estructural del almacenamiento**

- **Ubicación:** `leerLocal()`; actualmente, `src/servicios/almacenInteracciones.ts`.
- **Problema:** `JSON.parse(...) as AlmacenLocal` interpreta los datos recuperados como si cumplieran la estructura de tipos esperada, sin comprobarla durante la ejecución.
- **Impacto:** un JSON sintácticamente válido, pero con una estructura incorrecta, puede llegar a la lógica de interacciones.
- **Prioridad:** media. Permanece como mejora pendiente.

## 3. Cambios realizados

**Refactoring 1. Reubicación de la persistencia (Move Method o equivalente)**

Se trasladaron `leerLocal()` y `guardarLocal()` a `src/servicios/almacenInteracciones.ts`. El servicio `interacciones.ts` conserva las reglas sobre likes y comentarios y utiliza esas funciones mediante una importación.

Antes, las funciones de almacenamiento estaban definidas dentro del servicio:

```ts
// interacciones.ts (versión inicial)
function leerLocal(): AlmacenLocal {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "{}") as AlmacenLocal;
  } catch {
    return {};
  }
}

function guardarLocal(datos: AlmacenLocal) {
  localStorage.setItem(CLAVE, JSON.stringify(datos));
}
```

Después, se ubican en un módulo específico:

```ts
// interacciones.ts
import { leerLocal, guardarLocal } from "./almacenInteracciones";
```

**Resultado:** cada módulo concentra una responsabilidad más definida: `interacciones.ts` gestiona las operaciones del servicio y `almacenInteracciones.ts` implementa la persistencia local. El cambio mejora la cohesión y se relaciona con el principio de Responsabilidad Única (SRP). Las funciones públicas conservan sus nombres y parámetros.

Commit: `5667ae6` — `refactor: separar persistencia de interacciones`.

**Refactoring 2. Simplificación de parámetros de validación**

La función interna `validarComentario()` pasó de recibir `nombre` y `texto` por separado a recibir una estructura tipada. Se reutiliza el objeto `entrada`, que ya existía en `publicarComentario()`.

Antes:

```ts
function validarComentario(nombre: string, texto: string) {
  const nombreLimpio = nombre.trim();
  const textoLimpio = texto.trim();
  // Continúan las reglas de validación.
}

validarComentario(entrada.nombre, entrada.texto);
```

Después:

```ts
interface DatosValidacionComentario {
  nombre: string;
  texto: string;
}

function validarComentario({ nombre, texto }: DatosValidacionComentario) {
  const nombreLimpio = nombre.trim();
  const textoLimpio = texto.trim();
  // Continúan las mismas reglas de validación.
}

validarComentario(entrada);
```

**Resultado:** la validación utiliza una única representación de los datos relacionados. Es una simplificación equivalente a *Introduce Parameter Object*, ya que se aprovecha un objeto existente. No se modificaron las reglas de validación ni la firma pública de `publicarComentario()`.

Commit: `77bae25` — `refactor: simplificar validacion de comentarios`.

## 4. Pruebas y verificaciones

En el estado inicial se registraron seis casos: dar y quitar like, persistencia del like, publicación de comentario válido, rechazo de comentario inválido, separación de interacciones por noticia y persistencia de comentarios.

Después de los refactorings, el aporte individual documenta los siguientes resultados:

| Caso | Resultado posterior |
|---|---|
| Dar y quitar like | Aprobado. El contador pasa de 0 a 1 y vuelve a 0. |
| Persistencia del like | Aprobado. El estado se conserva tras recargar. |
| Comentario válido | Aprobado. Se publica y aparece en la noticia. |
| Comentario inválido | Aprobado. Se rechaza con el mismo mensaje de validación. |
| Separación de interacciones por noticia | Pendiente de repetir en la prueba integral final. |
| Persistencia de comentarios | Pendiente de repetir en la prueba integral final. |

El aporte también registra la ejecución correcta de `npm run build` y `npm run lint`: Vite transformó 1589 módulos y completó el build en 1,18 s; ESLint finalizó sin errores ni advertencias.

Las capturas del estado inicial y los resultados técnicos están incluidos en el documento individual `Aporte_Mavi_TPI_MSII_actualizado_build_lint_commits.docx`, incorporado a la documentación del TPI.

## 5. Trazabilidad en Git y revisión

Se trabajó sobre la rama `refactor/interacciones`, con dos commits independientes para distinguir los cambios de responsabilidad y de validación. Ambos commits aparecen en el historial integrado de `main` de la copia revisada del repositorio.

Como criterios para la revisión cruzada se definieron la conservación de las funciones públicas, la separación de responsabilidades, la claridad de los parámetros, el manejo de errores y la repetición de las pruebas afectadas. El registro de observaciones y aprobación por otra integrante debe completarse con la revisión efectiva del equipo.

## 6. Conclusión

Los dos refactorings mejoraron la calidad interna del servicio de interacciones: la persistencia local quedó en un módulo propio y la validación pasó a recibir los datos mediante una estructura tipada. Las cuatro pruebas funcionales posteriores registradas resultaron satisfactorias y las comprobaciones de build y lint finalizaron correctamente. Como mejoras pendientes quedaron la validación de la estructura del JSON almacenado y la repetición de dos casos en la verificación integral.

La documentación del uso individual de inteligencia artificial corresponde al anexo de Mavi, que se incorpora por separado al TPI.
