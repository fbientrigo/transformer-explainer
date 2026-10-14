<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { vectorHeight } from '~/store';

	const { theme } = resolveConfig(tailwindConfig);

	let visibleDimension = Math.floor($vectorHeight * 3.5) * 4;
	export let active: boolean = false;
	export let data: number[] = new Array(visibleDimension).fill(0).map((d) => Math.random());
	export let colorScale: string | ((t: number, i: number) => string) | undefined = undefined;

	let canvas: HTMLCanvasElement;

	const lineHeight = 1;

	$: colorKey =
		typeof colorScale === 'string' && colorScale in theme.colors
			? (colorScale as keyof typeof theme.colors)
			: 'gray';
	$: color =
		typeof colorScale === 'function'
			? colorScale
			: d3.interpolate(theme.colors[colorKey][100], theme.colors[colorKey][400]);

	function drawCanvas(colorForValue: (value: number, index: number) => string) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const parent = canvas.parentElement;
		if (!parent) return;
		const width = parent.clientWidth;
		const height = parent.clientHeight;

		ctx.clearRect(0, 0, width, height);

		let pixelRatio = 4;
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		for (let i = 0; i < height / lineHeight; i++) {
			const value = data[i];
			ctx.fillStyle = colorForValue(value, i);
			ctx.fillRect(0, i * lineHeight * pixelRatio, width * pixelRatio, lineHeight * pixelRatio);
		}
	}

	onMount(() => {
		const unsubscribe = vectorHeight.subscribe(() => drawCanvas(color));
		return () => {
			unsubscribe();
		};
	});

	$: if (data && canvas) {
		drawCanvas(color);
	}
</script>

<canvas class:active bind:this={canvas}></canvas>

<style lang="scss">
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
		transition: opacity 0.2s;

		&.active {
			opacity: 1;
		}

		&:hover {
			opacity: 1;
		}
	}
</style>
