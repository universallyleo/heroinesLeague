<script>
	// import Counter from './Counter.svelte';
	// import welcome from '$lib/images/svelte-welcome.webp';
	// import welcomeFallback from '$lib/images/svelte-welcome.png';
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import ProgressTable from '$lib/ProgressTable.svelte';
	import { leagueOne, leagueTwo } from '$lib/processData.js';

	let innerWidth = $state(0);
	// $inspect('innerWidth: ', innerWidth);
</script>

<svelte:head>
	<title>HEROINES League 結果まとめ</title>
	<meta name="description" content="Heroines League" />
</svelte:head>

<svelte:window bind:innerWidth />

{#snippet leagueAccord(name, data, open = false)}
	<AccordionItem {open}>
		{#snippet header()}{name}{/snippet}
		<ProgressTable rawdata={data} clamp={innerWidth < 600}></ProgressTable>
	</AccordionItem>
{/snippet}

<section>
	{#if innerWidth <= 1080}
		<Accordion>
			{@render leagueAccord('League 1', leagueOne[0], true)}
			{@render leagueAccord('League 2', leagueTwo[0], true)}
		</Accordion>
	{:else}
		<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1px;">
			<Accordion>
				{@render leagueAccord('League 1', leagueOne[0], true)}
			</Accordion>
			<Accordion>
				{@render leagueAccord('League 2', leagueTwo[0], true)}
			</Accordion>
		</div>
	{/if}
</section>

<style>
</style>
