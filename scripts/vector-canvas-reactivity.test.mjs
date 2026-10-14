import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { compile } from 'svelte/compiler';

const source = await readFile(
	new URL('../src/components/common/VectorCanvas.svelte', import.meta.url),
	'utf8'
);
const { js } = compile(source, {
	filename: 'src/components/common/VectorCanvas.svelte',
	generate: 'client'
});

test('VectorCanvas redraws with the current color-scale dependency', () => {
	assert.ok(js.code.includes('drawCanvas($.get(color))'));
	assert.ok(js.code.includes('$.deep_read_state(data()), $.get(canvas), $.get(color)'));
});
