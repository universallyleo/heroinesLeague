<script>
	import { padNum } from '$lib/util.js';
	let {
		hasShimei,
		hasFC,
		shimeiNum,
		shimeiRank,
		shimeiDiff,
		fcCount,
		fcRank,
		totalRank,
		countDiff
	} = $props();

	// const rkStr = $derived(rank ? `${rank}位` : '');
	let totalCount = $derived((hasShimei ? shimeiNum : 0) + (hasFC ? fcCount : 0));
</script>

<div class="tableContainer">
	{#if hasFC || hasShimei}
		<table>
			<thead>
				<tr>
					<td></td>
					<td>入</td>
					<td>FC</td>
					<td>合</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>点</td>
					<td>{shimeiNum ?? '-'}</td>
					<td>{fcCount ?? '-'}</td>
					<td>{totalCount > 0 ? totalCount : '-'}</td>
				</tr>
				<tr>
					<td>順</td>
					<td>{shimeiRank ?? '-'}</td>
					<td>{fcRank ?? '-'}</td>
					<td>{totalRank ?? '-'}</td>
				</tr>
				<tr>
					<td>差</td>
					<td>{shimeiDiff >= 0 ? shimeiDiff : '-'}</td>
					<td> - </td>
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
