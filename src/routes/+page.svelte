<script>
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';

	import { dataCollection } from '$lib/processData.js';

	let innerWidth = $state(0);
	// $inspect('innerWidth: ', innerWidth);

	let selectedSeason = 1;
	let leagueData = [dataCollection[1][selectedSeason - 1], dataCollection[2][selectedSeason - 1]];
	let playoffsData = [dataCollection[3][0]];
	let champLeagueData = [dataCollection[0][0]];
</script>

<svelte:head>
	<title>HEROINES League 結果まとめ</title>
	<meta name="description" content="Heroines League" />
</svelte:head>

<svelte:window bind:innerWidth />

{#snippet leagueAccord(leagueData, title, open = false)}
	<AccordionItem {open}>
		{#snippet header()}
			{title} 結果
		{/snippet}
		<ProgressTable {leagueData} clamp={innerWidth < 600} />
	</AccordionItem>
{/snippet}

<section>
	<Accordion>
		{@render leagueAccord(champLeagueData[0], '決勝リーグ', true)}
		{@render leagueAccord(playoffsData[0], '入れ替え戦', true)}
		{@render leagueAccord(leagueData[0], 'リーグ1', false)}
		{@render leagueAccord(leagueData[1], 'リーグ2', false)}
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
