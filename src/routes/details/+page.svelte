<script>
	import MatchDetails from '$lib/MatchDetails.svelte';
	import { dataCollec, lastFinishedMatchID, leaguesOfSeason } from '$lib/processData.js';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024); // Default to a common desktop width for SSR
	let clamp = $derived(innerWidth < 600);

	const allSeasons = Object.keys(leaguesOfSeason)
		.map(Number)
		.sort((a, b) => b - a);

	let season = $state(allSeasons[0]);
	let league = $state(1);

	// Dynamically determine which leagues are available for the selected season
	let availableLeagues = $derived(leaguesOfSeason[season] || []);

	// Initialize leagueSeasonData with the initial data.
	let leagueSeasonData = $state(dataCollec({ season: allSeasons[0], league: 1 }));

	$effect(() => {
		const lsd = dataCollec({ season: season, league: league });
		// If the currently selected league is no longer available for the new season,
		// default to the first available league for that season.
		if (!availableLeagues.some((l) => l.league === league)) {
			league = availableLeagues[0]?.league ?? 1;
		}
		// Only update leagueSeasonData if lsd is not null.
		// Otherwise, it retains its previous value.
		if (lsd !== null) {
			leagueSeasonData = lsd;
		}
	});

	// matchID should also handle the case where leagueSeasonData might be null,
	// especially if dataCollec returns null initially and no valid data has been set yet.
	let matchID = $derived(
		leagueSeasonData ? lastFinishedMatchID(leagueSeasonData.extData.matches) : null
	);

	// $inspect(leagueSeasonData);
	//$inspect(leagueSeasonData.extData.matches[match]);

	onMount(() => {
		let rawmatchID = page.url.searchParams.get('match');
		if (rawmatchID != null) {
			let strs = rawmatchID.match(/S(\d+)L(\d+)M(\d+)/);
			if (strs) {
				const sIdx = parseInt(strs[1]);
				const sortedSeasons = [...allSeasons].sort((a, b) => a - b);
				if (sortedSeasons[sIdx - 1]) season = sortedSeasons[sIdx - 1];
				league = parseInt(strs[2]) - 1;
			}
		}
	});
</script>

<section>
	<div class="pageContainer">
		<div style="margin-bottom:1em;">
			年度：
			{#each allSeasons as s (s)}
				<label>
					<input type="radio" name="season" value={s} bind:group={season} />
					{s}
				</label>
			{/each}
		</div>
		<div style="margin-bottom:1em;">
			リーグ：
			{#each availableLeagues as l (l)}
				<label>
					<input type="radio" name="league" value={l.league} bind:group={league} />
					{l.title}
				</label>
			{/each}
		</div>

		<div>
			マッチ選択：
			<select bind:value={matchID}>
				{#each leagueSeasonData?.summary ?? [] as d, j (d.shortdate)}
					<option value={j}> {d.shortdate} @ {d.venue} </option>
				{/each}
			</select>
		</div>
	</div>
	<div class="pageContainer">
		<MatchDetails {clamp} {leagueSeasonData} {matchID} />
	</div>
</section>

<style>
	.pageContainer {
		width: fit-content;
		padding: 1em;
		margin: 0 auto;
	}
</style>
