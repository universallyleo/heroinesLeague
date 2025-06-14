<script>
	import {
		matchDates,
		getGroup,
		CalculateLeagueResult,
		partitionResultToSortedGroups,
		seriesFromResult,
		groupDisplayShort
	} from '$lib/processData.js';
	import { isFuture, padNum, ShortJPDate } from '$lib/util.js';
	import ProgressGraph from '$lib/ProgressGraph.svelte';

	let { rawdata, clamp } = $props();
	$inspect('clamp', clamp);
	let leagueResultExt = $derived(CalculateLeagueResult(rawdata));
	// $inspect('leagueResultExt', leagueResultExt);
	let gpResult = $derived(partitionResultToSortedGroups(leagueResultExt));
	// $inspect('gpResult', gpResult);
	let progressData = $derived(seriesFromResult(gpResult, matchDates(rawdata), 'accumPt'));
	// $inspect('progressData', progressData);
	let tblDom;

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
<!-- <div style="width: fit-content; margin:.2em auto;">
	<button on:click={() => imgOut(tblDom)}> 詳細データ画像ダウンロード </button>
</div> -->
<div class="tableContainer">
	<table class="table-bordered" bind:this={tblDom}>
		<caption>
			<!-- {seriesCollection.caption}
			<span class="weaker">{seriesCollection.subcaption}</span> -->
			<!-- 順位・累計点数 -->
			リーグ戦結果 ( リーグ{rawdata.league} )
		</caption>
		<thead>
			<tr>
				<th>現順位</th>
				<th>グループ</th>
				{#each rawdata.matches as match, i (match.date)}
					<th class="headingRow">
						<div>{ShortJPDate(match.date, true)}</div>
						<div class="subheading">
							{match.venue}
							{#if !isFuture(match.date)}
								{#if 'shimeiTotal' in leagueResultExt.matches[i]}
									<br />
									<span class="desc">総入場pt: {leagueResultExt.matches[i].shimeiTotal}</span>
								{/if}
							{/if}
						</div>
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
							<div class="dataCell">
								<div class="mainData">{gp.accumPt[n]}</div>
								<div class="diff">
									<span class="desc">Pt差</span><br />
									{gp.accumPtDiff[n] >= 0 ? gp.accumPtDiff[n] : '-'}
								</div>
								<div class="subData">
									{#if gp.shimeiNum[n] != null}
										<div class="subDataRow">
											<div class="desc">目当</div>
											<div></div>
											<div class="subpt">{@html padNum(gp.shimeiNum[n], 4, '&nbsp;')} pt</div>
											<div>
												<span class="desc">差</span>
												{gp.shimeiDiff[n] >= 0 ? ` ${gp.shimeiDiff[n]}` : '-'}
											</div>
										</div>
									{/if}
									{#if gp.fcCount[n] != null}
										<div class="subDataRow">
											<div class="desc">FC</div>
											<div class="desc">{gp.fcRank[n]}位</div>
											<div class="subpt">{@html padNum(gp.fcCount[n], 4, '&nbsp;')} pt</div>
										</div>
									{/if}
									<div class="subDataRow">
										<div class="desc">得点</div>
										<div class="desc">{gp.totalRank[n]}位</div>
										<div class="subpt">
											<span style="color:red">{@html padNum(gp.getPt[n], 4, '&nbsp;')}</span> pt
										</div>
									</div>
								</div>
							</div>
						</td>
						<!-- {#if gp.shimeiNum[n] > 0}
							<td>
								<div class="subData">{gp.shimeiDiff}</div>
								<div class="subData">{gp.shimeiLostRatio}</div>
							</td>
						{/if} -->
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

	.dataCell {
		min-width: 6em;
		display: grid;
		gap: 2px;
		grid-template-columns: auto 2em;
		grid-template-areas:
			'main diff'
			'sub sub';
	}

	.desc {
		font-size: smaller;
		color: #777;
		/* background-color: bisque; */
	}

	.dataCell .subpt {
		text-align: start;
		/* border-left: 1px solid black; */
	}

	.mainData {
		font-size: larger;
		font-weight: bold;
		grid-area: main;
		/* padding-top: 0.2em; */
		align-self: center;
		padding: 0.3em 0;
		background: rgb(214, 236, 248);
	}

	.diff {
		font-size: small;
		grid-area: diff;
		display: grid;
		grid-template-rows: 1fr 1fr;
		border: 1px solid #999;
	}

	/* .subData {
		font-size: smaller;
		font-weight: normal;
		color: hsl(0, 0%, 50%);
	} */
	.subData {
		grid-area: sub;
		display: grid;
		grid-template-rows: repeat(auto-fit, 1fr);
	}

	.subDataRow {
		font-family: monospace;
		font-size: 0.9375em;
		display: grid;
		grid-template-columns: 2.2em 1.8em 1fr 1fr;
	}

	.subDataRow:first-child {
		border-top: 1px solid #555;
	}

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
		/* min-width: 10em;
		width: auto; */
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
