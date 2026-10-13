<script lang="ts">
  import { isTextbookOpen, modelSession, isMobile } from '~/store';
  import { language, ui } from '~/workshop/i18n';
  import { slides } from '~/workshop/lesson/slides';
  import SoftmaxExercise from './SoftmaxExercise.svelte';
  import { presentationMode, presentationStep, requestModelLoad, modelLoadError } from '~/workshop/state';

  let isFullscreen = false;
  $: slide = slides[$presentationStep];

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }

  function togglePresentation() {
    if (!$presentationMode) { presentationStep.set(0); isTextbookOpen.set(false); }
    if ($presentationMode && document.fullscreenElement) void document.exitFullscreen();
    presentationMode.update((on) => !on);
  }
  function move(delta: number) { presentationStep.update((n) => Math.max(0, Math.min(slides.length-1, n+delta))); }
  function toggleLanguage() { const next = $language === 'es' ? 'en' : 'es'; language.set(next); document.documentElement.lang = next; }
  function keydown(event: KeyboardEvent) {
    if (!$presentationMode) return;
    const el = event.target;
    if (el instanceof HTMLElement && (el.isContentEditable || ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(el.tagName))) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'Escape') presentationMode.set(false);
  }
</script>

<svelte:window on:keydown={keydown} on:fullscreenchange={() => isFullscreen = !!document.fullscreenElement} />
<div class="workshop-ui">
  {#if $presentationMode}
    <section class="workshop-slide" aria-live="polite" aria-label={$ui.slide}>
      <small>{$ui.slide} {$presentationStep+1} / {slides.length}</small>
      <strong>{slide.title[$language]}</strong>
      <p>{slide.body[$language]}</p>
      {#if slide.id === 'sampling'}
        <SoftmaxExercise />
      {/if}
      <nav aria-label={$ui.slide} class="workshop-nav">
        <button disabled={$presentationStep===0} on:click={() => move(-1)}>{$ui.previous}</button>
        <button disabled={$presentationStep===slides.length-1} on:click={() => move(1)}>{$ui.next} →</button>
      </nav>
    </section>
  {/if}
  <div class="workshop-controls" role="group" aria-label="Workshop">
    <button on:click={togglePresentation}>{$presentationMode ? $ui.explore : $ui.present}</button>
    <button on:click={toggleLanguage}>{$language === 'es' ? 'EN' : 'ES'}</button>
    {#if $presentationMode}
      <button on:click={toggleFullscreen} aria-pressed={isFullscreen}>{isFullscreen ? $ui.exitFullscreen : $ui.fullscreen}</button>
    {/if}
    {#if $modelSession}
      <span>{$ui.modelReady}</span>
    {:else if $requestModelLoad}
      <span>{$ui.loadingShort}</span>
    {:else if !$isMobile}
      <button on:click={() => { modelLoadError.set(null); requestModelLoad.set(true); }}>{$modelLoadError ? $ui.retry : $ui.loadModel}</button>
    {/if}
    {#if $modelLoadError}<span role="alert" class="workshop-error">{$ui.modelError}: {$modelLoadError}</span>{/if}
  </div>
</div>
<style>
  .workshop-ui {position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:10000;width:min(750px,calc(100vw - 2rem));font-family:system-ui,sans-serif}
  .workshop-controls {display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:center;width:fit-content;max-width:100%;margin:auto;padding:.5rem;border:1px solid #e2e8f0;border-radius:.8rem;background:#fffffff2;box-shadow:0 4px 18px #11182720}
  button {font-size:.86rem;padding:.45rem .75rem;border-radius:.45rem;background:#f1f5f9;color:#1f2937;cursor:pointer}
  button:hover:not(:disabled){background:#e0e7ff}
  button:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
  button:disabled{opacity:.4;cursor:not-allowed}
  .workshop-slide{margin-bottom:.6rem;padding:1rem 1.2rem;border:1px solid #cbd5e1;border-radius:.8rem;background:#fffffffa;color:#0f172a;box-shadow:0 8px 30px #0f172a20}
  .workshop-slide small{display:block;color:#64748b}
  .workshop-slide strong{display:block;font-size:1.15rem;margin:.2rem 0}
  .workshop-slide p{font-size:.9rem;line-height:1.4;color:#475569;margin:0}
  .workshop-nav{display:flex;justify-content:space-between;margin-top:.7rem}
  .workshop-error{font-size:.8rem;color:#9f1239}
</style>
