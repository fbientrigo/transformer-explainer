# Arquitectura educativa modular (propuesta)

## Principio
**Un mismo visualizador puede presentar datos de distintas fuentes**, sin exigir que cada modo ejecute GPT-2. No confundir una visualización conceptual con una medición auténtica del modelo.

### Módulos y responsabilidades
| Capa | Ubicación actual o futura | Responsabilidad |
| --- | --- | --- |
| Traducción | `src/workshop/i18n.ts` | Diccionarios es/en; no acoplar idioma a tokens precalculados |
| Presentación | `src/components/workshop/`, `src/workshop/lesson/slides.ts` | Navegación, texto de diapositivas, foco visual, accesibilidad |
| Estado UI | `src/workshop/state.ts` | Solo estado del workshop; no inferencia |
| Visualizador original | `src/components/`, `src/store/` | Mantener capacidades de GPT-2 existentes |
| Datos de ejemplo | `src/constants/examples/` | Salidas precalculadas consistentes con prompts/tokenización |
| Adaptadores de modelos (futuro) | `src/workshop/model/` | `ModelAdapter` para inferencia e introspección |
| Ejercicios (futuro) | `src/workshop/exercises/` | Preguntas, hipótesis, acciones, verificación, feedback |
| Entrenamiento (largo plazo) | `src/workshop/training/` | Entrenador opcional; exporta checkpoints/snapshots al adaptador |

### Contrato futuro — no implementar todavía
Un adaptador producirá metadatos y snapshots alineados con **el modelo realmente ejecutado**:

```ts
interface ModelMetadata {
  id: string;
  architecture: 'decoder-transformer';
  layers: number;
  heads: number;
  embeddingDim: number;
  parameterCount: number;
  tokenizerId: string;
}
interface InferenceSnapshot {
  modelId: string;
  inputTokenIds: number[];
  layerIndex: number;
  // Index conventions documented: [head][queryToken][keyToken].
  attentionWeights?: number[][][];
  // Named arrays with exact shapes/dtypes for reproducibility.
  activations?: Record<string, { shape: number[]; values: number[] }>;
  logits?: number[];
}
interface ModelAdapter {
  metadata(): ModelMetadata;
  infer(input: string, options?: { temperature?: number }): Promise<InferenceSnapshot>;
}
```

El contrato es ilustrativo; antes de codificarlo hay que resolver límites de memoria, snapshots parciales, atención causal, batch dimension, normalización y formato de checkpoint. Los tensores deben corresponder a una versión/semilla del modelo identificable.

### Invariantes
- **Modo Presentación**: no requiere descargar pesos ONNX; sirve con ejemplos precalculados.
- **Modo Exploración**: entrada propia solo cuando el motor está listo; no atribuir a un prompt arbitrario activaciones de otro.
- **Modo Laboratorio**: cada ejercicio tiene objetivo comprobable, control disponible y pista; nunca depende de entrenamiento para funcionar.
- **Modo Entrenamiento** (futuro): opt-in y aislado; debe poder fallar o perder conexión sin romper la presentación.
- El modo visual evita volver a implementar la lógica de atención y aprovecha, cuando sea posible, los mismos componentes existentes.

### Deuda conocida en M0
El artículo, el libro didáctico y parte de los tooltips siguen en inglés. Los cinco ejemplos precalculados se importan aún conjuntamente; el modelo ONNX sigue almacenado en `static/model-v2`, por lo que se reduce la descarga inicial **del visitante**, no el tamaño de la publicación. Hay que medir bytes iniciales de JS y solicitudes antes de prometer rendimiento.
