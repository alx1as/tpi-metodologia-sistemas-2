# Aporte de Alexia – Módulo de noticias

## 1. Alcance del trabajo

Se revisó la lógica de consultas y el manejo de datos del módulo de noticias, principalmente en `noticias.ts` y `formatearFecha.ts`.

El objetivo fue mejorar la calidad interna del código, manteniendo las funcionalidades existentes y evitando modificaciones innecesarias.

## 2. Problemas identificados

**Problema 1. Ordenamiento innecesario en la búsqueda por slug**

- **Ubicación:** `src/datos/noticias.ts` – `obtenerNoticiaPorSlug()`.
- **Problema:** para encontrar una noticia, primero se filtraban y ordenaban todas las noticias publicadas.
- **Impacto:** operaciones innecesarias que dificultaban la claridad y eficiencia de la búsqueda.
- **Prioridad:** baja, debido al tamaño reducido de la colección.

**Problema 2. Falta de validación de fechas**

- **Ubicación:** `src/utilidades/formatearFecha.ts`.
- **Problema:** las fechas inexistentes podían convertirse silenciosamente en otras fechas. Por ejemplo, `2026-02-31` se interpretaba como 3 de marzo de 2026.
- **Impacto:** posibilidad de mostrar información incorrecta ante datos de origen inválidos.
- **Prioridad:** media.

**Problema 3. Afirmación de tipo en los datos JSON**

- **Ubicación:** `src/datos/noticias.ts`.
- **Problema:** se utilizaba `as Noticia[]`, indicando que los datos cumplían con la estructura esperada sin exigir una comprobación estricta de compatibilidad.
- **Impacto:** posibles errores de estructura o tipos podían pasar inadvertidos durante la compilación.
- **Prioridad:** baja.

## 3. Cambios realizados

**Refactoring 1. Simplificación de la búsqueda**

Se reemplazó la llamada a `obtenerNoticiasPublicadas().find()` por una búsqueda directa sobre el arreglo de noticias, comprobando que la noticia esté publicada y que coincida su slug.

Se eliminó el ordenamiento innecesario y se conservó el comportamiento original. La mejora se relaciona con Clean Code por la simplificación de la lógica.

Commit: `8017a7a`.

**Mejora 2. Validación de fechas**

Se incorporaron comprobaciones del formato `AAAA-MM-DD` y de la validez de sus componentes. Las fechas incorrectas ahora devuelven «Fecha inválida», mientras que las válidas conservan su presentación habitual.

Este cambio mejora el manejo de errores. A diferencia del primer refactoring, introduce un comportamiento nuevo para entradas inválidas.

Commit: `2a6619d`.

**Mejora 3. Tipado de las noticias**

Se reemplazó `datosNoticias as Noticia[]` por una declaración explícita `const noticias: Noticia[] = datosNoticias`.

Esto permite comprobar la compatibilidad de los datos durante la compilación, sin incorporar dependencias ni modificar la funcionalidad. No constituye una validación de datos en tiempo de ejecución.

Commit: `f395822`.

## 4. Pruebas y verificaciones

Antes de los cambios se verificaron cinco funcionalidades: listado de noticias, orden por fecha, consulta por slug, respuesta ante un slug inexistente y formato de fechas.

Las cinco pruebas iniciales fueron satisfactorias. También se ejecutaron `npm run build` y `npm run lint`, sin errores.

Después de las modificaciones:

- Se comprobó que la búsqueda por slug continúa funcionando, incluso cuando la noticia no existe.
- Se verificó que las fechas válidas mantienen su formato y las inválidas se identifican correctamente.
- Se ejecutaron nuevamente las verificaciones de compilación y análisis estático sin errores.

Las capturas de pantalla y los resultados detallados se conservaron como evidencias para el informe grupal.

## 5. Conclusión

Las modificaciones permitieron simplificar la búsqueda de noticias, mejorar el manejo de fechas y reforzar la comprobación de tipos. Se priorizaron cambios pequeños, acordes con el tamaño del proyecto y sin agregar complejidad innecesaria.

El trabajo permitió aplicar conceptos de Clean Code, distinguir un refactoring de una corrección funcional y comprobar la importancia de verificar los resultados antes y después de modificar código.

## 6. Uso de inteligencia artificial

Se utilizó ChatGPT como apoyo para analizar el código existente, evaluar alternativas de mejora y definir casos de prueba. Los cambios se aplicaron y verificaron sobre el proyecto, revisando los resultados obtenidos. Las interacciones relevantes se conservarán como evidencia para el anexo del TPI.