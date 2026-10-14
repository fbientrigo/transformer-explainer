<script lang="ts">
	import * as d3 from 'd3';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';

	const { theme } = resolveConfig(tailwindConfig);
	type MatrixCell = { cell: number | null; rowIndex: number; colIndex: number };

	export let data: (number | null)[][];
	export let cellHeight: number;
	export let cellWidth: number;
	export let rowGap: number = 2;
	export let colGap: number = 0;
	export let transpose: boolean = false;

	export let rowLen: number;
	export let dimension: number;

	export let groupBy: 'row' | 'col' = 'row';
	export let shape: 'circle' | 'rect' = 'rect';
	export let colorScale: string | ((t: number, i: number) => string | number) | undefined = undefined;

	export let onMouseOverCell: ((
		event: Event,
		data: MatrixCell,
		el?: SVGRectElement | d3.BaseType
	) => void) | undefined = undefined;
	export let onMouseOutCell: ((
		event: Event,
		data: MatrixCell,
		el?: SVGRectElement | d3.BaseType
	) => void) | undefined = undefined;
	export let onMouseOutSvg: ((
		event: Event,
		data: unknown,
		el?: SVGRectElement | d3.BaseType
	) => void) | undefined = undefined;
	export let showTooltip: (
		event: Event,
		data: number | null,
		el: SVGRectElement | d3.BaseType
	) => string | undefined = () => undefined;
	export let highlightRow: number | undefined = undefined;
	export let highlightCol: number | undefined = undefined;

	let svgEl: SVGSVGElement;

	$: svgWidth =
		groupBy === 'col'
			? rowLen * cellWidth + (rowLen - 1) * colGap
			: dimension * cellWidth + (dimension - 1) * colGap;
	$: svgHeight =
		groupBy === 'col'
			? dimension * cellHeight + (dimension - 1) * rowGap
			: rowLen * cellHeight + (rowLen - 1) * rowGap;

	const colorKey =
		typeof colorScale === 'string' && colorScale in theme.colors
			? (colorScale as keyof typeof theme.colors)
			: 'blue';
	const matrixColorScale =
		typeof colorScale === 'function'
			? colorScale
			: d3.interpolate('white', theme.colors[colorKey][400]);

	const drawMatrixSvg = () => {
		const svg = d3.select(svgEl);

		if (onSvgOut) svg.on('mouseleave', onSvgOut);

		let cells;

		if (groupBy === 'col') {
			let cols;
			cols = svg
				.selectAll('g.g-col')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `g-col g-col-${i} col-${i}`);
			cols.attr('transform', (d, i) => `translate(${i * cellWidth + i * colGap},0)`);

			if (shape === 'rect') {
				cells = cols
					.selectAll('rect.cell')
					.data((d, colIndex) => d.map((cell, rowIndex) => ({ cell, colIndex, rowIndex })))
					.join('rect')
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${i} col-${d.colIndex}`;
						const isLastRow = i === arr.length - 1;
						const isLastCol = d.colIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr('x', 0)
					.attr('y', (d, i) => i * cellHeight + i * rowGap)
					.attr('width', cellWidth)
					.attr('height', cellHeight)
					.attr('fill', function (d) {
						return d.cell === null ? theme.colors.gray[200] : matrixColorScale(d.cell, d.colIndex);
					})
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut);
			}
			if (shape === 'circle') {
				cells = cols
					.selectAll('circle.cell')
					.data((d, colIndex) => d.map((cell, rowIndex) => ({ cell, colIndex, rowIndex })))
					.join('circle')
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${i} col-${d.colIndex}`;
						const isLastRow = i === arr.length - 1;
						const isLastCol = d.colIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr('cx', 0)
					.attr('cy', (d, i) => i * cellHeight + i * rowGap)
					.attr('r', cellWidth / 2)
					.attr('stroke', theme.colors.gray[500])
					.attr('fill', function (d, i) {
						return d.cell === null ? theme.colors.gray[200] : matrixColorScale(d.cell, i);
					})
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut);
			}
		}

		if (groupBy === 'row') {
			let rows;

			rows = svg
				.selectAll('g.g-row')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `g-row g-row-${i} row-${i}`);

			if (shape === 'rect') {
				rows.attr('transform', (d, i) =>
					transpose
						? `translate(${i * cellHeight + i * rowGap},0)`
						: `translate(0,${i * cellHeight + i * rowGap})`
				);

				cells = rows
					.selectAll('rect.cell')
					.data((d, rowIndex) => d.map((cell, colIndex) => ({ cell, rowIndex, colIndex })))
					.join('rect')
					.attr('class', (d, i) => `cell row-${d.rowIndex} col-${i}`)
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${d.rowIndex} col-${i}`;
						const isLastCol = i === arr.length - 1;
						const isLastRow = d.rowIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth + i * colGap)
					.attr(transpose ? 'x' : 'y', 0)
					.attr('width', transpose ? cellHeight : cellWidth)
					.attr('height', transpose ? cellWidth : cellHeight)
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut)
					.attr('fill', function (d, i) {
						if (d.cell === null || !Number.isFinite(d.cell)) return theme.colors.gray[200];
						return matrixColorScale(d.cell, i);
					});
			}
			if (shape === 'circle') {
				rows.attr('transform', (d, i) =>
					transpose
						? `translate(${cellHeight / 2 + i * cellHeight + i * rowGap},0)`
						: `translate(0,${cellHeight / 2 + i * cellHeight + i * rowGap})`
				);

				//To prevent the issue where the qkv path target position is misaligned due to circle scaling in Firefox
				rows
					.selectAll('rect.cell')
					.data((d) => d)
					.join('rect')
					.attr('class', 'cell')
					.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth + i * colGap)
					.attr(transpose ? 'x' : 'y', (-1 * cellHeight) / 2)
					.attr('width', transpose ? cellHeight : cellWidth)
					.attr('height', transpose ? cellWidth : cellHeight)
					.attr('fill', 'rgba(0,0,0,0)');
				//

				cells = rows
					.selectAll('circle.cell')
					.data((d, rowIndex) => d.map((cell, colIndex) => ({ cell, rowIndex, colIndex })))
					.join('circle')
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${d.rowIndex} col-${i}`;
						const isLastCol = i === arr.length - 1;
						const isLastRow = d.rowIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr(transpose ? 'cy' : 'cx', (d, i) => cellWidth / 2 + i * cellWidth + i * colGap)
					.attr(transpose ? 'cx' : 'cy', 0)
					.attr('r', cellWidth / 2)
					.attr('stroke', (d) => (!Number.isFinite(d.cell) ? 'none' : theme.colors.gray[200]))
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut)
					.transition()
					.duration(100)
					.attr('fill', function (d, i) {
						if (d.cell === null || !Number.isFinite(d.cell)) return theme.colors.gray[200];
						return matrixColorScale(d.cell, i);
					});
			}
		}
	};

	$: if (data && svgEl) {
		drawMatrixSvg();
	}

	// highlighting
	let animationFrame: number;
	$: {
		cancelAnimationFrame(animationFrame);
		animationFrame = requestAnimationFrame(() => {
			d3.select<SVGSVGElement, unknown>(svgEl)
				.selectAll<SVGElement, MatrixCell>(shape)
				.attr('class', function (d) {
					const rowIdx = d.rowIndex;
					const colIdx = d.colIndex;

					let classname;

					if (highlightRow !== undefined && highlightCol !== undefined) {
						classname =
							rowIdx === highlightRow && colIdx === highlightCol ? 'cell highlight' : 'cell dim';
					} else if (highlightRow === undefined && highlightCol === undefined) {
						classname = 'cell';
					} else if (highlightRow !== undefined) {
						classname = rowIdx === highlightRow ? 'cell highlight' : 'cell dim';
					} else if (highlightCol !== undefined) {
						classname = colIdx === highlightCol ? 'cell highlight' : 'cell dim';
					}
					return classname ?? 'cell';
				});
		});
	}

	// tooltip
	let tooltipData: string | { component: import('svelte').ComponentType; props?: Record<string, unknown> } | null = null;
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;

	function onCellOver(this: d3.BaseType, e: Event, d: MatrixCell) {
		const el = this;
		onMouseOverCell?.(e, d, el);

		const tooltipData = showTooltip?.(e, d.cell, el);
		if (tooltipData) visibleTooltip(e, tooltipData);
	}

	function onCellOut(this: d3.BaseType, e: Event, d: MatrixCell) {
		const el = this;
		onMouseOutCell?.(e, d, el);
		hideTooltip();
	}

	function onSvgOut(e: Event, d: unknown) {
		onMouseOutSvg?.(e, d);
		hideTooltip();
	}

	function visibleTooltip(event: Event, data: string | { component: import('svelte').ComponentType; props?: Record<string, unknown> }) {
		tooltipData = data;
		tooltipVisible = true;

		const parentBbox = svgEl.getBoundingClientRect();
		if (!(event.target instanceof Element)) return;
		const bbox = event.target.getBoundingClientRect();

		tooltipX = bbox.left + bbox.width / 2 - parentBbox.left;
		tooltipY = bbox.top - parentBbox.top - 10;
	}

	function hideTooltip() {
		tooltipVisible = false;
	}
</script>

<div class="relative">
	<svg
		class="matrix-svg relative"
		bind:this={svgEl}
		width={transpose ? svgHeight : svgWidth}
		height={transpose ? svgWidth : svgHeight}
	>
	</svg>
	{#if tooltipVisible}
		<div
			class="matrix-tooltip divide-gray-200 border border-gray-200 bg-white text-gray-500 shadow-md"
			style="left: {tooltipX}px; top: {tooltipY}px;"
		>
			{#if typeof tooltipData === 'string'}
				{tooltipData}
			{:else if tooltipData}
				<svelte:component this={tooltipData.component} {...tooltipData?.props} />
			{/if}
			<div
				class="arrow pointer-events-none absolute block h-[10px] w-[10px] rotate-45 border-b border-e border-inherit bg-inherit"
			></div>
		</div>
	{/if}
</div>

<style lang="scss">
	:global(.cell-text) {
		font-size: 0.6rem;
		font-family: monospace;
		text-anchor: middle;
	}

	:global(.matrix-svg .cell) {
		opacity: 1;
	}
	:global(.matrix-svg .cell.highlight) {
		opacity: 1;
	}
	:global(.matrix-svg .cell.dim) {
		opacity: 0.1 !important;
	}

	.matrix-tooltip {
		position: absolute;
		padding: 0.5rem;
		pointer-events: none;
		transform: translate(-50%, -100%);
		font-family: monospace;
		border-radius: 3px;

		.arrow {
			left: calc(50% - 5px);
			bottom: -5px;
		}
	}
</style>
