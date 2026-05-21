<script>
	// import { padNum } from '$lib/util.js';
	let {
		hasShimei,
		// hasFC,
		// hasAbema,
		shimeiNum,
		shimeiRank,
		shimeiDiff,
		mPts,
		// fcCount,
		// fcRank,
		// abemaCount,
		// abemaRank,
		totalCount,
		totalRank,
		countDiff
	} = $props();

	$inspect('mPts in subdata', mPts);

	// const rkStr = $derived(rank ? `${rank}位` : '');
	// let totalCount = $derived(
	// 	(hasShimei ? shimeiNum : 0) + (hasFC ? fcCount : 0) + (hasAbema ? abemaCount : 0)
	// );
</script>

<div class="tableContainer">
	<!-- {#if hasFC || hasShimei || hasAbema} -->
	{#if hasShimei}
		<table>
			<thead>
				<tr>
					<td></td>
					<td>入</td>
					{#each mPts as x (x[0])}
						{#if x[1] != null}
							<td> {x[0].slice(0, 2)} </td>
						{/if}
					{/each}
					<!-- {#if hasFC}<td>FC</td>{/if}
					{#if hasAbema}<td>Abe</td>{/if} -->
					<td>合</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>点</td>
					<td>{shimeiNum ?? '-'}</td>
					{#each mPts as x (x[0])}
						{#if x[1] != null}
							<td> {x[1]} </td>
						{/if}
					{/each}
					<!-- {#if hasFC}<td>{fcCount ?? '-'}</td>{/if}
					{#if hasAbema}<td>{abemaCount ?? '-'}</td>{/if} -->
					<td>{totalCount > 0 ? totalCount : '-'}</td>
				</tr>
				<tr>
					<td>順</td>
					<td>{shimeiRank ?? '-'}</td>
					{#each mPts as x (x[0])}
						{#if x[1] != null}
							<td> {x[2]} </td>
						{/if}
					{/each}
					<!-- {#if hasFC}<td>{fcRank ?? '-'}</td>{/if}
					{#if hasAbema}<td>{abemaRank ?? '-'}</td>{/if} -->
					<td>{totalRank ?? '-'}</td>
				</tr>
				<tr>
					<td>差</td>
					<td>{shimeiDiff >= 0 ? shimeiDiff : '-'}</td>
					{#each mPts as x (x[0])}
						{#if x[1] != null}
							<td> {x[3] != null && x[3] >= 0 ? x[3] : '-'} </td>
						{/if}
					{/each}
					<!-- {#if hasFC}<td> - </td>{/if}
					{#if hasAbema}<td> - </td>{/if} -->
					<td>{countDiff >= 0 ? countDiff : '-'}</td>
				</tr>
			</tbody>
		</table>
	{/if}
</div>

<style>
	.tableContainer {
		width: fit-content;
		margin: 0 auto;
	}
	table {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		font-size: small;
		border-collapse: collapse;
	}
	table thead tr {
		color: #888;
		font-size: smaller;
		border-bottom: 1px solid #777;
	}
	table td {
		min-width: 2em;
		padding: 0;
	}
	table tr > td:first-child {
		font-size: smaller;
		color: #888;
		border-right: 1px solid #777;
	}
</style>
