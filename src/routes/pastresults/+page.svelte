<script>
	import { flip } from 'svelte/animate';
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';
	import { onMount } from 'svelte';
	import { saveLocalState } from '$lib/localState.js';

	import { dataCollec } from '$lib/processData.js';

	let innerWidth = $state(0);

	let activeTitle = $state(null);
	let orderTitle = $state(null);
	let loaded = $state(false);
	const leagueOrder = [4, 0, 3, 2, 1]; // gradeUp, champ, playoffs, league 2, league 1

	const allLeagues = leagueOrder.map((i) => dataCollec({ season: 2025, league: i }));
	const defaultOpenAccordions = Object.fromEntries(allLeagues.map(({ title }) => [title, false]));
	const leagueTitles = allLeagues.map(({ title }) => title);
	const defaultState = {
		activeTitle: null,
		orderTitle: null,
		openAccordions: defaultOpenAccordions
	};
	let openAccordions = $state(defaultOpenAccordions);

	let sortedLeagues = $derived.by(() => {
		if (!leagueTitles.includes(orderTitle)) return allLeagues;
		const target = allLeagues.find((l) => l.title === orderTitle);
		const others = allLeagues.filter((l) => l.title !== orderTitle);
		return target ? [...others, target] : allLeagues;
	});

	function isSavedState(value) {
		if (value == null || typeof value !== 'object' || Array.isArray(value)) return false;
		if (!(value.activeTitle === null || leagueTitles.includes(value.activeTitle))) return false;
		if (!(value.orderTitle === null || leagueTitles.includes(value.orderTitle))) return false;
		if (
			value.openAccordions == null ||
			typeof value.openAccordions !== 'object' ||
			Array.isArray(value.openAccordions)
		) {
			return false;
		}
		return leagueTitles.every((title) => typeof value.openAccordions[title] === 'boolean');
	}

	function loadPastResultsState() {
		if (typeof localStorage === 'undefined') return defaultState;
		try {
			const raw = localStorage.getItem('heroines-league:pastresults');
			if (raw == null) return defaultState;
			const savedState = JSON.parse(raw);
			return isSavedState(savedState) ? savedState : defaultState;
		} catch {
			return defaultState;
		}
	}

	onMount(() => {
		const savedState = loadPastResultsState();
		activeTitle = savedState.activeTitle;
		orderTitle = savedState.orderTitle;
		const openTitle =
			activeTitle ??
			allLeagues.find(({ title }) => savedState.openAccordions?.[title] === true)?.title ??
			null;
		openAccordions = Object.fromEntries(
			allLeagues.map(({ title }) => [title, title === openTitle])
		);
		loaded = true;
	});

	$effect(() => {
		if (loaded) {
			saveLocalState('heroines-league:pastresults', {
				activeTitle,
				orderTitle,
				openAccordions: Object.fromEntries(
					allLeagues.map(({ title }) => [title, openAccordions[title]])
				)
			});
		}
	});

	function toggleActive(title, e) {
		e.stopPropagation();
		if (openAccordions[title]) {
			// Just close the current one, don't change order
			activeTitle = null;
			openAccordions = { ...defaultOpenAccordions };
		} else {
			orderTitle = title; // (2) Reorder: move clicked item to bottom
			// (3) After reordering animation, open the tab
			setTimeout(
				() => {
					activeTitle = title;
					openAccordions = { ...defaultOpenAccordions, [title]: true };
				},
				450 // Matches flip duration (400) + small buffer
			);
		}
	}
</script>

{#snippet leagueAccord(lsData)}
	<AccordionItem bind:open={openAccordions[lsData.title]}>
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
		<ProgressTable
			leagueSeasonData={lsData}
			clamp={innerWidth < 600}
			storageKey={`heroines-league:pastresults:${lsData.title}:table`}
		/>
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
