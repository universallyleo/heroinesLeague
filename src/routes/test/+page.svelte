<script>
	import { dataCollection, extractLastMatchDataByGroups } from '$lib/processData.js';
	// import Carousel from '$lib/Carousel.svelte';

	// let dataset = ['09/11', '10/01', '11/12'];
	let league = $state(1);
	let rec = $derived(extractLastMatchDataByGroups(dataCollection[league][0]));
</script>

<h2>🚧 試算表 工事中 🚧</h2>

<!-- <Carousel {dataset} selected={0}></Carousel> -->

<div>
	リーグ：
	{#each { length: 2 }, i}
		<label><input type="radio" name="league" value={i} bind:group={league} /> {i + 1} </label>
	{/each}
</div>

<table>
	<thead> </thead>
	<tbody></tbody>
</table>
