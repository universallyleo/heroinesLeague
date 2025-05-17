<script>
	import {
		matchDates,
		CalculateResult,
		// @ts-ignore
		groupDisplayShort,
		seriesFromResult,
		getGroup
	} from '$lib/processData.js';
	import { ShortJPDate } from '$lib/util.js';
	// import { range } from "lodash-es";
	// import {
	//     subdataDisplayInTable,
	//     prepareFixCD,
	//     prepareFixMB,
	//     prepareFixAllMB,
	//     preapreOverallProgress,
	//     prepareReceptionProg,
	// } from "./seriesSpec.js";
	import ProgressGraph from '$lib/ProgressGraph.svelte';
	// import AccordionItem from "../../lib/AccordionItem.svelte";

	// export let mode;
	// export let members;
	// export let includings;
	// export let extra = {};

	// let seriesCollection = {};
	// let progressData = {};
	// let headings = [];
	let { rawdata } = $props();
	let gpResult = $derived(CalculateResult(rawdata));
	$inspect('gpResult', gpResult);
	let progressData = $derived(seriesFromResult(gpResult, matchDates(rawdata), 'accum'));
	$inspect('progressData', progressData);
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
<div style="width: fit-content; padding: 1em; margin: 0 auto;">
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
				{#each rawdata.matches as match (match.date)}
					<th class="headingRow">
						<div>{ShortJPDate(match.date, true)}</div>
						<div class="subheading">{match.venue}</div>
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
						{getGroup(gp.group).displayName}
					</td>
					{#each { length: gp.accum.length }, n}
						<td class="dataCell">
							<div>{gp.accum[n]}</div>
							<div class="subData">
								{#if gp.entrancePt[n] > 0}
									入場 {gp.entrancePt[n]}
								{/if}
								({gp.individualRank[n]}位)
							</div>
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
		font-size: small;
		min-width: 6em;
		display: grid;
		grid-row: 1fr 1fr;
		gap: 2px;
	}

	.dataCell .subData {
		font-size: smaller;
		font-weight: normal;
		color: hsl(0, 0%, 50%);
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
	}
	.subheading {
		font-size: small;
		font-weight: normal;
	}

	.headingCell {
		padding-left: 0.4em;
		padding-right: 0.2em;
		border-right: 1px solid black;
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;
	}

	.cdInfo {
		width: 100px;
		max-width: 140px;
	}
</style>
