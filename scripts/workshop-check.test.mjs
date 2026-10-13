import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const original = read('../src/utils/textbookPages.ts');
const spanish = read('../src/workshop/lesson/book.es.ts');
const dictionary = read('../src/workshop/i18n.ts');

const ids = [...original.matchAll(/^\s*id:\s*'([^']+)',/gm)].map((match) => match[1]);
const match = spanish.match(/export const bookEs: Record<string, BookTranslation> = (\{[\s\S]*\});\s*$/);
if (!match) throw new Error('Spanish lesson map must remain a JSON-compatible literal');
const translations = JSON.parse(match[1]);

test('all original textbook pages have exactly one Spanish adaptation', () => {
  assert.equal(ids.length, 20, 'Upstream changed lesson count: review translations');
  assert.equal(new Set(ids).size, ids.length, 'Upstream IDs must be unique');
  assert.deepEqual(Object.keys(translations).sort(), [...ids].sort());
});

test('localized lesson titles and content are meaningful and static', () => {
  for (const [id, page] of Object.entries(translations)) {
    assert.ok(page.title?.length >= 5, `Missing title for ${id}`);
    assert.ok(page.content?.length >= 80, `Missing substantial description for ${id}`);
    assert.doesNotMatch(page.content, /<script|\son\w+=|javascript:/i);
  }
});

test('both UI languages are available without altering original examples', () => {
  assert.match(dictionary, /export type Language = 'es' \| 'en'/);
  assert.match(dictionary, /export const language = writable<Language>\('es'\)/);
  const store = read('../src/store/index.ts');
  assert.match(store, /'Data visualization empowers users to'/);
});

test('heavy ONNX loading remains explicit', () => {
  const page = read('../src/routes/+page.svelte');
  assert.match(page, /\$requestModelLoad/);
  assert.doesNotMatch(page, /if\s*\(!\$isMobile\)\s*\{\s*await fetchModel\(\)/);
});
