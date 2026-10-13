import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

function transpile(path) {
  return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module:ts.ModuleKind.ESNext, target:ts.ScriptTarget.ES2022 }
  }).outputText;
}
const toUri = (text) => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const contract = toUri(transpile('../src/workshop/model/contract.ts'));
const parserModule = transpile('../src/workshop/model/parseSnapshot.ts')
  .replace(/from ['"]\.\/contract['"]/, `from '${contract}'`);
const { parseSnapshot } = await import(toUri(parserModule));

function sample() {
  return { schema:'workshop.snapshot.v1',
    model:{id:'local-ci',architecture:'decoder-transformer',source:'test-only',tokenizer:'character',
      layers:1,heads:1,embeddingDim:32,parameterCount:1000},
    input:{tokens:['a','b','c'],tokenIds:[0,1,2]},
    layers:[{index:0,attention:[[[1,0,0],[.5,.5,0],[.25,.25,.5]]]}],
    output:{candidates:[{token:'a',logit:2},{token:'b',logit:1}],selectedToken:'a'},
    training:{steps:1,losses:[{step:1,loss:1.2}],device:'cpu'} };
}
test('accepts a valid explicitly labeled test snapshot', () => {
  const obj = sample(); assert.equal(parseSnapshot(JSON.stringify(obj)).model.id, 'local-ci');
});
test('rejects oversized, malformed, noncausal and inconsistent snapshots', () => {
  assert.throws(() => parseSnapshot('not JSON'));
  assert.throws(() => parseSnapshot(' '.repeat(4*1024*1024+1)));
  const bad = sample();bad.layers[0].attention[0][0][1]=.1;
  assert.throws(() => parseSnapshot(JSON.stringify(bad)));
  const badCount = sample();badCount.model.layers=2;
  assert.throws(() => parseSnapshot(JSON.stringify(badCount)));
  const nan = sample();nan.output.candidates[0].logit='NaN';
  assert.throws(() => parseSnapshot(JSON.stringify(nan)));
  const unsafe = sample();unsafe.model.id='<script>alert(1)</script>'; // escaped by Svelte, not evaluated
  assert.equal(parseSnapshot(JSON.stringify(unsafe)).model.id,unsafe.model.id);
});
