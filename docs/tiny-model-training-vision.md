# Visión a largo plazo — entrena y abre tu propio Transformer

## Experiencia objetivo
Un estudiante sin necesidad de escribir código configura un modelo pequeño, inicia un entrenamiento corto sobre un corpus simple y abre una inspección visual de **ese mismo** checkpoint. Ve tokens, embeddings, atención por capa/cabeza, logits, pérdida y evolución del entrenamiento. Puede cambiar una variable y contrastar predicciones con evidencias.

## Restricciones
- Colab gratuito es opcional, volátil y no garantiza GPU. La presentación y los ejercicios deben funcionar sin él.
- No entrenar GPT-2 de 124 M de parámetros desde cero; construir un decoder Transformer distinto. El objetivo exploratorio es del orden de 1–10 M de parámetros, **no presupuesto ni tiempo garantizado**.
- Priorizar un piloto de menos de 2 M, vocabulario pequeño, dataset pequeño, contexto corto y batch pequeño para medir costo real antes de subir escala.
- Sin requisito de API pagada, cuenta Hugging Face ni hardware GPU individual.
- Nunca afirmar que la atención de un ejemplo estático es un entrenamiento vivo.

## Contrato pedagógico del piloto
1. Elegir corpus y semilla; visualizar tokenización y tamaño del vocabulario.
2. Ajustar dimensiones discretas permitidas: capas, cabezas, dimensión de embedding, longitud de contexto; mostrar número estimado de parámetros y memoria.
3. Registrar pérdida de entrenamiento/validación, tokens procesados y checkpoint; poder reanudar después de caída sin perder la clase.
4. Comparar `antes` y `después` del entrenamiento con **prompts iguales** y las mismas opciones de muestreo.
5. Inspeccionar matriz de atención real, distribuciones de logits y embeddings de un checkpoint identificable.
6. Exportar snapshots compactos (formato versionado) para que el frontend no necesite cargar PyTorch ni entrenar durante la presentación.

## Arquitectura propuesta
- `trainer` (Colab/PyTorch, externo y opcional): produce checkpoints y snapshots.
- `snapshot-exporter`: convierte tensores seleccionados a un formato liviano, versionado y reproducible.
- `model-adapter`: lee snapshots y normaliza formas para el visualizador.
- `interactive-lessons`: entrega ejercicios que utilizan los snapshots sin depender del backend de entrenamiento.
- El navegador conserva el modo demo y el modo GPT-2, ambos independientes del entrenador.

## Criterios de decisión antes de implementar M5
- Benchmark reproducible en CPU y Colab gratuito (incluye caída de sesión).
- Entrenamiento suficientemente corto para un bloque docente definido mediante piloto; no inventar duración.
- Tamaño de checkpoint y exportación compatible con descarga estudiantil.
- Métrica observable de aprendizaje (pérdida y mejora frente a baseline de bigramas); visualizar fallos, no ocultarlos.
- Si el piloto es inviable, usar checkpoints preparados como alternativa docente legítima.

Esta es una meta explícitamente **pospuesta**. No agregar dependencias de entrenamiento a M0–M4.
