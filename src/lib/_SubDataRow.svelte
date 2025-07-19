<script>
	import { padNum } from '$lib/util.js';
	let { label, pt, diff = null, rank = null, border = true, pad = 3, addStyle = null } = $props();

	const rkStr = $derived(rank ? `${rank}位` : '');
</script>

<div class="subDataRow" style={addStyle}>
	<div class="desc">{label}</div>
	<div class="desc">{rkStr}</div>
	<div class="subpt" style:border-right={border ? '1px solid #777' : ''}>
		{@html padNum(pt, pad)}
	</div>
	{#if diff}
		<div class="subdiff">
			<span class="desc">差</span>
			{@html padNum(diff, pad)}
		</div>
	{/if}
</div>

<style>
	.subDataRow {
		font-family: monospace;
		font-size: 0.9375em;
		display: grid;
		grid-template-columns: 2em 1.8em 2.2em auto;
	}
	/* 
	.subDataRow:first-child {
		border-top: 1px solid #555;
	} */

	.desc {
		font-size: smaller;
		color: #777;
		width: fit-content;
	}

	.subpt {
		text-align: start;
		padding-right: 0.4em;
	}

	.subdiff {
		text-align: right;
		padding-left: 0.3em;
		padding-right: 0.3em;
	}
</style>
