<script>
	import {
		matchDates,
		getGroup,
		CalculateLeagueResult,
		partitionResultToSortedGroups,
		seriesFromResult,
		groupDisplayShort
	} from '$lib/processData.js';
	import { isFuture, ShortJPDate } from '$lib/util.js';
	import ProgressGraph from '$lib/ProgressGraph.svelte';
	import DataCell from './DataCell.svelte';
	import OptionsDiv from './OptionsDiv.svelte';

	let { rawdata, clamp } = $props();
	$inspect('clamp', clamp);
	let leagueResultExt = $derived(CalculateLeagueResult(rawdata));
	// $inspect('leagueResultExt', leagueResultExt);
	let gpResult = $derived(partitionResultToSortedGroups(leagueResultExt));
	// $inspect('gpResult', gpResult);
	let progressData = $derived(seriesFromResult(gpResult, matchDates(rawdata), 'accumPt'));
	// $inspect('progressData', progressData);
	let opts = $state({
		simpleTable: true
	});

	function subCategory(i) {
		// c.f. https://x.com/Barichy2/status/1921414855908581850/photo/2
		if (rawdata.league == 1) {
			return i < 4 ? 'upperGp' : i > 5 ? 'lowerGp' : '';
		} else {
			return i < 2 ? 'upperGp' : '';
		}
	}
</script>

<!-- #region HTML
-->
<div style="margin-top:.5em;">
	<OptionsDiv bind:opts />
</div>

<div class="tableContainer">
	<table class="table-bordered">
		<caption>
			リーグ戦結果 ( リーグ{rawdata.league} )
		</caption>
		<thead>
			<tr>
				<th style="width:1em;">順</th>
				<th>グループ</th>
				{#each rawdata.matches as match, i (match.date)}
					<th class="headingRow">
						<div>{ShortJPDate(match.date, true)}</div>
						{#if !opts.simpleTable}
							<div class="subheading">
								{match.venue}
								{#if !isFuture(match.date)}
									{#if 'shimeiTotal' in leagueResultExt.matches[i]}
										<br />
										<span style="font-size:smaller;border-top: dashed 1px #999;">
											総入場pt: {leagueResultExt.matches[i].shimeiTotal}
										</span>
									{/if}
								{/if}
							</div>
						{/if}
					</th>
				{/each}
			</tr>
			<!--
			{#each headings as lb}
				<th class="headingRow">{@html lb}</th>
			{/each} -->
		</thead>

		<tbody>
			{#each gpResult as gp, i}
				<tr>
					<td class={['headingCell', subCategory(i)]}>{i + 1}</td>
					<td class={['headingCell', subCategory(i)]}>
						{clamp ? groupDisplayShort(gp.group) : getGroup(gp.group).displayName}
					</td>
					{#each { length: gp.accumPt.length }, n}
						<td>
							<DataCell gpResult={gp} {n} simplify={opts.simpleTable}></DataCell>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="graphContainer">
	<ProgressGraph title="累計ポイント" {progressData} />
</div>

<!-- #region style
-->

<style>
	.tableContainer {
		width: fit-content;
		padding: 1em;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		overflow-x: scroll;
	}
	.graphContainer {
		/* width: max-content; */
		width: 95%;
		margin: 0 auto;
		/* border: 2px black solid; */
	}

	table caption {
		padding-bottom: 0.4em;
		font-weight: bold;
		font-size: large;
	}
	th,
	td {
		vertical-align: top;
		text-align: center;
		padding: 4px 5px;
	}
	tr {
		border-bottom: solid 1px #efefef;
	}

	tbody tr td {
		white-space: nowrap;
	}

	/* tbody tr:nth-child(odd) {
		background-color: #efefef;
	} */

	.upperGp {
		background-color: hsl(60, 100%, 70%);
	}
	.lowerGp {
		background-color: pink;
	}

	.table-bordered {
		width: fit-content;
		/* max-width: 100%; */
		border: 1px solid #999 !important;
		border-spacing: 0 !important;
		border-collapse: collapse;
		display: block;
		overflow-x: auto;
		/* margin: 0 auto; */
		padding: 0.4em;
		font-family: Arial, Helvetica, sans-serif;
	}

	.headingRow {
		border-bottom: 1px solid #ddd;
		width: 7.8em;
	}
	.subheading {
		font-size: small;
		font-weight: normal;
	}

	.headingCell {
		position: sticky;
		left: 0;
		z-index: 2;
		border-right: 1px solid black;
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;
	}

	@media (min-width: 350px) {
		.headingCell {
			padding-left: 0.4em;
			padding-right: 0.2em;
		}
	}

	.cdInfo {
		width: 100px;
		max-width: 140px;
	}
</style>
