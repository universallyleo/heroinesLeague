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

			<MatchTable type="inMatch" {clamp} {gpResults} {matchID} />

			{#if guestData.length > 0}
				ゲスト
				<MatchTable type="guest" {clamp} gpResults={guestData} />
			{/if}
		</div>
	</div>
</div>

<!-- TODO: Time-table -->

<style>
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
