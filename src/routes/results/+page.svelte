<script>
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';

	import { dataCollection } from '$lib/processData.js';

	let innerWidth = $state(0);
	// $inspect('innerWidth: ', innerWidth);

	let leagueData = [dataCollection[1][0], dataCollection[2][0]];
	let playoffsData = [dataCollection[3][0]];
	let champLeagueData = [dataCollection[0][0]];
	let gradeUpData = [dataCollection[4][0]];
</script>

{#snippet leagueAccord(lsData, open = false)}
	<AccordionItem {open}>
		{#snippet header()}
			{lsData.title} 結果
		{/snippet}
		<ProgressTable leagueSeasonData={lsData} clamp={innerWidth < 600} />
	</AccordionItem>
{/snippet}

<section>
	<h2>2025年度結果まとめ</h2>
	<Accordion>
		{@render leagueAccord(gradeUpData[0], true)}
		{@render leagueAccord(champLeagueData[0], false)}
		{@render leagueAccord(playoffsData[0], false)}
		{@render leagueAccord(leagueData[1], false)}
		{@render leagueAccord(leagueData[0], false)}
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
