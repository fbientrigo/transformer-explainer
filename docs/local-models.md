# Modelos propios: contrato de inspección y presupuesto local

## Objetivo y diseño

Este fork está pensado **para preparar y mostrar presentaciones**. No obliga al público a descargar modelos ni a tener GPU. Se puede presentar el recorrido de GPT-2 con datos originales precalculados; además, el botón **Modelo propio** permite abrir un JSON exportado de un modelo que el presentador haya ejecutado o entrenado **en su computadora**.

La aplicación web es **un lector de snapshots**, no un servidor de inferencia. No ejecuta Python, no analiza archivos pickle y no envía el JSON a ninguna API. Se mantiene el visualizador original de GPT-2 sin intentar reinterpretar como sus propios tensores los de otra arquitectura.

## Diagrama de módulos

```text
   Ejecución/entrenamiento local (opcional, PyTorch)
       tools/tiny_model.py
              |
              | exporta tensores reales con schema versionado
              v
       un archivo .json <= 4 MiB
              |
   abrir desde navegador (File API, sin subir a servidor)
              |
       src/workshop/model/snapshotAdapters.ts
                  -> parseSnapshot.ts
                  -> contract.ts
              |
       components/workshop/ModelInspector.svelte
          tokens / capas / cabezas / atención / logits / pérdida

   Ruta independiente existente:
       GPT-2 ejemplos precalculados o inferencia ONNX opcional
              |
       visualizador original Svelte/D3
```

El punto de extensión es `SnapshotAdapter`, en `src/workshop/model/contract.ts`: agregar otros adaptadores de snapshots sin importar sus frameworks a la UI. El formato v1 únicamente admite **decoder Transformer causal**. Para modelos encoder o modelos multimodales, evolucionar el contrato a otra versión, nunca fingir compatibilidad.

## Cómo usar (Windows / Linux, sin servidor Python)

1. Clona el repositorio y ejecuta `npm ci` y `npm run dev`. No necesitas PyTorch para presentar ejemplos o inspeccionar archivos.
2. Comprueba sin instalar PyTorch: `python tools/tiny_model.py --dry-run`.
3. Para entrenar **opcionalmente** en CPU/GPU local, instala PyTorch en un entorno Python aparte desde su sitio oficial, eligiendo el build apropiado para el driver CUDA de tu equipo. PyTorch es la **única dependencia Python no estándar** de este programa; no utiliza Transformers/Hugging Face, ONNX ni servicios web.
4. Ejecuta:

```bash
python tools/tiny_model.py --device auto --steps 25 --output exports/ejemplo.snapshot.json
```

5. En la presentación, pulsa **Modelo propio** y carga `exports/ejemplo.snapshot.json`. El navegador lee el fichero local sin ejecutar código Python ni cargar ningún modelo.

Para otro corpus, usa `--text corpus.txt` (UTF-8, máximo 2 MB) y un `--prompt` compuesto por caracteres presentes en el corpus. Puedes usar `--device cpu` en salas sin CUDA.

## Límites por diseño

| Recurso | Límite / valor conservador |
| --- | --- |
| VRAM de referencia | **4 GiB** total del equipo, no la VRAM disponible que se presume libre |
| RAM de referencia | **8 GiB** del sistema |
| Máximo asignador CUDA del proceso | **3072 MiB** por defecto (`--max-vram-mb`, no es un control del total usado por drivers) |
| Modelo por defecto | 2 capas, 4 cabezas, embedding 128, contexto 32 |
| Batch por defecto | 4 secuencias |
| Parámetros efectivos | Por debajo de 2 millones (verificados en la ejecución) |
| Restricciones del script | hasta 4 capas, 8 cabezas, embedding 192, contexto 64, batch 8 |
| Entrada de snapshot a UI | JSON de hasta 4 MiB; matriz hasta 6 capas × 12 cabezas × 64 tokens² |
| Red | Sin descarga de pesos, tokenizadores o corpus para el camino de modelos propios |

**Importante:** los límites son precauciones; **no garantizan** consumo máximo de 4 GB de VRAM u 8 GB de RAM. CUDA, escritorio gráfico y drivers pueden reservar memoria fuera del asignador PyTorch. El script utiliza `torch.cuda.set_per_process_memory_fraction` para limitar asignaciones administradas por PyTorch y exige al menos 1 GiB de VRAM libre, si CUDA está activado. Se debe medir en la máquina real. En caso de error, usa `--device cpu`, menor contexto o batch.

## Qué se visualiza realmente

- Tokenización **por carácter** del ejemplo, distinta del BPE de GPT-2; no se presenta como tokenizador GPT-2.
- Pesos de atención **reales** después del softmax, por cada cabeza y capa, recogidos en la ejecución de inferencia del modelo entrenado.
- Logits y token más probable de la última posición. La UI aplica temperatura y **renormaliza únicamente entre los candidatos exportados**: no son las probabilidades de todo el vocabulario.
- Historial de pérdida de entrenamiento tomado de la ejecución.

No se exportan pesos completos ni gradientes. El contrato puede ampliarse con una versión nueva cuando exista un caso docente para mostrarlos. **No cargar archivos binarios ajenos** como checkpoints de PyTorch; este flujo solo interpreta JSON validado.

## Dependencias externas remanentes

El camino de **Modelo propio** no requiere red. La **inferencia opcional GPT-2** del proyecto original todavía emplea el tokenizador remoto `Xenova/gpt2`, los 63 fragmentos ONNX publicados en `static/model-v2` y posiblemente recursos de ONNX Runtime. Es un modo heredado distinto del camino de clase. No se garantiza uso offline íntegro de GPT-2 sin un trabajo dedicado de empaquetado y prueba local.

## Para incorporar otro modelo

Escribe un exportador que produzca `workshop.snapshot.v1` según `contract.ts`: `model`, `input.tokens`, `input.tokenIds`, `layers[].attention[head][query][key]`, `output.candidates` y `output.selectedToken`. Cada fila de atención debe estar normalizada y enmascarar futuras posiciones; incluye el número de parámetros y procedencia verdadera del modelo. Es una captura reproducible, **no una simulación de una red diferente**.
