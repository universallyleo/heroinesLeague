<script>
	import { getGroup, groupDisplayShort, ordering, resultTypes } from './processData';
	import RankNumber from './RankNumber.svelte';

	let { clamp, gpResults, matchID = 0, type } = $props();
	let sortMethod = $state('totalRank');

	let { hasShimei, hasFC } = $derived(resultTypes(gpResults[0], matchID));
	// $inspect('matchID: ', matchID, 'sortMethod: ', sortMethod);
	let sortedGps = $derived(
		(() => {
			let sm = sortMethod ?? 'totalRank';
			// I need this because
			// bind group values get undesireably refreshed to undefined when used inside an each-block
			return type === 'inMatch'
				? gpResults.toSorted((a, b) => ordering[sm](a[sm][matchID], b[sm][matchID]))
				: gpResults;
		})()
	);
	// $inspect('matchID: ', matchID, 'sortedGps', sortedGps);
</script>

{#if !hasShimei}
	<div style="font-size: smaller; color: #888;">指名データなし</div>
{/if}
{#if !hasFC}
	<div style="font-size: smaller; color: #888;">FC得点データなし</div>
{/if}

{#snippet sortHeader(label, sortKey)}
	<th class="headingRow">
		<label class="sortHeader">
			{label}
			<input type="radio" value={sortKey} name="sortMethod" bind:group={sortMethod} />
			<span class={['icon', sortMethod === sortKey ? 'selected' : 'unselected']}></span>
		</label>
	</th>
{/snippet}

<table class="simpTb">
	<thead>
		<tr>
			<th class="sticky headingRow" style="left:0;width:2em;">順位</th>
			<th class="sticky headingRow" style="left:2em;">グループ</th>
			{#if hasShimei}
				{@render sortHeader('入場指名数', 'shimeiNum')}
			{/if}
			{#if hasFC}
				{@render sortHeader('FC投票得点', 'fcCount')}
			{/if}
			{#if hasShimei && hasFC}
				{@render sortHeader('総合得点', 'totalRank')}
			{/if}
		</tr>
	</thead>

	<tbody>
		{#each sortedGps as gp}
			{#if gp.totalRank[matchID] != null}
				<tr>
					<td class="headingCell sticky" style="font-size: small;left:0;">
						<RankNumber
							rank={gp.totalRank[matchID]}
							noNum={type === 'inMatch'}
							noDecorate={type === 'guest'}
						/>
					</td>
					<td class="headingCell sticky gpLogo" style="font-size:smaller;left:2em;">
						{clamp ? groupDisplayShort(gp.group) : getGroup(gp.group).displayName}
					</td>
					{#if hasShimei}
						<td class="datacell">
							<div class="rkDiffCell">
								<div class="rk">
									<RankNumber
										rank={gp.shimeiRank[matchID]}
										noNum={type === 'inMatch'}
										noDecorate={type === 'guest'}
									/>
								</div>
								<div class="val">
									{gp.shimeiNum[matchID]}
								</div>
								{#if gp.shimeiDiff[matchID] > 0}
									<div class="diff">差 {gp.shimeiDiff[matchID]}</div>
								{/if}
							</div>
						</td>
					{/if}

					{#if hasFC}
						<td class="datacell">
							<div class="rkDiffCell">
								<div class="rk">
									<RankNumber
										rank={gp.fcRank[matchID]}
										noNum={type === 'inMatch'}
										noDecorate={type === 'guest'}
									/>
								</div>
								<div class="val">
									{gp.fcCount[matchID]}
								</div>
							</div>
						</td>
					{/if}
					{#if hasShimei && hasFC}
						<td class="datacell">
							<div class="rkDiffCell">
								<div class="rk">{gp.totalRank[matchID]}位</div>
								<div class="val">
									{gp.shimeiNum[matchID] + gp.fcCount[matchID]}
								</div>
								{#if gp.countDiff[matchID] > 0}
									<div class="diff">差 {gp.countDiff[matchID]}</div>
								{/if}
							</div>
						</td>
					{/if}
				</tr>
			{/if}
		{/each}
	</tbody>
</table>

<style>
	.sortHeader {
		cursor: pointer;
		/* display: inline-block;
		position: relative;
		padding-right: 1.5em; */
		display: flex;
		align-items: center;
		padding-left: 0.6em;
	}
	.sortHeader input[type='radio'] {
		display: none;
	}
	.sortHeader .icon {
		width: 1.1em;
		height: 1em;
		background-size: contain;
		background-repeat: no-repeat;
		display: inline-block;
		margin-left: 0.2em;
	}
	.sortHeader .unselected {
		background-image: url('./images/caret-sort.svg');
	}
	.sortHeader .selected {
		background-image: url('./images/caret-down.svg');
	}

	td:first-child {
		border-left: 1px solid #ddd;
	}

	td:last-child {
		border-right: 1px solid #ddd;
	}

	.simpTb {
		width: fit-content;
		border-spacing: 0 !important;
		border-collapse: collapse;
		display: block;
		margin: 1em auto;
		padding: 0.4em 1em;
		font-family: Arial, Helvetica, sans-serif;
	}

	.headingRow {
		border-bottom: 1px solid #ddd;
		background-color: white;
	}

	.datacell {
		border-right: 1px dashed #999;
		border-bottom: 1px solid #ddd;
		text-align: right;
	}

	.rkDiffCell {
		width: 5em;
		margin: 0;
		padding: 0.2em 0.4em;
		display: grid;
		grid-template-columns: 1.8em 2.8em;
		grid-template-areas:
			'rk main'
			'rk diff';
	}

	.val {
		grid-area: main;
		text-align: right;
		justify-self: end;
	}

	.rk {
		grid-area: rk;
		font-size: small;
		color: #999;
	}

	.diff {
		grid-area: diff;
		font-size: small;
		color: #999;
	}

	.sticky {
		background-color: white;
		position: sticky;
		z-index: 2;
	}
	.headingCell {
		border: 1px solid #ddd;
		vertical-align: middle;
	}

	@media (min-width: 350px) {
		.headingCell {
			padding-left: 0.4em;
			padding-right: 0.2em;
		}
	}
	.gpLogo {
		vertical-align: middle;
	}
</style>
