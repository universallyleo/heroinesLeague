<script>
	import { numberToKanji } from './util';
	let { rank, kanji = false, noNum = false, noDecorate = true, addStyle = '' } = $props();
</script>

{#if (!noNum || rank > 3) && !isNaN(rank)}
	<span class={noDecorate ? '' : `rank-${rank}`} style={addStyle}>
		{kanji ? numberToKanji(rank) : rank}
	</span>
	位
{/if}
{#if !noDecorate}
	{#if rank == 1}
		🥇
	{:else if rank == 2}
		🥈
	{:else if rank == 3}
		🥉
	{/if}
{/if}

<style>
	.rank-1 {
		color: #ffd700; /* Gold */
		font-weight: bold;
	}

	.rank-2 {
		color: #c0c0c0; /* Silver */
		font-weight: bold;
	}

	.rank-3 {
		color: #cd7f32; /* Bronze */
		font-weight: bold;
	}
</style>
