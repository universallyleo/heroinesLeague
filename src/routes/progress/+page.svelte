<script>
	import { dataCollection, matchDates, seriesFromResult } from '$lib/processData.js';
	import ProgressGraph from '$lib/ProgressGraph.svelte';

	let league = $state(1);
	let progressType = $state('accumRank');
	let selectedData = $derived(dataCollection[league][0]);
	let progressData = $derived(
		seriesFromResult(
			selectedData.resByGp,
			matchDates(selectedData.extData),
			// @ts-ignore
			progressType,
			progressType === 'shimeiPercent' ? selectedData.summary.map((s) => s.shimeiTotal) : []
		)
	);
	// $inspect(progressType === 'shimeiPercent' ? progressData : null);
	let revertY = $derived(['accumRank', 'totalRank', 'fcRank'].includes(progressType));

	let labels = {
		accumPt: 'リーグポイント',
		accumRank: 'リーグ順位',
		totalRank: '戦順位',
		shimeiNum: '入場指名数',
		shimeiPercent: '入場指名数：総入場数（%）',
		fcRank: 'FC投票順位'
	};

	// function getSeries(type) {
	// 	let dates = ;
	// 		return ;
	// }
</script>

<div style="controlDiv">
	<div>
		リーグ：
		{#each { length: 2 }, i}
			<label><input type="radio" name="league" value={i} bind:group={league} /> {i + 1} </label>
		{/each}
		<!-- https://svelte.dev/docs/svelte/each#Keyed-each-blocks -->
	</div>

	<div style="progressSelect">
		推移データ：
		{#each Object.entries(labels) as [val, lab]}
			<label>
				<input type="radio" name="progressType" value={val} bind:group={progressType} />
				{lab}
			</label> &nbsp;
		{/each}
		<!-- https://svelte.dev/docs/svelte/each#Keyed-each-blocks -->
		<br />
	</div>
</div>

<div class="graphContainer">
	<ProgressGraph
		title={labels[progressType] + '推移'}
		{progressData}
		{revertY}
		suggestedHeight={progressType == 'shimeiPercent' ? 800 : 0}
	/>
</div>

<style>
	.graphContainer {
		/* width: max-content; */
		width: 95%;
		margin: 2em auto;
		/* border: 2px black solid; */
	}
</style>
