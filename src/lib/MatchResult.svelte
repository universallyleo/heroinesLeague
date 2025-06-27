<script>
	import MatchTable from './MatchTable.svelte';
	import { getGroup, groupDisplayShort, resultTypes } from './processData';
	import { numberToKanji } from './util';

	let {
		open = $bindable(false),
		clamp,
		leagueNum,
		venue,
		date,
		timetable = [],
		gpResults,
		matchID,
		guestData
	} = $props();

	// let hasShimei = $derived(gpResults[0].shimeiNum[matchID] != null);
	// let hasFC = $derived(gpResults[0].fcCount[matchID] != null);
	let { hasShimei, hasFC } = $derived(resultTypes(gpResults[0], matchID));
	let sortedGps = $derived(
		gpResults.toSorted((a, b) => a.totalRank[matchID] - b.totalRank[matchID])
	);
	// let guestShimeiArr = $derived(guestShimeiFC.map((x) => x[1]));
	// let guestShimeiRkData = $derived(rank(guestShimeiArr));
	// let guestShimeiDiff = $derived(
	// 	diffFromRanked(guestShimeiArr, guestShimeiRkData.rank, guestShimeiRkData.prev)
	// );

	let modal;

	// When the user clicks on <span> (x), close the modal
	function closeModal() {
		modal.style.display = 'none';
		open = false;
	}

	$effect(() => {
		if (open) modal.style.display = 'block';
	});
</script>

<div
	bind:this={modal}
	class="modal"
	onclick={closeModal}
	onkeydown={(e) => (e.key == 'Escape' ? closeModal() : null)}
	role="dialog"
	tabindex="0"
>
	<div class="modal-content">
		<button class="close" onclick={closeModal}> &times; </button>

		<div>
			リーグ{leagueNum} 第{numberToKanji(matchID + 1)}戦 結果
			<br />
			<span style="font-size:small; color: #888;"> {date} @ {venue} </span>
		</div>
		<div class="tableContainer">
			<MatchTable type="inMatch" {clamp} {gpResults} {matchID} />
		</div>

		{#if guestData.length > 0}
			<div>
				ゲスト
				<MatchTable type="guest" {clamp} gpResults={guestData} />
				<!-- <table class="simpTb">
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
						{#each guestData as gp, i}
							<tr>
								<td class="headingCell sticky" style="left:0;">{i + 1}</td>
								<td class="headingCell sticky gpLogo" style="font-size:smaller;left:1.7em;">
									{clamp ? groupDisplayShort(gp.group) : getGroup(gp.group).displayName}
								</td>
								{#if hasShimei}
									<td class="datacell">
										<div class="rkDiffCell">
											<div class="rk">{guestShimeiRkData.rank[i]}位</div>
											<div class="val">
												{gp[1]}
											</div>
											{#if guestShimeiDiff[i] > 0}
												<div class="diff">差 {guestShimeiDiff[i]}</div>
											{/if}
										</div>
									</td>
								{/if}

								{#if hasFC}
									<td class="datacell">
										<div class="rkDiffCell">
											<div class="rk">{gp[2]}位</div>
											<div class="val">
												{gp[3]}
											</div>
										</div>
									</td>
								{/if}
								{#if hasShimei && hasFC}
									<td class="datacell">
										<div class="rkDiffCell">
											<div class="val">
												{gp[1] + gp[3]}
											</div>
											{#if i > 0}
												<div class="diff">
													差 {guestShimeiFC[i - 1][1] + guestShimeiFC[i - 1][3] - gp[1] - gp[3]}
												</div>
											{/if}
										</div>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table> -->
			</div>
		{/if}
	</div>
</div>

<!-- TODO: Time-table -->

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

	/* Modal Content/Box */
	.modal-content {
		position: relative;
		background-color: #fefefe;
		margin: 5% auto; /* 5% from the top and centered */
		padding: 0.5em 4em;
		border: 1px solid #888;
		width: fit-content;
	}

	.close {
		position: absolute;
		top: 0.5em;
		right: 1em;
		background-color: #ddd;
		border-radius: 3px;
		border: 1px solid #aaa;
		/* box-shadow: rgba(255, 255, 255, 0.7) 0 1px 0 0 inset; */
		box-sizing: border-box;
		cursor: pointer;
		font-size: 1.2em;
		margin: 0;
		outline: none;
		padding: 0 0.1em;
		height: 1em;
		line-height: 1em;
		text-align: center;
		text-decoration: none;
		user-select: none;
		touch-action: manipulation;
		vertical-align: baseline;
		white-space: nowrap;
	}

	.close:active {
		background-color: #a0c7e4;
		box-shadow: none;
		color: #2c5777;
	}

	.close:hover,
	.close:focus {
		background-color: #b3d3ea;
		box-shadow: 0 0 0 4px rgba(0, 149, 255, 0.15);
		color: black;
		text-decoration: none;
	}
</style>
