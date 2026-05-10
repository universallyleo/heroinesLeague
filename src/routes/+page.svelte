<script>
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';

	import { dataCollec } from '$lib/processData.js';

	let innerWidth = $state(0);
	// $inspect('innerWidth: ', innerWidth);

	let leagueOneData = dataCollec({ season: 2026, league: 1 });
	let leagueTwoData = dataCollec({ season: 2026, league: 2 });
	// $inspect(leagueData);
</script>

<svelte:head>
	<title>HEROINES League 結果まとめ</title>
	<meta name="description" content="Heroines League" />
</svelte:head>

<svelte:window bind:innerWidth />

{#snippet leagueAccord(lsData, open = false)}
	<AccordionItem {open}>
		{#snippet header()}
			{lsData.title} 結果
		{/snippet}
		<ProgressTable leagueSeasonData={lsData} clamp={innerWidth < 600} />
	</AccordionItem>
{/snippet}

<section>
	<Accordion>
		{@render leagueAccord(leagueOneData, true)}
		{@render leagueAccord(leagueTwoData, true)}
	</Accordion>
</section>

<style>
</style>
