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
		<div style="margin-bottom:1em;">
			リーグ：
			{#each [3, 0, 1, 2] as i}
				<label>
					<input type="radio" name="league" value={i} bind:group={league} />
					{dataCollection[i][0].title}
				</label>
			{/each}
		</div>

		<div>
			マッチ選択：
			<select bind:value={match}>
				{#each leagueSeasonData.summary as d, j}
					<option value={j}> {d.shortdate} @ {d.venue} </option>
				{/each}
			</select>
		</div>
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
