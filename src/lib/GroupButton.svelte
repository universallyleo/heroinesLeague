<script>
	// @ts-nocheck

	import { getGroup, groupDisplayShort } from '$lib/processData.js';
	let { group, clamp, showIcon = true, onclick = () => {}, addStyle = '' } = $props();
</script>

{#if group !== ''}
	<button {onclick} style={addStyle}>
		{#if showIcon}
			<img
				src={`..\/gpLogo\/${group}.jpg`}
				width={clamp ? '40' : '60'}
				alt={getGroup(group).displayName}
			/>
			<br />
		{/if}
		{clamp ? groupDisplayShort(group) : getGroup(group).displayName}
	</button>
{/if}

<style>
	button {
		all: unset;
		display: block;
		cursor: pointer;
	}
</style>
