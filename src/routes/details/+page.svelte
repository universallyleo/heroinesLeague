<script>
	import MatchDetails from '$lib/MatchDetails.svelte';
	import { dataCollection } from '$lib/processData.js';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { clamp } = $props();
	let league = $state(1);
	let match = $state(0);
	let leagueSeasonData = $derived(dataCollection[league][0]); //second index is for "season"

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
			{#each leagueSeasonData.summary as d, j}
				<option value={j}> {d.shortdate} @ {d.venue} </option>
			{/each}
		</select>
	</div>
	<div class="pageContainer">
		<MatchDetails
			{clamp}
			league={league + 1}
			rawMatch={leagueSeasonData.extData.matches[match]}
			matchID={match}
			gpResults={leagueSeasonData.resByGp}
			match={leagueSeasonData.summary[match]}
			guestResults={leagueSeasonData.extData.matches[match]?.guestResults ?? []}
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
