<script>
	import { getGroup, groupDisplayShort, resultTypes } from './processData';

	let { clamp, gpResults, matchID = 0, type } = $props();

	let { hasShimei, hasFC } = $derived(resultTypes(gpResults[0], matchID));
	let sortedGps = $derived(
		type === 'inMatch'
			? gpResults.toSorted((a, b) => a.totalRank[matchID] - b.totalRank[matchID])
			: gpResults
	);
</script>

<table class="simpTb">
	<thead>
		<tr>
			<th class="sticky headingRow" style="left:0;width:1em;">順</th>
			<th class="sticky headingRow" style="left:1.7em;">グループ</th>
			{#if hasShimei}
				<th class="headingRow">指名入場数</th>
			{/if}
			{#if hasFC}
				<th class="headingRow">FC投票得点</th>
			{/if}
			{#if hasShimei && hasFC}
				<th class="headingRow">総合得点</th>
			{/if}
		</tr>
	</thead>

	<tbody>
		{#each sortedGps as gp, i}
			<tr>
				<td class="headingCell sticky" style="left:0;">{i + 1}</td>
				<td class="headingCell sticky gpLogo" style="font-size:smaller;left:1.7em;">
					<!-- <img
									src={`.\/gpLogo\/${gpResults[n - 1].group}.jpg`}
									width={clamp ? '40' : '60'}
									alt={getGroup(gpResults[n - 1].group).displayName}
								/> 
								<br /> -->
					{clamp ? groupDisplayShort(gp.group) : getGroup(gp.group).displayName}
				</td>
				{#if hasShimei}
					<td class="datacell">
						<div class="rkDiffCell">
							<div class="rk">{gp.shimeiRank[matchID]}位</div>
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
							<div class="rk">{gp.fcRank[matchID]}位</div>
							<div class="val">
								{gp.fcCount[matchID]}
							</div>
						</div>
					</td>
				{/if}
				{#if hasShimei && hasFC}
					<td class="datacell">
						<div class="rkDiffCell">
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
		{/each}
	</tbody>
</table>

<style>
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

	/* From W3C: https://www.w3schools.com/howto/howto_css_modals.asp */
	/* The Modal (background) */
	.modal {
		display: none; /* Hidden by default */
		position: fixed; /* Stay in place */
		z-index: 3; /* Sit on top */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		overflow: auto; /* Enable scroll if needed */
		background-color: rgb(0, 0, 0); /* Fallback color */
		background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
	}
</style>
