<script>
	let { opts = $bindable({}) } = $props();
</script>

<div class="container">
	<label>
		<input type="checkbox" bind:checked={opts.simpleTable} /> マッチ得点と累計のみ
	</label>
</div>

<style>
	.container {
		width: max-content;
		margin: 0 auto;
		padding: 2px 6px;
		border: 1px solid black;
		display: flex;
	}
</style>
