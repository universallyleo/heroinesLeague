<script>
	import { padNum } from '$lib/util.js';
	let { gpResult, n } = $props();

	let hasShimei = $derived(gpResult.shimeiNum[n] != null);
	let hasFC = $derived(gpResult.fcCount[n] != null);
</script>

<div class="dataCell">
	<div class="mainData">{gpResult.accumPt[n]}</div>
	<div class="mainDiff">
		<span class="desc">Pt差</span><br />
		{gpResult.accumPtDiff[n] >= 0 ? gpResult.accumPtDiff[n] : '-'}
	</div>
	<div class={['subData', hasShimei || hasFC ? 'boxed' : '']}>
		{#if hasShimei}
			<div class="subDataRow">
				<div class="desc">目当</div>
				<div></div>
				<div class="subpt" style:border-right={hasShimei ? '1px solid #777' : ''}>
					{@html padNum(gpResult.shimeiNum[n], 3)}
				</div>
				<div class="subdiff">
					<span class="desc">差</span>
					{@html padNum(gpResult.shimeiDiff[n], 3)}
				</div>
			</div>
		{/if}
		{#if hasFC}
			<div class="subDataRow">
				<div class="desc">ＦＣ</div>
				<div class="desc">{gpResult.fcRank[n]}位</div>
				<div class="subpt" style:border-right={hasShimei ? '1px solid #777' : ''}>
					{@html padNum(gpResult.fcCount[n], 3)}
				</div>
				<!-- <div class="subdiff">&nbsp;</div> -->
			</div>
		{/if}
		{#if hasShimei && hasFC}
			<div class="subDataRow" style="border-top:1px solid #777;">
				<div class="desc">合計</div>
				<div class="desc"></div>
				<div class="subpt" style:border-right={hasShimei ? '1px solid #777' : ''}>
					{@html padNum(gpResult.shimeiNum[n] + gpResult.fcCount[n], 3)}
				</div>
				<div class="subdiff">
					<span class="desc">差</span>
					{@html padNum(gpResult.getPtDiff[n], 3)}
				</div>
			</div>
		{/if}
		<div class="subDataRow">
			<div class="desc">得点</div>
			<div class="desc">{gpResult.totalRank[n]}位</div>
			<div class="subpt" style="color:red;" style:border-right={hasShimei ? '1px solid #777' : ''}>
				{@html padNum(gpResult.getPt[n], 3)}
			</div>
		</div>
	</div>
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
		display: grid;
		grid-template-rows: repeat(auto-fit, 1fr);
		/* border: 1px solid #555; */
	}

	.boxed {
		border: 1px solid #555;
	}

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
		/* background-color: bisque; */
	}

	.dataCell .subpt {
		text-align: start;
		padding-right: 0.4em;
		/* border-right: 1px solid #777; */
	}

	.subdiff {
		text-align: right;
		padding-left: 0.3em;
		padding-right: 0.3em;
		/* border-right: 1px solid red; */
	}
</style>
