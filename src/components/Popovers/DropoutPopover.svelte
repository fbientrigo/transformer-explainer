<script lang="ts">
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import CommonPopover from './CommonPopover.svelte';

	export let placement: PopoverProps['placement'] = undefined;
</script>

<CommonPopover
	className="dropout-popover"
	title="Dropout"
	{placement}
	goTo="article-dropout"
>
	<div class="dropout-content">
		Disables randomly selected neurons. Used only during training.
	</div></CommonPopover
>

<style lang="scss">
	.dropout-content {
		width: 12rem;
	}
</style>
