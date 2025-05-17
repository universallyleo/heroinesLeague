<script>
	let { children, ...restProps } = $props();
</script>

<div style="width: 100%; display:flex; flex-direction: column; gap:0;" {...restProps}>
	{@render children()}
</div>
