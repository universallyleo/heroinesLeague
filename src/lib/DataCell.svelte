<script>
	import { resultTypes } from './processData';
	import RankNumber from './RankNumber.svelte';
	import SubDataCell from './SubDataCell.svelte';
	let { gpResult, n, detailed } = $props();

	// let hasShimei = $derived(gpResult.shimeiNum[n] != null);
	// let hasFC = $derived(gpResult.fcCount[n] != null);
	let { hasShimei, hasFC } = $derived(resultTypes(gpResult, n));
	let hasResult = $derived(gpResult.accumPt[n] > 0);
</script>

<div class="dataCell">
	<!-- style:grid-template-columns={detailed ? `auto 2em` : `2em 1.5em`} -->
	{#if hasResult}
		<div class="mainData">
			{#if n > 0 && detailed}
				<span style="font-weight:normal;font-size: .65em;color: #777;">
					(+{gpResult.getPt[n]})
				</span>
			{/if}
			{gpResult.accumPt[n]}
		</div>
		<div class="mainDiff">
			<span class="desc">Pt差</span><br />
			{gpResult.accumPtDiff[n] >= 0 ? gpResult.accumPtDiff[n] : '-'}
		</div>
		<!-- <div class={['subData', detailed && (hasShimei || hasFC) ? 'boxed' : '']}>
			{#if detailed}
				{#if hasShimei}
					<SubDataRow label="入場" pt={gpResult.shimeiNum[n]} diff={gpResult.shimeiDiff[n]} />
				{/if}
				{#if hasFC}
					<SubDataRow label="ＦＣ" pt={gpResult.fcCount[n]} rank={gpResult.fcRank[n]} />
				{/if}
				{#if hasShimei && hasFC}
					<SubDataRow
						label="合計"
						pt={gpResult.shimeiNum[n] + gpResult.fcCount[n]}
						diff={gpResult.countDiff[n]}
						addStyle="border-top:1px solid #777;"
					/>
				{/if}
			{/if}
			<SubDataRow
				label="得点"
				rank={gpResult.totalRank[n]}
				pt={gpResult.getPt[n]}
				border={detailed && hasShimei}
			/>
		</div> -->

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
						+{gpResult.getPt[n]} pt
					</div>
					<div>
						( <RankNumber rank={gpResult.totalRank[n]} /> )
					</div>
				</div>
			{/if}
		</div>
	{:else}
		未参加
	{/if}
</div>

<style>
	.dataCell {
		width: 100%;
		display: grid;
		gap: 2px;
		grid-template-columns: auto 2em;
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
