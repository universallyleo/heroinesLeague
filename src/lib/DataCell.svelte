<script>
	import { resultTypes } from './processData';
	import RankNumber from './RankNumber.svelte';
	import SubDataCell from './SubDataCell.svelte';
	let { gpResult, n, detailed } = $props();

	// let hasShimei = $derived(gpResult.shimeiNum[n] != null);
	// let hasFC = $derived(gpResult.fcCount[n] != null);
	let { hasShimei, hasFC } = $derived(resultTypes(gpResult, n));
	let hasResult = $derived(gpResult.totalRank[n] > 0);
</script>

<div class="dataCell">
	{#if hasResult}
		{@render mainAndDiff(
			gpResult.getLPt[n],
			parseFloat(gpResult.accumPt[n].toFixed(2)),
			parseFloat(gpResult.accumPtDiff[n].toFixed(2)),
			n > 0 && detailed
		)}

		<div class="subData">
			{#if detailed}
				<SubDataCell
					{hasShimei}
					{hasFC}
					shimeiNum={gpResult.shimeiNum[n]}
					shimeiRank={gpResult.shimeiRank[n]}
					shimeiDiff={gpResult.shimeiDiff[n]}
					fcCount={gpResult.fcCount[n]}
					fcRank={gpResult.fcRank[n]}
					totalRank={gpResult.totalRank[n]}
					countDiff={gpResult.countDiff[n]}
				/>
			{:else}
				<div class="desc" style="display:flex; justify-content: space-between; width: 100%;">
					<div>
						+{gpResult.getLPt[n]} pt
					</div>
					<div>
						( <RankNumber rank={gpResult.totalRank[n]} /> )
					</div>
				</div>
			{/if}
		</div>
	{:else if gpResult.assignedLP[n] === 0}
		{@render mainAndDiff(
			parseFloat(gpResult.accumPt[0].toFixed(2)),
			parseFloat(gpResult.accumPt[n].toFixed(2)),
			'-',
			n > 0 && detailed,
			['assigned']
		)}
		<div class="sub" style="font-size:smaller;">リーグ未参加</div>
	{:else}
		未参加
	{/if}
</div>

{#snippet mainAndDiff(matchpt, accumpt, diffpt, withAddition, addClass = [])}
	<div class={['mainData'].concat(addClass)}>
		{#if withAddition}
			<span style="font-weight:normal;font-size: .65em;color: #777;">
				(+{matchpt})
			</span>
		{/if}
		{accumpt}
	</div>
	<div class="mainDiff">
		<span class="desc">Pt差</span><br />
		{diffpt >= 0 ? diffpt : '-'}
	</div>
{/snippet}

<style>
	.dataCell {
		width: 100%;
		display: grid;
		gap: 2px;
		grid-template-columns: auto 2.2em;
		grid-template-areas:
			'main diff'
			'sub sub';
	}

	.mainData {
		font-size: larger;
		font-weight: bold;
		grid-area: main;
		/* padding-top: 0.2em; */
		align-self: center;
		padding: 0.3em 0;
		background: rgb(214, 236, 248);
	}

	.assigned {
		color: var(--color-theme-1);
	}

	.mainDiff {
		font-size: small;
		grid-area: diff;
		border: 1px solid #999;
	}

	.subData {
		grid-area: sub;
		width: 100%;
	}
	/* 
	.subData {
		grid-area: sub;
		display: grid;
		grid-template-rows: repeat(auto-fit, 1fr);
	}

	.boxed {
		border: 1px solid #555;
	} */

	.desc {
		font-size: smaller;
		color: #777;
		width: fit-content;
		/* background-color: bisque; */
	}
</style>
