<script>
	import { MatchPointsData, CountType, getGroup, groupDisplayShort, ordering } from './processData';
	import RankNumber from './RankNumber.svelte';
	// import { sumArray } from './util';

	let { clamp, gpResults, matchID = 0, hasResults, shimeiTotal, type, mPtsInfo = null } = $props();
	let sortMethod = $state('totalRank');

	let sortedGps = $derived.by(() => {
		let skey = sortMethod ?? 'totalRank';
		// I need this because
		// bind group values get undesireably refreshed to undefined when used inside an each-block

		return type === 'inMatch'
			? gpResults
					.filter(({ activeSince }) => activeSince <= matchID)
					.toSorted((a, b) =>
						skey === 'shimeiNum' || skey === 'totalRank'
							? ordering[skey](a[skey][matchID], b[skey][matchID])
							: ordering['mPts'](a, b, matchID, skey)
					)
			: gpResults;
	});
	let hasMatchPoints = Object.keys(hasResults).reduce(
		(b, key) => b || (key !== 'hasShimei' ? hasResults[key] > 0 : false),
		false
	);

	let guestFCCheck = $derived(
		type === 'guest'
			? gpResults.reduce((flag, { fcRank }) => (flag = flag || fcRank[matchID] > 0), false)
			: true
	); //flag set to true for non-guest

	// let mPtsTotal = $derived(
	// 	type != 'guest'
	// 		? MatchPointsData.map(({ label, countType }) =>
	// 				countType == CountType.RANKED_WITH_VOTE
	// 					? sumArray(
	// 							gpResults.map(
	// 								({ mPts }) => mPts?.[label]?.vote[matchID] ?? null,
	// 								(x) => x !== null
	// 							)
	// 						)
	// 					: (gpResults.mPts?.[label]?.info ?? null)
	// 			)
	// 		: null
	// );
	// $inspect('mPtsTotal: ', mPtsTotal);

	// $inspect(gpResults).with((updateMode, res) => {
	// 	if (type == 'guest') {
	// 		console.log('Showing guest gp result', res.groups);
	// 		console.log(res);
	// 	}
	// });
	// $inspect('matchID: ', matchID, 'sortedGps', sortedGps);
	// let [hasFC, hasAbema, hasMC] = MatchPointsData.map(({ label }) =>
	// 	matchPoints ? label in matchPoints : false
	// );
</script>

{#if !hasResults.hasShimei}
	<div style="font-size: smaller; color: #888;">指名データなし</div>
{/if}
{#if hasResults.FC === 1}
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

{#snippet dataCell(rank, val, options = {})}
	{@const {
		diff = 0,
		vote = null,
		countType = null,
		noNum = false,
		noDecorate = false,
		isTotal = false
	} = options}
	<div class={countType === CountType.RANKED_WITH_VOTE ? 'rkVoteCell' : 'rkDiffCell'}>
		<div class="rk">
			{#if val != null}
				{#if isTotal}
					{rank}位
				{:else}
					<RankNumber {rank} {noNum} {noDecorate} />
				{/if}
			{:else}
				&nbsp; <!-- needed to fix spacing issue -->
			{/if}
		</div>
		<div class="val">
			{val}
		</div>
		{#if countType === CountType.RANKED_WITH_VOTE}
			<div class="vote">{vote}</div>
		{/if}
		{#if diff > 0 && val != null}
			<div class="diff">差 {diff}</div>
		{/if}
	</div>
{/snippet}

<table class="simpTb">
	<thead>
		<tr>
			<th class="sticky headingRow" style="left:0;width:2em;">順位</th>
			<th class="sticky headingRow" style="left:2em;">グループ</th>
			{#if hasResults.hasShimei}
				{@render sortHeader('🎟️入場指名数', 'shimeiNum')}
			{/if}
			{#each MatchPointsData as mpData (mpData.label)}
				{#if hasResults[mpData.label] > 0 && guestFCCheck}
					{@render sortHeader(
						mpData.icon + mpData.jpLabel[0],
						type != 'guest' ? mpData.label : 'fcCount'
					)}
				{/if}
			{/each}

			{#if hasResults.hasShimei && hasMatchPoints}
				{@render sortHeader('総合得点', 'totalRank')}
			{/if}
		</tr>
		{#if shimeiTotal != null && type != 'guest'}
			<tr>
				<th class="sticky headingRow additional_info" style="left:0;width:2em;"> 合計 </th>
				<th class="sticky headingRow" style="left:2em;"> </th>
				<th class="headingRow additional_info" style="font-size:smaller">
					<!-- <div class="rkDiffCell">
						<div class="vote"> -->
					{shimeiTotal}
					<!-- </div>
					</div> -->
				</th>

				{#each MatchPointsData as mpData, i (mpData.label)}
					{#if hasResults[mpData.label] > 0}
						<th class="headingRow additional_info" style="font-size:smaller">
							{mPtsInfo[i] ?? ''}
						</th>
					{/if}
				{/each}
				{#if hasResults.hasShimei && hasMatchPoints}
					<th class="headingRow"> </th>
				{/if}
			</tr>
		{/if}
	</thead>

	<tbody>
		{#each sortedGps as gp (gp)}
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
				{#if hasResults.hasShimei}
					<td class="datacell">
						{@render dataCell(gp.shimeiRank[matchID], gp.shimeiNum[matchID], {
							diff: gp.shimeiDiff[matchID],
							noNum: type === 'inMatch',
							noDecorate: type === 'guest'
						})}
					</td>
				{/if}

				{#if type !== 'guest'}
					{#each MatchPointsData as mpData (mpData.label)}
						{@const lbl = mpData.label}
						{#if hasResults[lbl] > 0}
							<td class="datacell">
								{@render dataCell(gp.mPts[lbl].rank[matchID], gp.mPts[lbl].count[matchID], {
									diff: gp.mPts[lbl].voteDiff[matchID],
									vote: gp.mPts[lbl].vote[matchID],
									countType: mpData.countType,
									noNum: type === 'inMatch'
								})}
							</td>
						{/if}
					{/each}
				{:else}
					<!-- ! May rewrite this part in later future -->
					{#if guestFCCheck}
						<td class="datacell">
							{@render dataCell(gp.fcRank[matchID], gp.fcCount[matchID], {
								noDecorate: type === 'guest'
							})}
						</td>
					{/if}
				{/if}

				{#if hasResults.hasShimei && hasMatchPoints}
					<td class="datacell totalCell">
						{@render dataCell(gp.totalRank[matchID], gp.totalCount[matchID], {
							diff: gp.countDiff[matchID],
							isTotal: true
						})}
					</td>
				{/if}
			</tr>
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

	.additional_info {
		font-size: smaller;
		color: #888;
		font-weight: normal;
		text-align: right;
		justify-self: end;
		padding-right: 1em;
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

	.totalCell {
		border-left: 1px solid #888;
	}

	.rkDiffCell {
		width: 5em;
		margin: 0;
		padding: 0.2em 0.4em;
		display: inline-grid;
		grid-template-columns: 1.8em auto;
		grid-template-areas:
			'rk main'
			'rk diff';
	}

	.rkVoteCell {
		width: fit-content;
		min-width: 8.5em;
		margin: 0;
		padding: 0.2em 0.4em;
		display: inline-grid;
		grid-template-columns: 1.8em 2.5em auto;
		grid-template-areas:
			'rk main vote'
			'rk main diff';
	}

	.rkVoteCell .val {
		align-self: start;
	}

	.vote {
		font-weight: normal;
		grid-area: vote;
		text-align: right;
		justify-self: end;
	}

	.val {
		grid-area: main;
		text-align: right;
		justify-self: end;
		font-weight: bold;
	}

	.rk {
		grid-area: rk;
		font-size: small;
		color: #999;
		align-self: start; /* Align rank to the top */
		font-weight: bold;
	}

	.diff {
		grid-area: diff;
		font-size: small;
		color: #999;
		text-align: right;
		justify-self: end;
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
