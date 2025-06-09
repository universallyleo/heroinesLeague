<script>
	// import Counter from './Counter.svelte';
	// import welcome from '$lib/images/svelte-welcome.webp';
	// import welcomeFallback from '$lib/images/svelte-welcome.png';
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';
	import { leagueOne, leagueTwo } from '$lib/processData.js';

	let innerWidth = $state(0);
	let flexCol = $derived(innerWidth <= 1080);
	$inspect(flexCol);
</script>

<svelte:head>
	<title>HEROINES League 結果まとめ</title>
	<meta name="description" content="Heroines League" />
</svelte:head>

<svelte:window bind:innerWidth />

{#snippet leagueAccord(name, data, open = false)}
	<AccordionItem {open}>
		{#snippet header()}{name}{/snippet}
		<ProgressTable rawdata={data}></ProgressTable>
	</AccordionItem>
{/snippet}

<section>
	{#if flexCol}
		<Accordion>
			{@render leagueAccord('League 1', leagueOne[0], true)}
			{@render leagueAccord('League 2', leagueTwo[0], true)}
		</Accordion>
	{:else}
		<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1px;">
			<div>
				{@render leagueAccord('League 1', leagueOne[0], true)}
			</div>
			<div>
				{@render leagueAccord('League 2', leagueTwo[0], true)}
			</div>
		</div>
	{/if}
</section>

<style>
</style>
