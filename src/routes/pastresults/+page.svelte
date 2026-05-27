<script>
	import { flip } from 'svelte/animate';
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';

	import { dataCollec } from '$lib/processData.js';

	let innerWidth = $state(0);

	let activeTitle = $state(null);
	let orderTitle = $state(null);
	const leagueOrder = [4, 0, 3, 2, 1]; // gradeUp, champ, playoffs, league 2, league 1

	const allLeagues = leagueOrder.map((i) => dataCollec({ season: 2025, league: i }));

	let sortedLeagues = $derived.by(() => {
		if (!orderTitle) return allLeagues;
		const target = allLeagues.find((l) => l.title === orderTitle);
		const others = allLeagues.filter((l) => l.title !== orderTitle);
		return [...others, target];
	});

	function toggleActive(title, e) {
		e.stopPropagation();
		if (activeTitle === title) {
			// Just close the current one, don't change order
			activeTitle = null;
		} else {
			activeTitle = null; // (1) Close all accordions first
			orderTitle = title; // (2) Reorder: move clicked item to bottom
			// (3) After reordering animation, open the tab
			setTimeout(
				() => {
					activeTitle = title;
				},
				450 // Matches flip duration (400) + small buffer
			);
		}
	}
</script>

{#snippet leagueAccord(lsData)}
	<AccordionItem open={activeTitle === lsData.title}>
		{#snippet header()}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onclick={(e) => toggleActive(lsData.title, e)}
				style="cursor: pointer; width: 100%; height: 100%; margin: -1rem; padding: 1rem;"
			>
				{lsData.title} 結果
			</div>
		{/snippet}
		<ProgressTable leagueSeasonData={lsData} clamp={innerWidth < 600} />
	</AccordionItem>
{/snippet}

<section>
	<h2>2025年度結果まとめ</h2>
	<Accordion>
		{#each sortedLeagues as lsData (lsData.title)}
			<div animate:flip={{ duration: 400 }}>
				{@render leagueAccord(lsData)}
			</div>
		{/each}
	</Accordion>
</section>
