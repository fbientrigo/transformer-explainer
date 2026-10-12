import { derived, writable } from 'svelte/store';
export type Language = 'es' | 'en';
export const language = writable<Language>('es');
export const messages = {
  es: { brand: 'Explorador Transformer', examples: 'Ejemplos', placeholder: 'Escribe un texto para explorar', generate: 'Generar', temperature: 'Temperatura', sampling: 'Muestreo', mobileHint: 'Explora los ejemplos. Para escribir textos propios, usa un computador.', demoHint: 'Demostración: explora ejemplos sin descargar GPT-2.', downloading: 'Descargando GPT-2 (~657 MB).', wordLimit: 'Puedes ingresar hasta', words: 'palabras', present: 'Presentar', explore: 'Explorar', loadModel: 'Activar GPT-2 (~657 MB)', modelReady: 'GPT-2 disponible', loadingShort: 'Cargando GPT-2…', previous: 'Anterior', next: 'Siguiente', slide: 'Diapositiva', modelError: 'No fue posible cargar GPT-2', retry: 'Reintentar' },
  en: { brand: 'Transformer Explorer', examples: 'Examples', placeholder: 'Enter text to explore', generate: 'Generate', temperature: 'Temperature', sampling: 'Sampling', mobileHint: 'Explore examples. Use a desktop for custom inputs.', demoHint: 'Demo: explore examples without downloading GPT-2.', downloading: 'Downloading GPT-2 (~657 MB).', wordLimit: 'Enter up to', words: 'words', present: 'Present', explore: 'Explore', loadModel: 'Enable GPT-2 (~657 MB)', modelReady: 'GPT-2 ready', loadingShort: 'Loading GPT-2…', previous: 'Previous', next: 'Next', slide: 'Slide', modelError: 'Unable to load GPT-2', retry: 'Retry' }
} as const;
export const ui = derived(language, ($language) => messages[$language]);
