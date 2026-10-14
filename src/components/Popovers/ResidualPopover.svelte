<script lang="ts">
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import CommonPopover from './CommonPopover.svelte';

	export let placement: PopoverProps['placement'] = undefined;
	export let reference: PopoverProps['reference'];
</script>

<CommonPopover
	className="residual-popover"
	title="Residual Connection"
	{placement}
	{reference}
	goTo="article-residual"
>
	<div class="residual-content">
		Adds layer input to output to help preserve information.
	</div></CommonPopover
>

<style lang="scss">
	.residual-content {
		width: 12rem;
	}
</style>
