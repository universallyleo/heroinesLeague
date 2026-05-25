<script>
	import Accordion from '$lib/Accordion.svelte';
	import AccordionItem from '$lib/AccordionItem.svelte';
	import Rules2025 from './Rules2025.svelte';
</script>

<section>
	<Accordion>
		<AccordionItem open={true}>
			{#snippet header()}
				2026年度ルール まとめ
			{/snippet}
			<div>🚧🚧🚧</div>
		</AccordionItem>

		<AccordionItem open={false}>
			{#snippet header()}
				2025年度ルール まとめ
			{/snippet}
			<Rules2025 />
		</AccordionItem>
	</Accordion>
</section>
