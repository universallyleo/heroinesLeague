<script>
	import RankNumber from './RankNumber.svelte';

	let {
		hasFC,
		hasAbema,
		fcRankToCount = [],
		abemaRankToCount = [],
		rankToPoints = [],
		rules = []
	} = $props();
</script>

<div style="font-weight:normal;">
	ルール参照：
	{#if rules.length == 0}
		データなし
	{:else}
		{#each rules as lk, j (j)}
			[ <a href={lk}> {j + 1} </a> ] &nbsp;
		{/each}
	{/if}
</div>

{#snippet conversionTable(caption, rankToCount, noDecorate)}
	<table class="simpTb">
		<caption> {caption} </caption>
		<thead>
			<tr>
				{#each { length: rankToCount.length }, n (n)}
					<th> <RankNumber rank={n + 1} {noDecorate} /> </th>
				{/each}
			</tr>
		</thead>

		<tbody>
			<tr>
				{#each rankToCount as cnt, idx (idx)}
					<td> {cnt} </td>
				{/each}
			</tr>
		</tbody>
	</table>
{/snippet}

{#if hasFC}
	{@render conversionTable('FC投票順位とその得点', fcRankToCount, false)}
	<!-- <table class="simpTb">
		<caption> FC投票順位とその得点 </caption>
		<thead>
			<tr>
				{#each { length: fcRankToCount.length }, n (n)}
					<th> <RankNumber rank={n + 1} noDecorate={false} /> </th>
				{/each}
			</tr>
		</thead>

		<tbody>
			<tr>
				{#each fcRankToCount as cnt, idx (idx)}
					<td> {cnt} </td>
				{/each}
			</tr>
		</tbody>
	</table> -->
{/if}

{#if hasAbema}
	{@render conversionTable('Abema投票順位とその得点', abemaRankToCount, false)}
{/if}

{#if rankToPoints.length > 0}
	{@render conversionTable('総合得点順位とその獲得ポイント', rankToPoints, false)}
	<!-- <table class="simpTb">
		<caption> 総合得点順位とその獲得ポイント </caption>
		<thead>
			<tr>
				{#each { length: rankToPoints.length }, n (n)}
					<th> <RankNumber rank={n + 1} noDecorate={false} /> </th>
				{/each}
			</tr>
		</thead>

		<tbody>
			<tr>
				{#each rankToPoints as cnt, idx (idx)}
					<td> {cnt} </td>
				{/each}
			</tr>
		</tbody>
	</table> -->
{/if}

<style>
	.simpTb {
		width: fit-content;
		border-spacing: 0 !important;
		border-collapse: collapse;
		display: block;
		margin: 1em auto;
		padding: 0.4em 1em;
		font-family: Arial, Helvetica, sans-serif;
	}

	.simpTb caption {
		font-weight: normal;
		text-decoration: underline;
	}

	.simpTb th,
	.simpTb td {
		border: 1px solid #999;
	}
</style>
