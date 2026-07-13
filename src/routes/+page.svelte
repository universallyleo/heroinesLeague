<script>
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';
	import { onMount } from 'svelte';
	import { loadLocalState, saveLocalState } from '$lib/localState.js';

	import { dataCollec } from '$lib/processData.js';

	let innerWidth = $state(0);
	// $inspect('innerWidth: ', innerWidth);

	let leagueOneData = dataCollec({ season: 2026, league: 1 });
	let leagueTwoData = dataCollec({ season: 2026, league: 2 });
	let openAccordions = $state({
		league1: true,
		league2: true
	});
	let loaded = $state(false);
	// $inspect(leagueData);

	onMount(() => {
		openAccordions = loadLocalState('heroines-league:main', openAccordions);
		loaded = true;
	});

	$effect(() => {
		if (loaded) {
			saveLocalState('heroines-league:main', {
				league1: openAccordions.league1,
				league2: openAccordions.league2
			});
		}
	});
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

{#snippet leagueAccord(lsData, openKey)}
	<AccordionItem bind:open={openAccordions[openKey]}>
		{#snippet header()}
			{lsData.title} 結果
		{/snippet}
		<ProgressTable
			leagueSeasonData={lsData}
			clamp={innerWidth < 600}
			storageKey={`heroines-league:main:${openKey}:table`}
		/>
	</AccordionItem>
{/snippet}

<section>
	<Accordion>
		{@render leagueAccord(leagueOneData, 'league1')}
		{@render leagueAccord(leagueTwoData, 'league2')}
	</Accordion>
</section>

<style>
</style>
