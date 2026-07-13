<script>
	let { opts = $bindable({}) } = $props();
</script>

<div class="container">
	<label>
		<input type="checkbox" bind:checked={opts.detailTable} /> 得点詳細
	</label>
</div>

<style>
	.container {
		width: fit-content;
		/* margin: 0 auto; */
		padding: 2px 6px;
		border: 1px solid var(--color-border-strong);
		display: flex;
	}
</style>
