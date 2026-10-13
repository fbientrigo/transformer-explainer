# Auditoría posterior a M0/M1 — 2026-10-12

## Resultado conseguido
- El modo demostración ahora puede visualizar los cinco snapshots originales **sin descargar el tokenizador de Hugging Face ni los pesos ONNX**. El primer ejemplo se importa en el arranque; los otros cuatro se dividen en chunks JS y se solicitan solo al elegirlos.
- `AutoTokenizer` y `onnxruntime-web` se importan dinámicamente cuando el visitante pulsa **Activar GPT-2**. Las llamadas de inferencia reales conservan el modelo y el tokenizador originales.
- El modo presentación tiene foco por etapa, navegación de seis escenas, selector es/en, opción de pantalla completa y ejercicio numérico interactivo de softmax. **Los logits del ejercicio son ficticios y están identificados como tales**: no se presentan como activaciones de GPT-2.
- Se corrigió el envío del formulario que podía recargar la página y se hizo síncrona la limpieza de `onMount`.
- Las 20 páginas del libro tienen adaptación en español, y existe artículo pedagógico español independiente del original inglés.
- Se añadieron pruebas matemáticas y de decodificación con los cinco snapshots originales, además de CI con Chromium y captura de pantalla.

## Afirmaciones que NO hacemos
- **No** se ha reducido el tamaño en disco del repositorio ni de `static/model-v2`: sigue conteniendo unos 657 MB de pesos fragmentados. La optimización reduce carga inicial/transferencias involuntarias, no almacenamiento del despliegue.
- **No** se ha certificado funcionamiento completamente offline: la aplicación web debe servirse inicialmente, y los ejemplos adicionales todavía requieren sus archivos JS si no están cacheados.
- **No** se ha reparado el chequeo TypeScript global heredado (`npm run check`). El workflow exige tipos estrictos solo para los módulos nuevos (`npm run check:workshop`), pruebas y build. Esta deuda debe estar visible.
- **No** se ha completado traducción de todos los tooltips, SVG y popovers del diagrama.
- **No** se ha construido un entrenador ni un modelo pequeño; permanece como meta aislada M5.

## Validación automatizada
- `npm ci`: instalación reproducible con Vite 6 y lockfile sincronizado.
- `npm run check:workshop`: módulos TypeScript nuevos en modo estricto.
- `npm run test:workshop`: integridad de 20 traducciones, 5 snapshots y propiedades de softmax.
- `npm run build`: exportación estática.
- **Chromium smoke**: carga inicial, selección de ejemplo diferido, navegación, cambio de idioma, manipulación de temperatura y respuestas; comprueba que no se soliciten los pesos ONNX ni el tokenizador remoto durante la demostración. Adjunta una captura del modo presentación como artifact de CI.

Las pruebas de navegador complementan, pero no sustituyen, una inspección con proyector o conexiones lentas reales.

## Próximos trabajos priorizados
1. **Revisión visual/manual de PR #1:** resoluciones 1366×768 y 1280×720, interacción con dropdown, sliders y modal, contraste/foco de teclado, layout responsive. El diagrama heredado fuerza anchura mínima; no prometer usabilidad móvil.
2. **Auditoría de peso inicial:** medir con Chrome DevTools JS comprimido, fuentes y petición de cada example chunk. Establecer presupuesto verificable antes de eliminar componentes.
3. **Resto de localización:** títulos de bloques, SVG, tooltips de atención, Q/K/V, términos MLP y selector de ejemplos. El texto de los ejemplos sigue en inglés por consistencia con activaciones originales.
4. **Deuda global TypeScript:** clasificar y corregir errores por módulo sin agregar `@ts-ignore` masivos.
5. **Ejercicios M4:** enmascaramiento causal, selección top-k vs top-p, predicción con verificación y feedback. Deben funcionar con snapshots sin descargar ONNX.
6. **Despliegue liviano:** decidir si ofrecer GPT-2 completo desde un recurso versionado remoto, separado del paquete estático de clase, sin depender silenciosamente de upstream.
7. **Laboratorio M5 (largo plazo):** Transformer diminuto entrenable y exportación de tensores reales, aislado del frontend de presentación.

## Decisiones de modularidad
`src/workshop/exercises/` mantiene matemáticas independientes, `src/workshop/model/` decodifica snapshots, `src/workshop/lesson/` almacena texto didáctico, y `src/components/workshop/` presenta controles y ejercicios. El visualizador y la lógica originales permanecen en sus módulos. Evitar incorporar PyTorch u otros frameworks de entrenamiento al bundle web.
