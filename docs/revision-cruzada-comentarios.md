# Revisión técnica del módulo Comentarios

**Proyecto:** TPI Metodología de Sistemas II — El Club de la Nostalgia  
**Autora de los cambios:** Eugenia Demarchi  
**Revisión técnica asistida por IA:** 3 de noviembre de 2026, a solicitud de Alexia Rubin  
**Alcance:** `src/componentes/InteraccionNoticia.tsx`  
**Referencias:** commits `321aad8` y `513ec47`; PR #2 (`refactor/comentarios`, integrado en `026e803`).

## 1. Cambios examinados

**R2 — Extract Method, commit `321aad8`.** En la versión anterior, `renderComentario()` ejecutaba un `filter` de toda la colección para obtener las respuestas de cada comentario. Se agregó la función `agruparRespuestas()`, que construye un `Map` de identificadores de comentario padre a sus respuestas en un solo recorrido. El componente obtiene ese mapa mediante `useMemo`, con `estado.comentarios` como dependencia. El render consulta `respuestasPorComentario.get(comentario.id) ?? []`.

**Evaluación:** el cambio separa la transformación de datos de la presentación, elimina filtrados reiterados y conserva la relación `respuestaA`/`id`. La agrupación mantiene el orden de aparición de las respuestas. Es una mejora de cohesión y claridad de intención; no modifica la estructura visible de las respuestas.

**R3 — Referencia al formulario, commit `513ec47`.** La acción **Responder** reemplazó `document.getElementById("form-comentario")` por `formularioRef.current`, declarado con `useRef<HTMLFormElement>(null)` y asociado al `<form ref={formularioRef}>`.

**Evaluación:** el acceso deja de depender de una cadena de identificación global al documento. La referencia está vinculada al formulario renderizado por el componente y cuenta con tipado de TypeScript. Se comprobó que los estilos corresponden a la clase `.form-comentario`, que se conservó en el JSX y el CSS.

## 2. Checklist y resultado

| Criterio de revisión | Comprobación | Resultado |
|---|---|---|
| Responsabilidades y legibilidad | La agrupación está en una función específica fuera del JSX. | Conforme |
| Cohesión y acoplamiento | Se sustituyó el acceso global al DOM por una referencia del componente. | Conforme |
| Conservación de la lógica | Las respuestas siguen asociadas al padre y en el mismo orden. | Conforme |
| Contratos y tipos | No cambiaron las funciones públicas de interacciones; `formularioRef` está tipada. | Conforme |
| Estilos | El formulario conserva la clase CSS utilizada por los estilos. | Conforme |
| Trazabilidad | Los cambios están identificados en los commits `321aad8` y `513ec47`, integrados mediante PR #2. | Conforme |
| Compilación y análisis estático | TypeScript, Vite build y ESLint ejecutados sobre copia aislada del ZIP. | Conforme |
| Casos de interfaz documentados | El aporte de Eugenia contiene capturas antes/después de siete recorridos funcionales. | Evidencia documental disponible |

## 3. Comprobaciones realizadas en esta revisión

Se inspeccionaron los diffs de ambos commits y se comparó el archivo final del ZIP con la versión en el commit `026e803` (contenido idéntico). Sobre una copia aislada del proyecto incluido en `TPI_MS2_Noticias(1).zip` se ejecutó:

- **TypeScript:** `node node_modules/typescript/bin/tsc -b` → **sin errores**.
- **Build Vite:** `node node_modules/vite/bin/vite.js build` → **correcto; 1589 módulos transformados**.
- **ESLint:** `node node_modules/eslint/bin/eslint.js .` → **sin errores**.

Se probaron también cuatro escenarios puntuales ejecutando la implementación real de `agruparRespuestas()` extraída de `InteraccionNoticia.tsx`, sin modificar el archivo: colección vacía, dos respuestas al mismo padre en orden, separación entre padres distintos y ausencia de respuestas. **Los cuatro casos resultaron correctos.**

Los siete recorridos de interfaz (publicación válida e inválida, avatar, respuesta, anidación, límite temporal y persistencia tras recarga) están documentados mediante las capturas y registros existentes en `docs/evidencias/euge/`. En esta revisión se examinó esa documentación; **no se ejecutó una nueva prueba manual en navegador**.

## 4. Observación y criterio de aceptación

Se mantiene identificada la deuda técnica **C1**: `InteraccionNoticia.tsx` concentra carga de datos, manejo de likes, formulario, mensajes y árbol de comentarios. El estado `mensaje` se comparte entre diferentes operaciones. Es una mejora futura distinta de los dos refactorings examinados.

**Resultado técnico:** cambios conformes con los criterios de legibilidad, responsabilidad y conservación de comportamiento analizados. **No se solicitan correcciones adicionales para R2 y R3.**

**Validación de la revisión entre integrantes:** pendiente de que Alexia confirme la lectura de este registro y deje su conformidad u observaciones en el PR #2 o en el repositorio. Esta comprobación técnica asistida por IA es evidencia verificable del análisis del código, pero no se atribuye como aprobación humana ya realizada.
