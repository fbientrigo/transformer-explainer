<script lang="ts">
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import CommonPopover from './CommonPopover.svelte';

	export let placement: PopoverProps['placement'] = undefined;
</script>

<CommonPopover
	className="activation-popover"
	title="GELU Activation"
	{placement}
	goTo="article-activation"
>
	<div class="activation-content">
		Applies non-linear transformation to linearly transformed output to learn complex patterns.
	</div></CommonPopover
>

<style>
	.activation-content {
		width: 12rem;
	}
</style>
