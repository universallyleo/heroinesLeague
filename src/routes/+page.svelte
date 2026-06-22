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
	<meta name="description" content="ヒロインズリーグ記録" />
	<meta property="og:site_name" content="ヒロインズリーグ記録" />
	<meta property="og:title" content="ヒロインズリーグ記録" />
	<script type="application/ld+json">
        {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ヒロインズリーグ記録',
            url: 'https://universallyleo.github.io/heroinesLeague/'
        })}
	</script>
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
