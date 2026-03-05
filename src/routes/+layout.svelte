<script>
	import { base } from '$app/paths';
	import '../app.css';
	import ghlogo from '$lib/images/github.svg';
	import xicon from '$lib/images/X_icon.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="app">
	<input type="checkbox" id="hiddenNavToggle" />
	<nav>
		<label for="hiddenNavToggle">
			<!-- <button aria-label="navbar_button" class="navToggle"> -->
			<div class="navToggle">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="navToggle"
				>
					<path
						fill-rule="evenodd"
						d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<!-- </button> -->
		</label>
		<ul>
			<li><a href="{base}/">🏆総合ランキング</a></li>
			<li><a href="{base}/rules">🧾ルール変更一覧</a></li>
			<li><a href="{base}/progress">📈各データ推移</a></li>
			<li><a href="{base}/details">⚔️各戦詳細</a></li>
			<!-- <li><a href="{base}/about">ℹ️ページについて</a></li> -->
		</ul>
	</nav>

	<main>
		{@render children()}
	</main>

	<footer>
		<a href="https://github.com/universallyleo/heroinesLeague">
			<img width="32" src={ghlogo} alt="Source Code" />
		</a>
		&nbsp;&nbsp;
		<a href="https://x.com/55gohan06">
			<img width="32" src={xicon} alt="Twitter" />
		</a>
		&nbsp;&nbsp;
		<a class="external" href="https://universallyleo.github.io/heroinesCrowdfund/">
			ヒロインズクラファ記録
		</a>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	#hiddenNavToggle {
		display: none;
	}

	a.external::after {
		content: '';
		display: inline-block;
		background-repeat: no-repeat;
		background-size: contain;
		background-position: center;
		width: 16px;
		height: 16px;
		background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%238d8d8d' d='M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1M14 4c0 .55.45 1 1 1h2.59l-9.13 9.13a.996.996 0 1 0 1.41 1.41L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1'/></svg>");
	}

	nav {
		width: max-content;
	}
	nav ul {
		display: flex;
		list-style: none;
		padding-bottom: 0.8ch;
		margin-bottom: 2ch;
		border-bottom: solid black 1px;
	}
	nav li {
		margin-right: 20px;
	}

	.navToggle {
		background: transparent;
		border: 0;
		cursor: pointer;
		display: none;
		position: absolute;
		top: 0;
		right: 0;
	}

	.navToggle svg {
		height: 1.8em;
		width: 1.8em;
		position: absolute;
		top: 0.5em;
		right: 0.5em;
	}

	@media screen and (max-width: 700px) {
		#hiddenNavToggle:checked ~ nav ul {
			display: none;
		}

		nav {
			min-height: 2em;
		}

		nav ul {
			display: block;
			padding-left: 0.5em;
			/* border: 1px red solid; */
			opacity: 1;
			border-bottom: 1px #999 solid;
		}
		nav li {
			padding-bottom: 0.5em;
		}

		.navToggle {
			display: block;
		}
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
		justify-content: center;
		align-items: center;
		padding: 12px;
		margin: 1em;
		border-top: 1px solid black;
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
