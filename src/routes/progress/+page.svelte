<script>
	import {
		dataCollec,
		matchDates,
		leaguesOfSeason,
		LeagueType,
		seriesFromResult
	} from '$lib/processData.js';
	import ProgressGraph from '$lib/ProgressGraph.svelte';

	const selectableSeasons = [2026, 2025];
	const selectableLeagues = {
		2025: [LeagueType.ONE, LeagueType.TWO, LeagueType.CHAMP, LeagueType.PLAYOFFS],
		2026: [LeagueType.ONE, LeagueType.TWO]
	};
	let season = $state(2026);
	let league = $state(LeagueType.TWO);
	let selectedData = $derived(dataCollec({ season: season, league: league }));
	// $inspect('selectedData: ', selectedData);

	let progressType = $state('accumRank');
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
		年度：
		{#each selectableSeasons as S (S)}
			<label>
				<input type="radio" name="season" value={S} bind:group={season} />
				{S}
			</label>
		{/each}
	</div>

	<div>
		リーグ：
		{#each selectableLeagues[season] as L (L)}
			<label>
				<input type="radio" name="league" value={L} bind:group={league} />
				{leaguesOfSeason[season].find(({ league }) => league === L).title}
			</label>
		{/each}
	</div>

	<div style="progressSelect">
		推移データ：
		{#if selectableLeagues[season].indexOf(league) > -1}
			{#each Object.entries(labels) as [val, lab] (lab)}
				<label>
					<input type="radio" name="progressType" value={val} bind:group={progressType} />
					{lab}
				</label> &nbsp;
			{/each}
		{/if}
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
