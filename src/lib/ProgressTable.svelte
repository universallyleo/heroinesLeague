<script>
	import {
		matchDates,
		getGroup,
		CalculateLeagueResult,
		partitionResultToSortedGroups,
		seriesFromResult,
		groupDisplayShort,
		hasResult
	} from '$lib/processData.js';
	import { ShortJPDate } from '$lib/util.js';
	import ProgressGraph from '$lib/ProgressGraph.svelte';
	import DataCell from './DataCell.svelte';
	import OptionsDiv from './OptionsDiv.svelte';
	import MatchResult from './MatchResult.svelte';

	let { rawdata, clamp } = $props();
	$inspect('clamp', clamp);
	let leagueResultExt = $derived(CalculateLeagueResult(rawdata));
	$inspect('leagueResultExt', leagueResultExt);
	let gpResults = $derived(partitionResultToSortedGroups(leagueResultExt));
	// $inspect('gpResults', gpResults);
	let progressData = $derived(seriesFromResult(gpResults, matchDates(rawdata), 'accumPt'));
	// $inspect('progressData', progressData);
	let opts = $state({
		detailTable: true
	});
	let openMatchesDetails = $state(rawdata.matches.map((x) => false)); // binding would not work reactively if using $derived
	// c.f. https://github.com/sveltejs/svelte/issues/12320

	function subCategory(i) {
		// c.f. https://x.com/Barichy2/status/1921414855908581850/photo/2
		if (rawdata.league == 1) {
			return i < 4 ? 'upperGp' : i > 5 ? 'lowerGp' : 'midGp';
		} else {
			return i < 2 ? 'upperGp' : 'midGp';
		}
	}

	function openMatchDetails(i) {
		openMatchesDetails[i] = true;
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
				<th class="sticky headingRow" style="left:0;width:1em;">順</th>
				<th class="sticky headingRow" style="left:1.7em;">グループ</th>
				{#each rawdata.matches as match, i (match.date)}
					<th class="headingRow" style:width={opts.detailTable ? '7.8em' : '5em'}>
						<div>
							<button class="plainBtn" onclick={() => openMatchDetails(i)}>
								{ShortJPDate(match.date, true)}
							</button>
						</div>
						{#if hasResult(match)}
							<MatchResult
								bind:open={openMatchesDetails[i]}
								{clamp}
								leagueNum={rawdata.league}
								venue={match.venue}
								date={match.date}
								{gpResults}
								guestData={leagueResultExt.matches[i].guestResults}
								matchID={i}
							/>
						{/if}
						{#if opts.detailTable}
							<div class="subheading">
								{match.venue}
								{#if hasResult(match)}
									{#if 'shimeiTotal' in leagueResultExt.matches[i]}
										<br />
										<span style="font-size:smaller;border-top: dashed 1px #999; padding-top:.2em;">
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
			{#each gpResults as gp, i}
				<tr>
					<td class={['headingCell', 'sticky', subCategory(i)]} style="left:0;">{i + 1}</td>
					<td
						class={['headingCell', 'sticky', 'gpLogo', subCategory(i)]}
						style="font-size:smaller;left:1.7em;"
					>
						<img
							src={`.\/gpLogo\/${gp.group}.jpg`}
							width={clamp ? '40' : '60'}
							alt={getGroup(gp.group).displayName}
						/>
						<br />
						{clamp ? groupDisplayShort(gp.group) : getGroup(gp.group).displayName}
					</td>
					{#each { length: gp.accumPt.length }, n}
						<td>
							<DataCell gpResult={gp} {n} detailed={opts.detailTable}></DataCell>
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

	/* tbody tr:nth-child(odd) {
		background-color: #efefef;
	} */

	.gpLogo {
		vertical-align: middle;
	}

	.upperGp {
		background-color: hsl(60, 100%, 70%);
	}
	.midGp {
		background-color: white;
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
		/* overflow-x: auto; */
		/* margin: 0 auto; */
		padding: 0.4em;
		font-family: Arial, Helvetica, sans-serif;
	}

	.headingRow {
		border-bottom: 1px solid #ddd;
		background-color: white;
		/* width: 7.8em; */
	}
	.subheading {
		font-size: small;
		font-weight: normal;
	}

	.sticky {
		position: sticky;
		z-index: 2;
	}
	.headingCell {
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

	.plainBtn {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}
</style>
