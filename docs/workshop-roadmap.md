# Roadmap — Transformer Explainer ES

Objetivo del fork: enseñanza en español mediante visualizaciones interactivas para estudiantes sin conocimientos previos de programación. Mantener la autoría y licencia MIT original.

| Meta | Prioridad | Entregable | Verificación |
| --- | --- | --- | --- |
| M0 · Base modular | Ahora | Selector es/en, presentación de seis etapas, ONNX bajo demanda, documentación | `npm run check`, `npm run build`; 0 solicitudes a `gpt2.onnx.part*` antes de aceptar carga |
| M1 · Localización pedagógica | Alta | Artículo, tarjetas del libro, tooltips y glosario es/en, sin traducir datos precomputados | Auditoría visual; fórmulas y términos científicos preservados |
| M2 · Ligereza real | Alta | Dividir ejemplos con importación diferida; desacoplar descarga/despliegue de pesos; métricas de bundle/tiempo | Comparación de transferencias iniciales y Lighthouse antes/después |
| M3 · Presentador | Media | Foco por módulo, 16:9, pantalla completa, navegación teclado, texto legible a distancia | Prueba en proyector, 1366×768, móvil, reduced-motion |
| M4 · Ejercicios sin código | Media | Ejercicios sobre tokenización, atención, masking, softmax, temperatura; pistas y comprobación | Completar tres ejercicios en modo demo sin red/modelo |
| M5 · Laboratorio entrenable | Largo plazo | Transformer **distinto** y pequeño, entrenamiento reproducible, checkpoints y exploración de internals reales | Ver `docs/tiny-model-training-vision.md`; prueba piloto con Colab gratuito |

## Prioridades y límites
- M0 es una primera iteración funcional, **no una traducción completa ni una reducción total del sitio**.
- M1–M4 deben quedar útiles aunque M5 nunca se complete.
- No mezclar refactor masivo del visualizador con traducción o lecciones. PRs pequeños, pruebas por módulo.
- Los ejercicios deben ser manipulables y explicar causa/efecto, no solo preguntas tipo trivia.
- Para clases presenciales, proporcionar una ruta offline/precalculada y evitar recursos pesados en el arranque.
- Preservar licencia, crédito al Polo Club of Data Science y enlaces al artículo científico original.

## Estado verificado (12 oct 2026)
- **M0:** GitHub Actions ejecutó correctamente instalación reproducible (`npm ci`), tipos estrictos para `src/workshop/**/*.ts` y build de producción; run [38292557402](https://github.com/fbientrigo/transformer-explainer/actions/runs/38292557402).
- **M1, iteración inicial:** 20 secciones didácticas localizadas en `src/workshop/lesson/book.es.ts`, artículo educativo español independiente y selector de idioma. **Es una adaptación didáctica**, no traducción literal y exhaustiva del artículo original ni de todos los popovers del diagrama.
- **CI de regresión:** `npm run test:workshop` verifica cobertura de 20 IDs, contenido estático y carga ONNX a petición. Requiere aprobación de su propio CI antes de merge.
- **Deuda técnica heredada:** `npm run check` del repositorio completo no está en verde (~499 diagnósticos en una corrida previa). La validación obligatoria actual se acota explícitamente a TypeScript nuevo, invariantes y compilación; la deuda global debe tratarse por separado sin desactivar el chequeo original.
- **Revisión manual pendiente:** proyector, interacción real en navegador, red lenta/offline, descarga voluntaria y generación de texto propio.

## Validaciones M0 pendientes
- CI inicial: `npm ci` falla antes de compilar por conflicto **heredado**: Vite 5.4.21 frente a `@sveltejs/vite-plugin-svelte` 6.2.4 (requiere Vite >=6.3). Temporalmente CI usa `--legacy-peer-deps` para intentar `check`/`build`; actualizar Vite y lockfile en un PR dedicado. No considerar esto una solución definitiva ni afirmar build verde hasta comprobarlo.
- Comprobar manualmente 5 ejemplos existentes, navegación con flechas/Escape, selector de idioma y carga voluntaria de GPT-2.
- Comprobar que texto libre no usa activaciones antiguas en modo demostración.
- Si el build falla por problemas heredados, separar defectos preexistentes de los del fork.
