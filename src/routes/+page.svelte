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

	let pageData = [
		{ league: 1, data: leagueOne[0], elt: null },
		{ league: 2, data: leagueTwo[0], elt: null }
	];
</script>

<svelte:head>
	<title>HEROINES League 結果まとめ</title>
	<meta name="description" content="Heroines League" />
</svelte:head>

<svelte:window bind:innerWidth />

{#snippet leagueAccord(data, open = false)}
	<AccordionItem {open}>
		{#snippet header()}
			リーグ{data.league} 結果
		{/snippet}
		<ProgressTable rawdata={data.data} clamp={innerWidth < 600} />
	</AccordionItem>
{/snippet}

<section>
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
</section>

<style>
</style>
