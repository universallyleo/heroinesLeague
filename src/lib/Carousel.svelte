<script>
	import { onMount } from 'svelte';
	import { palette } from '$lib/util.js';
	let { dataset, selected } = $props();

	let carousel;
	let scrollAmount = $state(0);

	function scrollToItem(i) {
		carousel.scrollTo({ left: scrollAmount * i, behavior: 'smooth' });
		selected = i;
	}

	onMount(() => {
		scrollAmount =
			dataset.length > 0 ? carousel.firstElementChild.scrollWidth : carousel.scrollWidth;
	});
</script>

<div class="carousel-container">
	<button
		class="nav-button nav-left"
		onclick={() => carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' })}>&#10094;</button
	>
	<button
		class="nav-button nav-right"
		onclick={() => carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })}>&#10095;</button
	>

	<div class="carousel" bind:this={carousel}>
		{#each dataset as item, i}
			<div
				class={['carousel-item', selected == i ? 'itemSelected' : '']}
				style:background-color={palette[i]}
			>
				{item}
			</div>
		{/each}
	</div>

	<div class="navdots">
		{#each { length: dataset.length }, i}
			<button class:isSelected={selected == i} onclick={() => scrollToItem(i)}>
				{i + 1}
			</button>
		{/each}
	</div>
</div>

<style>
	.carousel-container {
		margin: 0 auto;
		position: relative;
		width: min(50%, 80vw);
		overflow: hidden;
	}

	.carousel {
		display: flex;
		overflow-x: hidden;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scroll-padding: 0 20px;
	}

	.carousel-item {
		flex: none;
		scroll-snap-align: start;
		width: 100%;
		height: 6em;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		color: white;
	}

	.itemSelected {
		box-shadow: inset 0 0 0 3px rgb(242, 242, 24);
	}

	.navdots {
		bottom: 0.4em;
		display: flex;
		justify-content: center;
		left: 0;
		right: 0;
		column-gap: 0.5em;
		position: absolute;
	}

	.navdots button {
		/* reset default button style */
		-moz-appearance: none;
		-webkit-apperance: none;
		appearance: none;
		/* border: 1px solid black; */
		border: 0;
		cursor: pointer;
		/* style as a grey dot */
		background-color: #aaa;
		border-radius: 50%;
		height: 2.5ch;
		padding: 0;
		width: 2.5ch;
	}

	.navdots button.isSelected {
		background-color: #eee;
		border: 2px solid black;
	}

	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		font-size: 2rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		z-index: 1;
	}

	.nav-left {
		left: 10px;
	}
	.nav-right {
		right: 10px;
	}
</style>
