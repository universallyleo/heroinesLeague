<script>
	import { base } from '$app/paths';
	import '../app.css';
	import ghlogo from '$lib/images/github.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="app">
	<!-- <Header /> -->

	<main>
		{@render children()}
	</main>

	<footer>
		<a href="https://github.com/universallyleo/heroinesLeague">
			<img width="32" src={ghlogo} alt="Source Code" />
		</a>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 90rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
		margin-top: 1em;
	}
	/* 
	footer a {
		font-weight: bold;
	} */

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
