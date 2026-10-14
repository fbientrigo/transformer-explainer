import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/utils/array.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
});
const { reshapeArray } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

test('reshapeArray preserves singleton attention matrices and regular rows', () => {
	assert.deepEqual(reshapeArray([7], [1, 1, 1]), [[7]]);
	assert.deepEqual(reshapeArray([1, 2, 3, 4], [1, 2, 2]), [[1, 2], [3, 4]]);
});

test('reshapeArray rejects invalid dimensions and mismatched data sizes', () => {
	assert.throws(() => reshapeArray([1, 2, 3], [1, 2, 2]), /dimensions do not match/);
	assert.throws(() => reshapeArray([], [1, 0, 2]), /dimensions do not match/);
});
