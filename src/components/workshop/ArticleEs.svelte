<script lang="ts">
  // Spanish classroom adaptation; the upstream article remains available in English.
</script>

<article class="article-es" lang="es">
  <header class="intro">
    <p class="eyebrow">Guía visual · Workshop de IA</p>
    <h1>¿Qué ocurre dentro de un Transformer?</h1>
    <p>Una explicación paso a paso de cómo GPT-2 convierte texto en una predicción del siguiente token. Puedes comenzar con ejemplos precalculados sin descargar los pesos del modelo.</p>
  </header>

  <section id="intro-transformer">
    <h2>1. ¿Qué es un Transformer?</h2>
    <p>Un Transformer es una arquitectura de redes neuronales presentada en el trabajo <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer">Attention Is All You Need</a> (2017). Utiliza mecanismos de atención para relacionar elementos de una secuencia. Distintos modelos emplean variantes de esta arquitectura para tareas de lenguaje, imágenes y otras modalidades.</p>
    <p>En esta herramienta utilizamos <strong>GPT-2 pequeño</strong>, un modelo autoregresivo con aproximadamente 124 millones de parámetros y un vocabulario de 50 257 tokens. No es un modelo moderno de frontera: su arquitectura es suficientemente clara para estudiar los fundamentos.</p>
  </section>

  <section id="ruta-token">
    <h2>2. El recorrido de un token</h2>
    <ol class="path">
      <li><strong>Tokenización.</strong> El texto se fragmenta en tokens y se convierte en identificadores enteros.</li>
      <li><strong>Embeddings.</strong> Cada token se representa con un vector de 768 números; se incorpora información posicional.</li>
      <li><strong>Bloques Transformer.</strong> Doce bloques utilizan autoatención causal, MLP, normalización y conexiones residuales.</li>
      <li><strong>Logits.</strong> La representación final se proyecta a un puntaje por cada token del vocabulario.</li>
      <li><strong>Probabilidades.</strong> Softmax y las estrategias de muestreo permiten elegir el siguiente token.</li>
    </ol>
  </section>

  <section id="atencion">
    <h2>3. Cómo funciona la atención</h2>
    <p>De las representaciones de los tokens se calculan <strong>Query (Q)</strong>, <strong>Key (K)</strong> y <strong>Value (V)</strong>. Los productos entre Q y K calculan puntajes de afinidad. Luego se escalan, se aplica una máscara causal y se normalizan con softmax. Los pesos obtenidos combinan los vectores V.</p>
    <p>La <strong>máscara causal</strong> evita que un token utilice información de posiciones futuras. GPT-2 pequeño utiliza 12 cabezas por bloque: cada cabeza puede aprender patrones distintos, pero todas colaboran dentro del mismo modelo.</p>
    <p>Las matrices que ves al explorar un ejemplo describen una ejecución concreta. Los colores o pesos de atención no equivalen por sí solos a una explicación causal de lo que el modelo «piensa».</p>
  </section>

  <section id="mlp">
    <h2>4. Qué aporta la MLP</h2>
    <p>La atención combina información entre posiciones. La red <strong>MLP</strong> transforma las características de cada posición por separado. En GPT-2 pequeño expande temporalmente de 768 a 3072 dimensiones y vuelve a 768.</p>
    <p>Las conexiones residuales permiten sumar representaciones compatibles y la normalización ayuda a estabilizar el procesamiento. Estos elementos son importantes tanto para la arquitectura como para el entrenamiento, aunque aquí estamos observando <strong>inferencia</strong>.</p>
  </section>

  <section id="probabilidades">
    <h2>5. De logits a texto</h2>
    <p>El modelo produce un puntaje llamado <strong>logit</strong> por cada token posible. La función softmax convierte esos puntajes en una distribución de probabilidades cuya suma es uno.</p>
    <p>La <strong>temperatura</strong> modifica cuánto se concentra la distribución; <strong>top-k</strong> limita los candidatos a los k más probables y <strong>top-p</strong> conserva los tokens cuya probabilidad acumulada alcanza un umbral. Ninguno de estos controles entrena ni modifica los pesos del modelo.</p>
    <div class="exercise">
      <strong>Actividad breve</strong>
      <p>Elige uno de los ejemplos de la barra superior. Observa qué ocurre al aumentar la temperatura y compara top-k con top-p. Formula una hipótesis antes de mover cada control. ¿Cambia la distribución o cambian los pesos entrenados?</p>
    </div>
  </section>

  <section id="dos-modos">
    <h2>6. Demostración frente a inferencia real</h2>
    <p><strong>Modo demostración:</strong> muestra ejecuciones previamente calculadas para los ejemplos originales en inglés. Es la opción adecuada para comenzar una clase sin transferir cientos de megabytes.</p>
    <p><strong>GPT-2 activado:</strong> descarga los pesos ONNX y permite ingresar un texto propio. La descarga inicial ronda los 657 MB y el funcionamiento depende de la memoria y las capacidades del navegador. Traducir la interfaz al español no convierte el tokenizador ni el modelo GPT-2 en un modelo entrenado en español.</p>
  </section>

  <footer>
    <p>Adaptación educativa en español a partir de <a href="https://github.com/poloclub/transformer-explainer" target="_blank" rel="noopener noreferrer">Transformer Explainer</a>, del Polo Club of Data Science. Consulta la <a href="https://dl.acm.org/doi/10.1145/3772318.3791725" target="_blank" rel="noopener noreferrer">publicación original</a> y la licencia MIT conservada en este fork.</p>
  </footer>
</article>

<style>
  .article-es { max-width: 970px; margin: 0 auto; padding: 2rem clamp(1rem, 4vw, 3rem) 6rem; font-family: system-ui, sans-serif; color: #1e293b; line-height: 1.75; font-size: 1.04rem; }
  .intro { margin-bottom: 2.6rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
  .eyebrow { font-size: .84rem; font-weight: 700; color: #475569; letter-spacing: .04em; text-transform: uppercase; }
  h1 { font-size: clamp(1.7rem, 3.5vw, 2.6rem); font-weight: 750; letter-spacing: -.025em; line-height: 1.2; margin: .4rem 0 1rem; }
  h2 { font-size: clamp(1.3rem, 2.5vw, 1.75rem); font-weight: 690; margin: 2.6rem 0 1rem; }
  p { margin: .8rem 0; }
  a { color: #334f9b; text-decoration: underline; text-underline-offset: .15em; }
  a:focus-visible { outline: 2px solid #2563eb; }
  .path { padding-left: 1.5rem; }
  .path li { margin: .7rem 0; }
  .exercise { padding: 1rem 1.25rem; margin: 1.5rem 0; border-left: 3px solid #64748b; background: #f8fafc; border-radius: .3rem; }
  .exercise p { margin-bottom: 0; }
  footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: .9rem; }
</style>
