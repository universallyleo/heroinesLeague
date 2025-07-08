<script lang="ts">
	import { slide } from 'svelte/transition';

	let {
		children,
		header,
		arrowup = null,
		arrowdown = null,
		open = $bindable(false),
		contentCSS = null
	} = $props();

	// single selection
	// const self = {};
	//   const selected = ctx.selected ?? writable();
	//   if (open) selected.set(self);
	//   selected.subscribe((x) => (open = x === self));
	//   const handleToggle = () => selected.set(open ? {} : self);
	const handleToggle = () => (open = !open);
</script>

<h1 class="container">
	<button type="button" onclick={handleToggle} aria-expanded={open}>
		{#if header}
			{@render header()}
			{#if open}
				{#if !arrowup}
					<svg
						class="arrow"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 10 6"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5 5 1 1 5"
						/>
					</svg>
				{:else}
					{@render arrowup()}
				{/if}
			{:else if !arrowdown}
				<svg
					class="arrow"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 10 6"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="m1 1 4 4 4-4"
					/>
				</svg>
			{:else}
				{@render arrowdown()}
			{/if}
		{/if}
	</button>
</h1>
{#if open}
	<div class="content" transition:slide={{ duration: 400 }} style={contentCSS}>
		{@render children()}
	</div>
{/if}

<style>
	.container {
		margin: 0;
		border: 2px black solid;
		border-collapse: collapse;
	}

	button {
		background: white;
		width: 100%;
		border-width: 0;
		padding: 0.5em;
		font-size: large;
		font-weight: bold;
		display: flex;
		justify-content: space-between;
	}

	.arrow {
		width: 0.8em;
		height: 0.8em;
	}

	.content {
		border: 1px solid hsl(0, 0%, 80%);
		margin-top: 0px;
		padding-bottom: 1em;
	}
</style>
