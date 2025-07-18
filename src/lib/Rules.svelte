<script>
	import RankNumber from './RankNumber.svelte';

	let { hasFC, fcRankToCount = [], rankToPoints = [], rules = [] } = $props();
</script>

<div style="font-weight:normal;">
	ルール参照：
	{#each rules as lk, j}
		[ <a href={lk}> {j + 1} </a> ] &nbsp;
	{/each}
</div>

{#if hasFC}
	<table class="simpTb">
		<caption> FC投票順位とその得点 </caption>
		<thead>
			<tr>
				{#each { length: fcRankToCount.length }, n}
					<th> <RankNumber rank={n + 1} noDecorate={false} /> </th>
				{/each}
			</tr>
		</thead>

		<tbody>
			<tr>
				{#each fcRankToCount as cnt}
					<td> {cnt} </td>
				{/each}
			</tr>
		</tbody>
	</table>
{/if}

{#if rankToPoints.length > 0}
	<table class="simpTb">
		<caption> 総合得点順位とその獲得ポイント </caption>
		<thead>
			<tr>
				{#each { length: rankToPoints.length }, n}
					<th> <RankNumber rank={n + 1} noDecorate={false} /> </th>
				{/each}
			</tr>
		</thead>

		<tbody>
			<tr>
				{#each rankToPoints as cnt}
					<td> {cnt} </td>
				{/each}
			</tr>
		</tbody>
	</table>
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
