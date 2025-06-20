<script>
	import SubDataRow from './SubDataRow.svelte';
	let { gpResult, n, detailed } = $props();

	let hasShimei = $derived(gpResult.shimeiNum[n] != null);
	let hasFC = $derived(gpResult.fcCount[n] != null);
</script>

<div class="dataCell">
	<!-- style:grid-template-columns={detailed ? `auto 2em` : `2em 1.5em`} -->
	<div class="mainData">
		{gpResult.accumPt[n]}
	</div>
	<div class="mainDiff">
		<span class="desc">Pt差</span><br />
		{gpResult.accumPtDiff[n] >= 0 ? gpResult.accumPtDiff[n] : '-'}
	</div>
	{#if detailed}
		<div class={['subData', hasShimei || hasFC ? 'boxed' : '']}>
			{#if hasShimei}
				<SubDataRow label="目当" pt={gpResult.shimeiNum[n]} diff={gpResult.shimeiDiff[n]} />
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
			<SubDataRow
				label="得点"
				rank={gpResult.totalRank[n]}
				pt={gpResult.getPt[n]}
				border={hasShimei}
			/>
		</div>
	{/if}
</div>

<style>
	.dataCell {
		width: 100%;
		grid-template-columns: auto 2em;
		display: grid;
		gap: 2px;
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
		display: grid;
		grid-template-rows: repeat(auto-fit, 1fr);
		/* border: 1px solid #555; */
	}

	.boxed {
		border: 1px solid #555;
	}

	.desc {
		font-size: smaller;
		color: #777;
		width: fit-content;
		/* background-color: bisque; */
	}
</style>
