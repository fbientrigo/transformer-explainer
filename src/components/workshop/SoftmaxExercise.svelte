<script lang="ts">
  import { language } from '~/workshop/i18n';
  import { temperatureSoftmax } from '~/workshop/exercises/softmax';
  const logits = [2, 1, 0];
  const labels = ['A', 'B', 'C'];
  let temperature = 1;
  let answer: string | null = null;
  $: probabilities = temperatureSoftmax(logits, Number(temperature));
  $: copy = $language === 'es'
    ? { title: 'Experimento · Softmax', desc:'Ejemplo numérico ilustrativo (no es una salida de GPT-2).', temp:'Temperatura', question:'¿Mover la temperatura modifica los pesos entrenados?', yes:'Sí', no:'No', good:'Correcto: cambian las probabilidades, no los parámetros.', bad:'No: T modifica softmax; los parámetros siguen iguales.' }
    : { title: 'Experiment · Softmax', desc:'Illustrative numbers (not GPT-2 output).', temp:'Temperature', question:'Does changing temperature update trained weights?', yes:'Yes', no:'No', good:'Correct: probabilities change, not parameters.', bad:'No: T changes softmax; trained weights stay the same.' };
</script>
<div class="exercise" aria-label={copy.title}>
  <strong>{copy.title}</strong>
  <p>{copy.desc}</p>
  <label>{copy.temp}: <output>{Number(temperature).toFixed(1)}</output>
    <input type="range" min="0.3" max="3" step="0.1" bind:value={temperature} aria-label={copy.temp}/>
  </label>
  <div class="bars" aria-label="Softmax probabilities">
    {#each probabilities as probability, index}
      <div class="bar-row">
        <span>{labels[index]}</span>
        <div class="track"><div class="fill" style:width={Math.round(probability*100)+'%'}></div></div>
        <output>{(probability*100).toFixed(1)}%</output>
      </div>
    {/each}
  </div>
  <div class="quiz">
    <span>{copy.question}</span>
    <div class="answers">
      <button type="button" aria-pressed={answer === 'yes'} on:click={() => answer = 'yes'}>{copy.yes}</button>
      <button type="button" aria-pressed={answer === 'no'} on:click={() => answer = 'no'}>{copy.no}</button>
    </div>
    {#if answer !== null}<p role="status">{answer === 'no' ? copy.good : copy.bad}</p>{/if}
  </div>
</div>
<style>
.exercise{margin-top:.6rem;padding-top:.55rem;border-top:1px solid #e2e8f0}
.exercise>strong{font-size:.95rem}.exercise p{font-size:.78rem;margin:.1rem 0 .3rem}
label{display:flex;align-items:center;gap:.65rem;font-size:.82rem}
input[type=range]{flex:1;min-width:40px;accent-color:#475569}
.bars{display:grid;gap:.15rem;margin:.3rem 0}
.bar-row{display:grid;grid-template-columns:1.2rem minmax(30px,1fr) 3.5rem;align-items:center;gap:.45rem;font-size:.76rem}
.track{width:100%;background:#f1f5f9;border-radius:3px;height:.65rem;overflow:hidden}
.fill{height:100%;background:#64748b;border-radius:3px;transition:width .15s}
output{font-variant-numeric:tabular-nums;text-align:right}
.quiz{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem .8rem;font-size:.78rem;margin-top:.35rem}
.answers{display:flex;gap:.3rem}.answers button{padding:.2rem .5rem;background:#e2e8f0;border-radius:.35rem}
button[aria-pressed=true]{outline:2px solid #334155}.quiz>p{width:100%;margin:0;color:#334155}
@media(prefers-reduced-motion:reduce){.fill{transition:none}}
</style>