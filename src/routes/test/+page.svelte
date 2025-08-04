<script>
	import Carousel from '$lib/Carousel.svelte';

	let dataset = ['09/11', '10/01', '11/12'];
</script>

<h2>🚧 工事中 🚧</h2>

<Carousel {dataset} selected={0}></Carousel>
