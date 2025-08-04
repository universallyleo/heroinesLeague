<script>
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';

	import { dataCollection } from '$lib/processData.js';

	let innerWidth = $state(0);
	// $inspect('innerWidth: ', innerWidth);

	let selectedSeason = 1;
	let leagueData = [dataCollection[0][selectedSeason - 1], dataCollection[1][selectedSeason - 1]];
</script>

<svelte:head>
	<title>HEROINES League 結果まとめ</title>
	<meta name="description" content="Heroines League" />
</svelte:head>

<svelte:window bind:innerWidth />

{#snippet leagueAccord(leagueData, open = false)}
	<AccordionItem {open}>
		{#snippet header()}
			リーグ{leagueData.league} 結果
		{/snippet}
		<ProgressTable {leagueData} clamp={innerWidth < 600} />
	</AccordionItem>
{/snippet}

<section>
	<Accordion>
		{@render leagueAccord(leagueData[0], true)}
		{@render leagueAccord(leagueData[1], true)}
	</Accordion>
</section>

<!-- 
{#snippet leagueAccord(data, open = false)}
	<AccordionItem {open}>
		{#snippet header()}
			リーグ{data.league} 結果
		{/snippet}
		<ProgressTable rawdata={data.data} clamp={innerWidth < 600} />
	</AccordionItem>
{/snippet} -->

<!-- <section>
	{#if innerWidth <= 1080}
	<Accordion>
		{@render leagueAccord(pageData[0], true)}
		{@render leagueAccord(pageData[1], true)}
	</Accordion>
	{:else}
	<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1px;">
			<Accordion>
				{@render leagueAccord(pageData[0], true)}
			</Accordion>
			<Accordion>
				{@render leagueAccord(pageData[1], true)}
			</Accordion>
		</div>
	{/if}
	</section> -->

<style>
</style>
