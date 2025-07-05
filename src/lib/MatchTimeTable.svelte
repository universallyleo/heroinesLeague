<script>
	import { getGroup, refineTT } from './processData';

	let { timetable } = $props();
	let tt = $derived(refineTT(timetable));
</script>

<div>
	<table class="simpTb">
		<!-- <caption>
			{date} @ {venue}
		</caption> -->
		<thead>
			<tr>
				<th> TIME </th>
				<th> グループ </th>
				<th> 特典会 </th>
			</tr>
		</thead>
		<tbody>
			{#each tt as itm}
				<tr>
					<td> {itm.time[0]} </td>
					{#if itm.group === 'rest'}
						<td colspan="2">
							{parseInt(itm.tokuten[0])} 分休憩
						</td>
					{:else}
						<td> {getGroup(itm.group).displayName} </td>
						<td>
							{#if itm.tokuten[0] === 'after'}
								終演後
							{:else}
								{itm.tokuten[0]} ~ {itm.tokuten[1]}
							{/if}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.simpTb {
		width: fit-content;
		border-spacing: 0 !important;
		border-collapse: collapse;
		display: block;
		margin: 1em auto;
		padding: 0.4em 1em;
		font-family: Arial, Helvetica, sans-serif;
	}

	th {
		border-bottom: black solid 1px;
	}

	td {
		padding: 0.2em 1em;
		vertical-align: bottom;
	}

	td:last-child,
	td:first-child {
		font-weight: normal;
	}
</style>
