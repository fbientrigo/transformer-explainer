import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import { ex0, ex1, ex2, ex3, ex4 } from '../src/constants/examples/index.js';

async function loadPureTypeScript(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022
  }});
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}

const { cachedTokenDecoder } = await loadPureTypeScript('../src/workshop/model/cachedTokenDecoder.ts');
const { temperatureSoftmax } = await loadPureTypeScript('../src/workshop/exercises/softmax.ts');

test('cached decoder reproduces real candidate text for all five GPT-2 snapshots', () => {
  for (const example of [ex0, ex1, ex2, ex3, ex4]) {
    const decoder = cachedTokenDecoder(example);
    assert.equal(example.probabilities.length, 50);
    for (const candidate of example.probabilities) {
      assert.equal(decoder.decode([candidate.tokenId]), candidate.token);
    }
    assert.throws(() => decoder.decode([]));
  }
});

test('temperature softmax is normalized, positive and temperature-sensitive', () => {
  for (const T of [0.3, 0.8, 1, 2, 3]) {
    const probabilities = temperatureSoftmax([2, 1, 0], T);
    assert.ok(probabilities.every((x) => x > 0 && x < 1));
    assert.ok(Math.abs(probabilities.reduce((a,b) => a+b,0) - 1) < 1e-12);
    assert.ok(probabilities[0] > probabilities[1] && probabilities[1] > probabilities[2]);
  }
  const sharp = temperatureSoftmax([2, 1, 0], 0.3);
  const flat = temperatureSoftmax([2, 1, 0], 3);
  assert.ok(sharp[0] > flat[0]);
  assert.throws(() => temperatureSoftmax([2,1,0], 0));
  assert.throws(() => temperatureSoftmax([2,Infinity,0], 1));
});
