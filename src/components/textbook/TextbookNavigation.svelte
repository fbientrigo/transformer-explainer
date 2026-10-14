<script lang="ts">
	import { AngleLeftOutline, AngleRightOutline } from 'flowbite-svelte-icons';
	import {
		textbookCurrentPage,
		textbookPreviousPage,
		textbookCurrentPageId,
		textbookPreviousPageId,
		userId
	} from '~/store';
	import type { TextbookPage } from '~/utils/textbookPages';
	import { getKeyboardPageIndex } from '~/utils/textbookNavigation.js';

	export let textPages: TextbookPage[];
	let showPageDropdown = false;
	let isDragging = false;
	let progressBarElement: HTMLElement;
	let previewProgress = 0;

	function updatePageFromPosition(clientX: number, via: string = 'progress-bar') {
		if (!progressBarElement) return;

		const rect = progressBarElement.getBoundingClientRect();
		const clickX = clientX - rect.left;
		const progressRatio = Math.max(0, Math.min(1, clickX / rect.width));
		const targetPage = Math.floor(progressRatio * textPages.length);
		const newPageIndex = Math.max(0, Math.min(targetPage, textPages.length - 1));

		if (newPageIndex === $textbookCurrentPage) return;

		textbookPreviousPageId.set($textbookCurrentPageId);
		textbookPreviousPage.set($textbookCurrentPage);

		const newPageId = textPages[newPageIndex]?.id || '';
		textbookCurrentPageId.set(newPageId);
		textbookCurrentPage.set(newPageIndex);

		window.dataLayer?.push({
			event: `open-textbook`,
			page_id: newPageId,
			open_via: via,
			user_id: $userId
		});
	}

	function handleProgressClick(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		updatePageFromPosition(event.clientX, 'progress-bar-click');
	}

	function handleProgressMouseDown(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		isDragging = true;
	}

	function handleGlobalMouseMove(event: MouseEvent) {
		if (isDragging && progressBarElement) {
			const rect = progressBarElement.getBoundingClientRect();
			const clickX = event.clientX - rect.left;
			const progressRatio = Math.max(0, Math.min(1, clickX / rect.width));
			previewProgress = progressRatio;
		}
	}

	function handleGlobalMouseUp(event: MouseEvent) {
		if (isDragging) {
			updatePageFromPosition(event.clientX, 'progress-bar-drag');
			isDragging = false;
			previewProgress = 0;
		}
	}

	function navigatePage(direction: 'prev' | 'next') {
		textbookPreviousPage.set($textbookCurrentPage);
		textbookPreviousPageId.set($textbookCurrentPageId);

		let newPageIndex: number;
		if (direction === 'prev') {
			newPageIndex = $textbookCurrentPage > 0 ? $textbookCurrentPage - 1 : textPages.length - 1;
		} else {
			newPageIndex = $textbookCurrentPage < textPages.length - 1 ? $textbookCurrentPage + 1 : 0;
		}
		const newPageId = textPages[newPageIndex]?.id || '';
		textbookCurrentPageId.set(newPageId);
		textbookCurrentPage.set(newPageIndex);

		window.dataLayer?.push({
			event: `open-textbook`,
			page_id: newPageId,
			open_via: 'nvigation-arrow',
			user_id: $userId
		});
	}

	function handleLeftClick(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		navigatePage('prev');
	}

	function handleRightClick(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		navigatePage('next');
	}

	function handleNavigationKeydown(event: KeyboardEvent, direction: 'prev' | 'next') {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			navigatePage(direction);
		}
	}

	function handleProgressKeydown(event: KeyboardEvent) {
		const rect = progressBarElement.getBoundingClientRect();
		const target = getKeyboardPageIndex(event, $textbookCurrentPage, textPages.length);
		if (target === null) return;
		updatePageFromPosition(rect.left + rect.width * (target + 0.5) / textPages.length, 'progress-bar-keyboard');
	}

</script>

<svelte:window on:mousemove={handleGlobalMouseMove} on:mouseup={handleGlobalMouseUp} />

<!-- Navigation Footer -->
<div class="navigation-footer">
	<!-- Left navigation area -->
	<div class="nav-section left" on:click={handleLeftClick} on:keydown={(event) => handleNavigationKeydown(event, 'prev')} role="button" tabindex="0">
		<div class="nav-arrow-circle">
			<AngleLeftOutline size="sm" />
		</div>
	</div>

	<!-- Center section with progress and page counter -->
	<div class="nav-section center">
		<div
			class="progress-bar"
			bind:this={progressBarElement}
			on:click={handleProgressClick}
			on:keydown={handleProgressKeydown}
			on:mousedown={handleProgressMouseDown}
			role="slider"
			aria-label="Textbook page"
			aria-orientation="horizontal"
			aria-valuemin="1"
			aria-valuemax={textPages.length}
			aria-valuenow={$textbookCurrentPage + 1}
			tabindex="0"
		>
			<div
				class="progress-fill"
				class:dragging={isDragging}
				style="width: {isDragging ? previewProgress * 100 : (($textbookCurrentPage + 1) / textPages.length) * 100}%"
			></div>
		</div>
		<div class="page-counter-container">
			<button
				class="page-counter"
				on:click={(e) => {
					e.stopPropagation();
					e.preventDefault();
					showPageDropdown = !showPageDropdown;
				}}
			>
				{$textbookCurrentPage + 1} / {textPages.length}
			</button>
			{#if showPageDropdown}
				<div class="page-dropdown">
				{#each textPages as page, index (page.id)}
						<button
							class="dropdown-item"
							class:active={$textbookCurrentPage === index}
							on:click={(e) => {
								e.stopPropagation();
								e.preventDefault();
								textbookPreviousPageId.set($textbookCurrentPageId);
								textbookPreviousPage.set($textbookCurrentPage);

								const newPageId = textPages[index]?.id || '';
								textbookCurrentPageId.set(newPageId);
								textbookCurrentPage.set(index);
								showPageDropdown = false;

								window.dataLayer?.push({
									event: `open-textbook`,
									page_id: newPageId,
									open_via: 'dropdown',
									user_id: $userId
								});
							}}
						>
							{index + 1}. {page.title}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Right navigation area -->
	<div class="nav-section right" on:click={handleRightClick} on:keydown={(event) => handleNavigationKeydown(event, 'next')} role="button" tabindex="0">
		<div class="nav-arrow-circle">
			<AngleRightOutline size="sm" />
		</div>
	</div>
</div>

<style lang="scss">
	.navigation-footer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 3rem;
		display: flex;
		align-items: center;
		z-index: 10;

		.nav-section {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			cursor: pointer;
			transition: all 0.2s ease;
			&.center {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				gap: 0.75rem;
				cursor: default;
				padding: 0 1rem;

				.progress-bar {
					width: 6rem;
					height: 4px;
					background: theme('colors.gray.200');
					border-radius: 2px;
					cursor: pointer;
					transition: all 0.2s ease;
					position: relative;
					user-select: none;

					&:hover {
						background: theme('colors.gray.300');
					}

					&:active {
						cursor: grabbing;
					}

					.progress-fill {
						height: 100%;
						background: theme('colors.blue.500');
						border-radius: 2px;
						transition: width 0.3s ease;

						&.dragging {
							transition: none;
						}
					}
				}

				.page-counter-container {
					position: relative;

					.page-counter {
						width: 3.4rem;
						white-space: nowrap;
						background: theme('colors.blue.50');
						color: theme('colors.blue.600');
						border: 1px solid theme('colors.blue.200');
						border-radius: 12px;
						padding: 0.25rem 0.3rem;
						font-size: 0.75rem;
						font-weight: 500;
						cursor: pointer;
						transition: all 0.2s ease;

						&:hover {
							background: theme('colors.blue.100');
							border-color: theme('colors.blue.200');
						}
					}

					.page-dropdown {
						position: absolute;
						bottom: 100%;
						left: 10%;
						margin-bottom: 0.5rem;
						background: rgba(255, 255, 255, 0.95);
						border: 1px solid rgba(229, 231, 235, 0.3);
						border-radius: 8px;
						box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
						backdrop-filter: blur(10px);
						height: 300px;
						overflow-y: auto;
						min-width: 200px;

						.dropdown-item {
							display: block;
							width: 100%;
							padding: 0.5rem 0.75rem;
							text-align: left;
							background: transparent;
							border: none;
							cursor: pointer;
							font-size: 0.8rem;
							color: #4b5563;
							transition: all 0.2s ease;

							&:hover {
								background: theme('colors.blue.50');
								color: theme('colors.blue.600');
							}

							&.active {
								background: theme('colors.blue.50');
								color: theme('colors.blue.600');
								font-weight: 600;
							}

							&:first-child {
								border-radius: 8px 8px 0 0;
							}

							&:last-child {
								border-radius: 0 0 8px 8px;
							}
						}
					}
				}
			}

			&.left,
			&.right {
				user-select: none;
				-webkit-user-drag: none;
				flex: 1;
				justify-content: flex-start;
				padding-left: 0.5rem;
				.nav-arrow-circle {
					width: 1.8rem;
					height: 1.8rem;
					border-radius: 50%;
					background: rgba(59, 130, 246, 0.08);
					color: theme('colors.blue.500');
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.2s ease;
					border: 1px solid rgba(59, 130, 246, 0.15);

					&:hover {
						background: rgba(59, 130, 246, 0.12);
						color: theme('colors.blue.600');
						border-color: rgba(59, 130, 246, 0.25);
					}

					:global(svg) {
						width: 16px;
						height: 16px;
					}
				}
			}
			&.right {
				justify-content: flex-end;
				padding-right: 0.5rem;
			}
		}
	}
</style>
