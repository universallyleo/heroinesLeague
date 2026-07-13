<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import '../app.css';
	import ghlogo from '$lib/images/github.svg';
	import xicon from '$lib/images/X_icon.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	let theme = $state('light');

	const storageKey = 'heroines-league-theme';

	function systemTheme(mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')) {
		return mediaQuery.matches ? 'dark' : 'light';
	}

	function applyTheme(nextTheme, persist = true) {
		theme = nextTheme;
		document.documentElement.dataset.theme = nextTheme;
		if (persist) localStorage.setItem(storageKey, nextTheme);
	}

	function toggleTheme() {
		applyTheme(theme === 'dark' ? 'light' : 'dark');
	}

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const savedTheme = localStorage.getItem(storageKey);
		applyTheme(
			savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : systemTheme(mediaQuery),
			false
		);

		function updateSystemTheme() {
			if (!localStorage.getItem(storageKey)) applyTheme(systemTheme(mediaQuery), false);
		}

		mediaQuery.addEventListener('change', updateSystemTheme);
		return () => mediaQuery.removeEventListener('change', updateSystemTheme);
	});
</script>

<div class="app">
	<input type="checkbox" id="hiddenNavToggle" />
	<div class="navRow">
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
				<li><a href="{base}/pastresults">🧾過去の結果</a></li>
				<li><a href="{base}/rules">📑ルール変更一覧</a></li>
				<li><a href="{base}/progress">📈各データ推移</a></li>
				<li><a href="{base}/details">⚔️各戦詳細</a></li>
				<li>
					<a
						href="https://universallyleo.github.io/heroinesCrowdfund/"
						target="_blank"
						rel="noopener noreferrer"
					>
						💰クラファン記録
					</a>
				</li>
				<!-- <li><a href="{base}/about">ℹ️ページについて</a></li> -->
			</ul>
		</nav>

		<button
			class="themeToggle"
			type="button"
			aria-label={theme === 'dark' ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'}
			title={theme === 'dark' ? 'ライトテーマ' : 'ダークテーマ'}
			onclick={toggleTheme}
		>
			{theme === 'dark' ? '☀' : '☾'}
		</button>
	</div>

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
		<!-- &nbsp;&nbsp;
		<a href="https://universallyleo.github.io/heroinesCrowdfund/">
			ヒロインズクラファ記録
		</a> -->
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

	.navRow {
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		width: 100%;
		padding-right: 1rem;
	}

	nav {
		width: max-content;
	}
	nav ul {
		display: flex;
		list-style: none;
		padding-bottom: 0.8ch;
		margin-bottom: 2ch;
		border-bottom: solid var(--color-border-strong) 1px;
	}
	nav li {
		margin-right: 20px;
	}

	.themeToggle {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		color: var(--color-text);
		cursor: pointer;
		font-size: 1.1rem;
		height: 2rem;
		line-height: 1;
		margin-top: 0.45rem;
		width: 2rem;
	}

	.themeToggle:hover,
	.themeToggle:focus-visible {
		border-color: var(--color-border-strong);
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
		right: 3em;
	}

	@media screen and (max-width: 700px) {
		#hiddenNavToggle:checked ~ .navRow nav ul {
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
			border-bottom: 1px var(--color-border) solid;
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
		border-top: 1px solid var(--color-border-strong);
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
