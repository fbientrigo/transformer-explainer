// Spanish classroom adaptation of the original 20 textbook pages.
// Preserve original English lesson callbacks, ids and cached GPT-2 tokens.
export interface BookTranslation { title: string; content: string; }
export const bookEs: Record<string, BookTranslation> = {
  "what-is-transformer": {
    "title": "¿Qué es un Transformer?",
    "content": "<p>Un <strong>Transformer</strong> es una arquitectura de redes neuronales introducida en 2017. Es una base de numerosos modelos de lenguaje modernos.</p><p>Aprende patrones a partir de datos durante el <strong>entrenamiento</strong>. Durante la <strong>inferencia</strong>, utiliza esos parámetros aprendidos para producir predicciones. Aquí exploramos GPT-2 pequeño, un modelo ya entrenado, para estudiar sus componentes sin tener que entrenarlo.</p>"
  },
  "how-transformers-work": {
    "title": "¿Cómo genera texto?",
    "content": "<p>En un modelo autoregresivo, la tarea básica es predecir <strong>el siguiente token</strong> a partir de los anteriores. Un token no tiene por qué coincidir con una palabra.</p><blockquote class=\"question\">¿Qué token podría venir después del texto disponible?</blockquote><p>Elige un ejemplo y observa el recorrido. Los ejemplos precalculados funcionan sin descargar los pesos del modelo. Para probar texto propio, primero activa GPT-2 desde la barra inferior.</p>"
  },
  "transformer-architecture": {
    "title": "Arquitectura del Transformer",
    "content": "<p>En esta visualización seguimos tres partes:</p><ol><li><strong>Embeddings:</strong> convierten identificadores de tokens en vectores numéricos e incorporan posición.</li><li><strong>Bloques Transformer:</strong> combinan información mediante atención y transformaciones MLP.</li><li><strong>Salida:</strong> convierte representaciones en logits, probabilidades y un token seleccionado.</li></ol><p>GPT-2 pequeño utiliza 12 bloques Transformer apilados. Este sitio muestra el funcionamiento durante la inferencia, no los cambios de pesos durante el entrenamiento.</p>"
  },
  "embedding": {
    "title": "Embeddings",
    "content": "<p>Una red neuronal no recibe palabras directamente. Primero transforma cada token en un <strong>vector de números</strong> llamado embedding.</p><p>En el diagrama, el rectángulo que representa un vector resume muchas dimensiones. Su longitud visual no indica necesariamente su valor matemático. Expande esta sección para inspeccionar las representaciones disponibles.</p>"
  },
  "token-embedding": {
    "title": "Embedding de tokens",
    "content": "<p>La <strong>tokenización</strong> asigna a cada fragmento de texto un identificador entero. El vocabulario de GPT-2 tiene <strong>50 257 tokens</strong>.</p><p>Cada identificador selecciona una fila de la matriz de embeddings. En GPT-2 pequeño, esa fila contiene <strong>768 valores</strong>, aprendidos durante el entrenamiento. Estos vectores no son listas de palabras: son parámetros numéricos.</p>"
  },
  "positional-encoding": {
    "title": "Información posicional",
    "content": "<p>La atención por sí sola no indica el orden de los tokens. Por eso se incorpora información sobre la <strong>posición</strong> de cada token en la secuencia.</p><p>GPT-2 utiliza embeddings posicionales aprendidos, que se suman a los embeddings de tokens. No deben confundirse con las codificaciones sinusoidales utilizadas en otras variantes de Transformers.</p>"
  },
  "blocks": {
    "title": "Bloques Transformer repetidos",
    "content": "<p>El modelo aplica sucesivamente bloques que procesan las representaciones de los tokens. En GPT-2 pequeño hay <strong>12 bloques</strong>.</p><p>Un bloque contiene <strong>atención causal multi-cabeza</strong>, una red <strong>MLP</strong>, normalización y conexiones residuales. Su entrada y salida conservan la dimensión del embedding, aunque cambian los valores representados.</p>"
  },
  "self-attention": {
    "title": "Autoatención multi-cabeza",
    "content": "<p>La <strong>autoatención</strong> permite que la representación de un token incorpore información de otros tokens de su contexto.</p><p>Los pesos de atención dependen del contenido y de la posición. En un modelo que genera texto de izquierda a derecha, la máscara causal impide atender posiciones futuras. Inspecciona una cabeza para comprobar qué tokens contribuyen más.</p>"
  },
  "qkv": {
    "title": "Query, Key y Value",
    "content": "<p>De cada representación se calculan tres proyecciones: <strong>Query (consulta)</strong>, <strong>Key (clave)</strong> y <strong>Value (valor)</strong>.</p><p>La similitud entre una Query y las Keys produce puntajes de atención, que se escalan y normalizan. Esos pesos combinan los vectores Value. Query y Key determinan <em>dónde mirar</em>; Value aporta la información agregada.</p>"
  },
  "multi-head": {
    "title": "Múltiples cabezas de atención",
    "content": "<p>La atención multi-cabeza utiliza varias proyecciones aprendidas para explorar distintas relaciones en el contexto.</p><p>GPT-2 pequeño contiene <strong>12 cabezas por bloque</strong>, cada una con dimensión 64. Las cabezas no son modelos independientes: sus resultados se concatenan y luego se proyectan de nuevo al espacio de 768 dimensiones.</p>"
  },
  "masked-self-attention": {
    "title": "Máscara de atención causal",
    "content": "<p>Al predecir el siguiente token, el modelo no puede leer el futuro. Una <strong>máscara causal</strong> asigna puntajes inválidos a las posiciones posteriores al token consultante.</p><p>Después de softmax, esas posiciones reciben peso cero. En una matriz de atención ordenada por posición, la región prohibida queda sobre la diagonal. La máscara es una restricción de la arquitectura, no una preferencia aprendida.</p>"
  },
  "output-concatenation": {
    "title": "Concatenación y salida de atención",
    "content": "<p>Cada cabeza de atención produce un vector de salida. El modelo <strong>concatena</strong> las salidas de las 12 cabezas y aplica una proyección lineal entrenable.</p><p>Así reúne información de distintas cabezas en una representación que vuelve a tener 768 dimensiones y puede incorporarse mediante una conexión residual.</p>"
  },
  "mlp": {
    "title": "MLP: red de alimentación directa",
    "content": "<p>La <strong>MLP</strong> transforma las características de cada token después de la atención. A diferencia de la autoatención, esta operación no mezcla directamente posiciones: aplica la misma red a cada posición.</p><p>En GPT-2 pequeño, la dimensión interna de la MLP aumenta de <strong>768 a 3072</strong> y luego vuelve a 768. Una función de activación introduce no linealidad.</p>"
  },
  "output-logit": {
    "title": "Logits de salida",
    "content": "<p>El modelo obtiene un <strong>logit</strong> (puntaje no normalizado) por token del vocabulario. En GPT-2 hay 50 257 posibles tokens de salida.</p><p>Un logit alto favorece un token, pero no es todavía una probabilidad. Para comparar tokens de manera probabilística se utiliza softmax; los resultados también dependen de la temperatura elegida.</p>"
  },
  "output-probabilities": {
    "title": "Probabilidades del siguiente token",
    "content": "<p>La función <strong>softmax</strong> convierte los logits en valores no negativos que suman 1. Así obtenemos una distribución de probabilidad sobre el vocabulario.</p><p>Una predicción más probable no es necesariamente la única respuesta posible. Observa la distribución antes de seleccionar el siguiente token.</p>"
  },
  "temperature": {
    "title": "Temperatura",
    "content": "<p>La <strong>temperatura</strong> modifica la distribución de probabilidad antes del muestreo. Se divide cada logit por T antes de aplicar softmax.</p><p>Una temperatura baja concentra la probabilidad en unos pocos tokens; una alta la distribuye más ampliamente. No cambia los pesos de la red: cambia cómo se interpretan los logits de salida.</p><p><strong>Explora:</strong> cambia T y observa si el orden relativo de los logits cambia (no debería) y cómo cambian las probabilidades.</p>"
  },
  "sampling": {
    "title": "Estrategias de muestreo",
    "content": "<p>El <strong>muestreo</strong> decide qué token escoger a partir de una distribución de probabilidades. No es lo mismo que calcular esa distribución.</p><p><strong>Top-k</strong> restringe los candidatos a los k tokens con mayor probabilidad. <strong>Top-p</strong> conserva un conjunto de tokens cuya probabilidad acumulada alcanza un umbral p. Después se normaliza y se elige dentro del conjunto permitido.</p><p><strong>Explora:</strong> compara k pequeño con p alto y observa cuántos candidatos quedan.</p>"
  },
  "residual": {
    "title": "Conexiones residuales",
    "content": "<p>Una <strong>conexión residual</strong> suma la entrada de una subcapa a su salida transformada. Permite que la información fluya entre bloques y facilita la optimización de redes profundas.</p><p>La suma requiere dimensiones compatibles. No significa que la red copie sin modificar su entrada: la subcapa aprende una corrección.</p>"
  },
  "layer-normalization": {
    "title": "Normalización de capa",
    "content": "<p>La <strong>normalización de capa</strong> estandariza una representación utilizando estadísticas de sus características y luego aplica parámetros aprendidos de escala y desplazamiento.</p><p>Ayuda a controlar las magnitudes internas del modelo. GPT-2 utiliza una disposición de normalización previa a las subcapas (pre-LN); otras arquitecturas pueden usar otra posición.</p>"
  },
  "dropout": {
    "title": "Dropout",
    "content": "<p><strong>Dropout</strong> es una técnica de regularización que desactiva aleatoriamente algunas activaciones durante el entrenamiento, para reducir la dependencia de unidades específicas.</p><p>En la <strong>inferencia</strong> habitual, dropout está desactivado. Por eso no debe interpretarse como una fuente de aleatoriedad en la generación; esa variabilidad proviene del muestreo.</p>"
  }
};
