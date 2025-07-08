<script>
	import {
		matchDates,
		getGroup,
		CalculateLeagueResult,
		partitionResultToSortedGroups,
		seriesFromResult,
		groupDisplayShort,
		hasResult,
		hasTT
	} from '$lib/processData.js';
	import { ShortJPDate } from '$lib/util.js';
	import { toPng } from 'html-to-image';
	import ProgressGraph from '$lib/ProgressGraph.svelte';
	import DataCell from './DataCell.svelte';
	import OptionsDiv from './OptionsDiv.svelte';
	import MatchResult from './MatchResult.svelte';
	import Modal from './Modal.svelte';
	import MatchTimeTable from './MatchTimeTable.svelte';

	let { rawdata, clamp } = $props();
	$inspect('clamp', clamp);
	let leagueResultExt = $derived(CalculateLeagueResult(rawdata));
	// $inspect('leagueResultExt', leagueResultExt);
	let gpResults = $derived(partitionResultToSortedGroups(leagueResultExt));
	// $inspect('gpResults', gpResults);
	let progressData = $derived(seriesFromResult(gpResults, matchDates(rawdata), 'accumPt'));
	// $inspect('progressData', progressData);
	let opts = $state({
		detailTable: true
	});
	let openMatchesDetails = $state(rawdata.matches.map((x) => false)); // binding would not work reactively if using $derived
	// c.f. https://github.com/sveltejs/svelte/issues/12320
	let headingRowData = $derived(
		rawdata.matches.map((m, i) => {
			return {
				date: ShortJPDate(m.date, true),
				venue: m.venue,
				shimeiTotal: leagueResultExt.matches[i]?.shimeiTotal ?? null,
				displayType: hasResult(m) ? 'RESULT' : hasTT(m) ? 'TT_ONLY' : 'NONE'
			};
		})
	);
	let tbElt;

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

	function savePNG(node, name) {
		toPng(node, {
			backgroundColor: '#ffffff'
		})
			.then((dataURL) => {
				const img = new Image();
				img.src = dataURL;
				let link = document.createElement('a');
				link.download = name;
				link.href = dataURL;
				link.target = '_blank';
				link.click();
			})
			.catch((err) => {
				console.error('Save to PNG went wrong', err);
			});
	}
</script>

<!-- #region HTML
-->
<div style="display: flex; flex-direction:row; justify-content: space-evenly; margin-top:.5em;">
	<OptionsDiv bind:opts />
	<div>
		<button onclick={() => savePNG(tbElt, `League${rawdata.league}Result.png`)}>
			画像ダウンロード
		</button>
	</div>
</div>

<article class="tableContainer" bind:this={tbElt}>
	<table class="table-bordered">
		<caption>
			リーグ戦結果 ( リーグ{rawdata.league} )
		</caption>
		<thead>
			<tr>
				<th class="sticky headingRow" style="left:0;width:1em;">順</th>
				<th class="sticky headingRow" style="left:1.7em;">グループ</th>
				<!-- {#each rawdata.matches as match, i (match.date)} -->
				{#each headingRowData as match, i}
					<th class="headingRow" style:width={opts.detailTable ? '7.8em' : '5em'}>
						<div>
							<button class="plainBtn" onclick={() => openMatchDetails(i)}>
								{match.date}
							</button>
						</div>
						<Modal bind:open={openMatchesDetails[i]}>
							{#if match.displayType === 'RESULT'}
								<MatchResult
									{clamp}
									leagueNum={rawdata.league}
									venue={match.venue}
									date={match.date}
									{gpResults}
									guestData={leagueResultExt.matches[i].guestResults}
									matchID={i}
								/>
							{/if}
							<h2>タイムテーブル</h2>
							<MatchTimeTable
								timetable={match.displayType != 'NONE' ? rawdata.matches[i].timetable : []}
							/>
						</Modal>
					</th>
				{/each}
			</tr>

			{#if opts.detailTable}
				<tr>
					<th class="sticky"></th>
					<th class="sticky"></th>
					{#each headingRowData as match}
						<th
							style="font-weight:normal; font-size:.9em; border-top: dashed 1px #999; padding-top:0"
						>
							{match.venue}
						</th>
					{/each}
				</tr>

				<tr class="headingRowSubData">
					<th class="sticky"></th>
					<th class="sticky"></th>
					{#each headingRowData as match}
						<th
							style="font-weight: normal; font-size:.7em; border-top: dashed 1px #999; padding-top:.2em;"
						>
							{#if match.shimeiTotal}
								総入場pt: {match.shimeiTotal}
							{/if}
						</th>
					{/each}
				</tr>
			{/if}
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
</article>

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
	tbody > tr {
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;
	}
	.headingRow {
		padding-bottom: 0;
		background-color: white;
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
