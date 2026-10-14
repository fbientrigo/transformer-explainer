<script lang="ts">
  import type { ModelSnapshot } from '~/workshop/model/contract';
  import { openLocalSnapshot } from '~/workshop/model/snapshotAdapters';
  import { language } from '~/workshop/i18n';
  import { temperatureSoftmax } from '~/workshop/exercises/softmax';

  export let onClose: () => void;
  let snapshot: ModelSnapshot | null = null;
  let error = '';
  let layer = 0;
  let head = 0;
  let temperature = 1;

  $: attention = snapshot?.layers[layer]?.attention[head] ?? [];
  $: candidates = snapshot?.output.candidates ?? [];
  $: probabilities = candidates.length ? temperatureSoftmax(candidates.map((c) => c.logit), Number(temperature)) : [];
  $: copy = $language === 'es' ? {
    heading: 'Explorar modelo propio', explain: 'Abre un snapshot JSON exportado desde tu PC. Se visualizan tensores reales del archivo, sin ejecutar código externo ni descargar modelos.',
    input: 'Cargar snapshot (.json)', empty: 'Sin snapshot. Genera uno con tools/tiny_model.py o exporta el contrato v1 desde tu modelo.',
    name: 'Modelo', origin: 'Origen', params: 'Parámetros', architecture: 'Arquitectura', tokens: 'Tokens', layer: 'Capa', head: 'Cabeza', attention: 'Atención causal', legend: 'Cada celda: cuánto atiende un token (fila) a otro token (columna).', output: 'Siguiente token', example: 'Token elegido', training: 'Entrenamiento', loss: 'Pérdida inicial → final', candidate: 'Candidatos exportados', approximate: 'Probabilidades relativas SOLO entre los candidatos exportados, no sobre el vocabulario completo.', close: 'Cerrar'
  } : {
    heading: 'Explore your model', explain: 'Open a JSON snapshot exported by your computer. Displays real tensors from the file; no external code execution or model download.',
    input: 'Load snapshot (.json)', empty: 'No snapshot. Generate one with tools/tiny_model.py or export contract v1 from another model.',
    name: 'Model', origin: 'Source', params: 'Parameters', architecture: 'Architecture', tokens: 'Tokens', layer: 'Layer', head: 'Head', attention: 'Causal attention', legend: 'Each cell: how much a query token (row) attends to a key token (column).', output: 'Next token', example: 'Selected token', training: 'Training', loss: 'First → last loss', candidate: 'Exported candidates', approximate: 'Relative probabilities ONLY among exported candidates, not the full vocabulary.', close: 'Close'
  };

  async function chooseFile(event: Event) {
    const field = event.currentTarget as HTMLInputElement;
    const file = field.files?.[0];
    if (!file) return;
    error = '';
    try {
      const next = await openLocalSnapshot(file);
      snapshot = next;
      layer = 0; head = 0; temperature = 1;
    } catch (reason) {
      snapshot = null;
      error = reason instanceof Error ? reason.message : String(reason);
    }
    // Re-selecting an identical file should still work after an external edit.
    field.value = '';
  }
</script>

<div class="snapshot-panel" role="dialog" aria-modal="false" aria-label={copy.heading} tabindex="-1" data-model-inspector>
  <div class="panel-header">
    <h2>{copy.heading}</h2>
    <button type="button" on:click={onClose} aria-label={copy.close}>×</button>
  </div>
  <p class="subtitle">{copy.explain}</p>
  <label class="upload">{copy.input}
    <input type="file" accept=".json,application/json" on:change={chooseFile} aria-label={copy.input}/>
  </label>
  {#if error}<p class="error" role="alert">{error}</p>{/if}
  {#if !snapshot}
    <p class="empty">{copy.empty}</p>
  {:else}
    <div class="summary">
      <div><small>{copy.name}</small><strong>{snapshot.model.id}</strong></div>
      <div><small>{copy.origin}</small><strong>{snapshot.model.source}</strong></div>
      <div><small>{copy.params}</small><strong>{snapshot.model.parameterCount.toLocaleString($language)}</strong></div>
    </div>
    <p class="subtitle">{copy.architecture}: {snapshot.model.architecture} · {snapshot.model.layers} × {snapshot.model.heads} · d={snapshot.model.embeddingDim}</p>
    <h3>{copy.tokens}</h3>
    <div class="tokens">
      {#each snapshot.input.tokens as token, i}
        <span title={'#' + snapshot.input.tokenIds[i]}>{token === ' ' ? '␠' : token}</span>
      {/each}
    </div>
    <div class="selectors">
      <label>{copy.layer}
        <select bind:value={layer}>
          {#each snapshot.layers as entry}
            <option value={entry.index}>{entry.index + 1}</option>
          {/each}
        </select>
      </label>
      <label>{copy.head}
        <select bind:value={head}>
          {#each Array(snapshot.model.heads) as _, i}
            <option value={i}>{i + 1}</option>
          {/each}
        </select>
      </label>
    </div>
    <h3>{copy.attention}</h3>
    <div class="matrix-scroll">
      <div class="matrix" style:grid-template-columns={'repeat(' + attention.length + ', minmax(13px, 1fr))'}>
        {#each attention as row, q}
          {#each row as value, k}
            <div class="weight" title={'Q' + (q+1) + ' → K' + (k+1) + ': ' + value.toFixed(4)}
              style:background-color={'rgba(37, 99, 235, ' + Math.max(.035, value) + ')'}
              aria-label={'Q' + (q + 1) + ' K' + (k + 1) + ': ' + value.toFixed(3)}></div>
          {/each}
        {/each}
      </div>
    </div>
    <p class="note">{copy.legend}</p>
    <h3>{copy.output}: <strong>{snapshot.output.selectedToken === ' ' ? '␠' : snapshot.output.selectedToken}</strong></h3>
    <label class="temperature">T: {Number(temperature).toFixed(1)}
      <input type="range" min="0.3" max="3" step="0.1" bind:value={temperature}/>
    </label>
    <p class="note">{copy.approximate}</p>
    <div class="candidate-list">
      {#each candidates as candidate, i}
        <div class="candidate">
          <span>{candidate.token === ' ' ? '␠' : candidate.token}</span>
          <div class="track"><div class="fill" style:width={(100 * probabilities[i]).toFixed(1) + '%'}></div></div>
          <output>{(100 * probabilities[i]).toFixed(1)}%</output>
        </div>
      {/each}
    </div>
    {#if snapshot.training?.losses.length}
      <h3>{copy.training}</h3>
      <p>{copy.loss}: {snapshot.training.losses[0].loss.toFixed(3)} → {snapshot.training.losses[snapshot.training.losses.length - 1].loss.toFixed(3)} ({snapshot.training.device})</p>
    {/if}
  {/if}
</div>

<style>
  .snapshot-panel { position:fixed;right:1rem;top:1rem;z-index:10002; width:min(760px,calc(100vw - 2rem));max-height:calc(100vh - 7rem);overflow:auto;overscroll-behavior:contain;padding:1.1rem 1.3rem;background:#fff;color:#0f172a;border-radius:.85rem;border:1px solid #cbd5e1;box-shadow:0 12px 45px #0f172a38;font-family:system-ui,sans-serif;text-align:left }
  .panel-header{display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .panel-header h2{font-weight:750;font-size:1.3rem;margin:0}
  button{background:#f1f5f9;color:#0f172a;border-radius:.4rem;padding:.2rem .65rem;cursor:pointer}
  button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
  .subtitle,.note{font-size:.85rem;color:#475569;line-height:1.5;margin:.45rem 0 .8rem}
  .upload{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;font-weight:650;font-size:.87rem;margin:.8rem 0}
  .upload input{max-width:100%;font-size:.82rem}
  .error{color:#9f1239}.empty{background:#f8fafc;padding:1rem;border-radius:.5rem;color:#475569;font-size:.86rem}
  .summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}
  .summary>div{background:#f8fafc;padding:.6rem;border-radius:.4rem;min-width:0}
  .summary small{display:block;color:#64748b}
  .summary strong{display:block;overflow-wrap:anywhere;font-size:.86rem}
  h3{font-size:1rem;font-weight:700;margin:1rem 0 .45rem}
  .tokens{display:flex;flex-wrap:wrap;gap:.2rem}
  .tokens span{font-family:monospace;padding:.15rem .3rem;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:.3rem}
  .selectors{display:flex;gap:1rem;margin-top:.7rem}
  .selectors label{display:flex;gap:.4rem;align-items:center}
  select{border:1px solid #cbd5e1;border-radius:.3rem;padding:.2rem .5rem}
  .matrix-scroll{overflow:auto;padding:.2rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:.35rem}
  .matrix{display:grid;gap:1px;min-width:max-content;width:100%}
  .weight{aspect-ratio:1;min-width:13px;min-height:13px;border:1px solid #fff}
  .temperature{display:flex;gap:.7rem;align-items:center}
  .temperature input{flex:1}
  .candidate-list{display:grid;gap:.3rem}
  .candidate{display:grid;grid-template-columns:minmax(35px,5rem) 1fr 3.3rem;gap:.6rem;align-items:center;font-size:.82rem}
  .track{height:.7rem;background:#f1f5f9;border-radius:.3rem;overflow:hidden}
  .fill{height:100%;background:#64748b}
  output{text-align:right;font-variant-numeric:tabular-nums}
  @media(max-width:600px){.summary{grid-template-columns:1fr}.snapshot-panel{padding:.7rem;top:.5rem;right:.5rem;max-height:calc(100vh - 6rem)}}
</style>
