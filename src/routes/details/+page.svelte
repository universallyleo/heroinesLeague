<script>
	import MatchDetails from '$lib/MatchDetails.svelte';
	// import Counter from './Counter.svelte';
	// import welcome from '$lib/images/svelte-welcome.webp';
	// import welcomeFallback from '$lib/images/svelte-welcome.png';
	import {
		CalculateLeagueResult,
		extractSummaryFromLeagueResExt,
		leagueOne,
		leagueTwo,
		partitionResultToSortedGroups
	} from '$lib/processData.js';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { clamp } = $props();
	let leagueData = [leagueOne[0], leagueTwo[0]]; //!!! need to change this if going into season 2 !!!
	let league = $state(1);
	let match = $state(0);

	let leagueResultExt = $derived(CalculateLeagueResult(leagueData[league]));
	// $inspect('leagueResultExt', leagueResultExt);
	let gpResults = $derived(partitionResultToSortedGroups(leagueResultExt));
	// $inspect('gpResults', gpResults);

	let headingRowData = $derived(extractSummaryFromLeagueResExt(leagueResultExt));
	// $inspect('headingRowData: ', headingRowData);

	onMount(() => {
		let rawmatchID = page.url.searchParams.get('match');
		if (rawmatchID != null) {
			let strs = rawmatchID.match(/L(\d+)M(\d+)/);
			if (strs) {
				league = parseInt(strs[1]) - 1;
				match = parseInt(strs[2]) - 1;
			}
		}
	});
</script>

<section>
	<div class="pageContainer">
		リーグ：
		{#each { length: 2 }, i}
			<label> <input type="radio" name="league" value={i} bind:group={league} /> {i + 1} </label> &nbsp;
		{/each}

		マッチ選択：
		<select bind:value={match}>
			{#each headingRowData as d, j}
				<option value={j}> {d.shortdate} @ {d.venue} </option>
			{/each}
		</select>
	</div>
	<div class="pageContainer">
		<MatchDetails
			{clamp}
			league={league + 1}
			rawMatch={leagueData[league].matches[match]}
			matchID={match}
			{gpResults}
			match={headingRowData[match]}
			guestResults={leagueResultExt.matches[match]?.guestResults ?? []}
		/>
	</div>
</section>

<style>
	.pageContainer {
		width: fit-content;
		padding: 1em;
		margin: 0 auto;
	}
</style>
