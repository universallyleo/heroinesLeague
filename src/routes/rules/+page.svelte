<script>
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import Rules2025 from './Rules2025.svelte';
	import { onMount } from 'svelte';
	import { loadLocalState, saveLocalState } from '$lib/localState.js';

	let openAccordions = $state({
		rules2026: false,
		rules2025: true
	});
	let loaded = $state(false);

	onMount(() => {
		openAccordions = loadLocalState('heroines-league:rules', openAccordions);
		loaded = true;
	});

	$effect(() => {
		if (loaded) {
			saveLocalState('heroines-league:rules', {
				rules2026: openAccordions.rules2026,
				rules2025: openAccordions.rules2025
			});
		}
	});
</script>

<section>
	<Accordion>
		<AccordionItem bind:open={openAccordions.rules2026}>
			{#snippet header()}
				2026年度ルール まとめ
			{/snippet}
			<div>🚧🚧🚧</div>
		</AccordionItem>

		<AccordionItem bind:open={openAccordions.rules2025}>
			{#snippet header()}
				2025年度ルール まとめ
			{/snippet}
			<Rules2025 />
		</AccordionItem>
	</Accordion>
</section>
