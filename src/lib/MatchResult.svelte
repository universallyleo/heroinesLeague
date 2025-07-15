<script>
	import MatchTable from './MatchTable.svelte';
	import { resultTypes } from './processData';
	import RankNumber from './RankNumber.svelte';
	import { numberToKanji } from './util';

	let {
		clamp,
		leagueNum,
		venue,
		date,
		gpResults,
		matchID,
		guestData,
		fcRankToCount = [],
		rankToPoints = []
	} = $props();

	let { hasFC } = $derived(resultTypes(gpResults[0], matchID));
</script>

<h2>結果</h2>
リーグ{leagueNum} 第{numberToKanji(matchID + 1)}戦
<br />
<span style="font-size:small; color: #888;"> {date} @ {venue} </span>

<MatchTable type="inMatch" {clamp} {gpResults} {matchID} />

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

{#if guestData.length > 0}
	<h2>ゲスト</h2>
	<MatchTable type="guest" {clamp} gpResults={guestData} />
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
