<script>
	// @ts-nocheck

	import { getGroup, groupDisplayShort } from '$lib/processData.js';
	let { group, clamp, onclick = {}, addStyle = '' } = $props();
</script>

<button {onclick} style={addStyle}>
	<img
		src={`..\/gpLogo\/${group}.jpg`}
		width={clamp ? '40' : '60'}
		alt={getGroup(group).displayName}
	/>
	<br />
	{clamp ? groupDisplayShort(group) : getGroup(group).displayName}
</button>

<style>
	button {
		all: unset;
		display: block;
		cursor: pointer;
	}
</style>
