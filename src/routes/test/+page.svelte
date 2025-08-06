<script>
	import { dataCollection, extractLastMatchDataByGroups } from '$lib/processData.js';
	import GroupButton from '$lib/GroupButton.svelte';
	import { onMount } from 'svelte';
	// import Carousel from '$lib/Carousel.svelte';

	let { clamp = false } = $props();
	// let dataset = ['09/11', '10/01', '11/12'];
	let league = $state(1);
	let lastLeague = 1;
	let rec = $derived(extractLastMatchDataByGroups(dataCollection[league][0].extData));
	$inspect('rec', rec);
	let cols = $state(1);
	let selectedRow = $state(-1);
	let selectedCol = $state(-1);
	let selectState = $derived(selectedRow != -1 && selectedCol != -1 ? 'selected' : 'selecting');
	let selectedGroup = $state('');
	let numRows = $derived(rec.rankedGps.length);
	let newRanks = $state([]);
	$inspect('newRanks', newRanks);

	const toggleCell = (i, j) =>
		([selectedRow, selectedCol] = selectState == 'selecting' ? [i, j] : [-1, -1]);
	const resetCalculation = () => {
		newRanks = new Array(numRows).fill(['']);
	};
	const resetSelection = () => {
		[selectState, selectedCol, selectedRow] = ['selecting', -1, -1];
	};

	function addCol() {
		cols = cols + 1;
		for (let i = 0; i < numRows; i++) {
			newRanks[i].push('');
		}
	}

	function copyPrevRanks(col) {
		for (let i = 0; i < numRows; i++) {
			newRanks[i][col] = col > 0 ? newRanks[i][col - 1] : rec.rankedGps[i].group;
		}
	}

	/** @param {string} g 	*/
	function selectGroup(g) {
		console.log('selected group: ', g, ' i,j: ', selectedRow, selectedCol);
		for (let i = 0; i < numRows; i++) {
			if (newRanks[i][selectedCol] == g) {
				// console.log('overlap at i: ', i);
				newRanks[i][selectedCol] = '';
			}
		}
		newRanks[selectedRow][selectedCol] = g;
		selectedGroup = g;
		resetSelection();
		return selectedGroup;
	}

	onMount(resetCalculation);
	$effect(() => {
		if (league !== lastLeague) {
			resetCalculation();
			lastLeague = league;
		}
	});
</script>

<h2>🚧 試算表 工事中 🚧</h2>

<!-- <Carousel {dataset} selected={0}></Carousel> -->

<div class="mainContainer">
	<div style="margin-bottom: 1em;">
		リーグ：
		{#each { length: 2 }, i}
			<label><input type="radio" name="league" value={i} bind:group={league} /> {i + 1} </label>
		{/each}
		<button onclick={addCol}> Add battle </button>
	</div>
	<div style="margin-bottom: 1em;">
		使い方： <span style="font-weight:bold;">
			{selectState == 'selecting' ? 'Select cell' : 'Select group icon to assign to cell'}
		</span>
	</div>

	<table>
		<thead>
			<tr>
				<th> {rec.matchID + 1}戦目までの順位 <br /> （リーグpt）</th>
				{#each { length: cols }, i}
					<th>
						{rec.matchID + i + 2} 戦目<br /> 順位予想
						<br />
						<button class="btnCopyPrev" onclick={() => copyPrevRanks(i)}> 前戦からコピペ </button>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rec.rankedGps as gp, i (gp.group)}
				<tr>
					<td
						class={[
							'headingCell',
							'sticky',
							'gpLogo',
							selectState == 'selecting' ? 'inactiveCell' : 'activeCell'
						]}
						style="font-size:smaller;left:1.7em;"
					>
						<!-- <img
							src={`..\/gpLogo\/${gp.group}.jpg`}
							width={clamp ? '40' : '60'}
							alt={getGroup(gp.group).displayName}
						/>
						<br />
						{clamp ? groupDisplayShort(gp.group) : getGroup(gp.group).displayName} -->
						<GroupButton
							group={gp.group}
							{clamp}
							onclick={() => selectGroup(gp.group)}
							addStyle={'margin: .2em auto;'}
						/>
						<span class="mainData"> {gp.accumPt} </span> &nbsp;&nbsp;
						<span style="font-size:small; color:#555;">
							{@html gp.accumPtDiff >= 0 ? `差&nbsp;${gp.accumPtDiff}` : ''}
						</span>
					</td>

					{#each { length: cols }, j}
						<td
							class={[
								selectedCol == j ? 'activeCell' : '',
								selectedRow == i && selectedCol == j ? 'selectedCell' : '',
								selectState == 'selected' ? 'inactiveCell' : ''
							]}
							onclick={() => toggleCell(i, j)}
						>
							{#if newRanks.length > 0 && newRanks[i].length > 0 && newRanks[i][j] !== ''}
								<GroupButton group={newRanks[i][j]} {clamp} addStyle={'margin: .2em auto;'} />
								<button> x </button>
							{/if}
							<br />
							+{rec.rankToPoints[i]}
						</td>
					{/each}
					<td style="vertical-align: middle; min-width: 1.5em;"> ➡ </td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.mainContainer {
		margin: 0 auto;
	}
	table {
		border-collapse: collapse;
		width: max-content;
	}
	td {
		min-width: 6em;
		border: 1px solid #ddd;
	}
	/* tbody td:not(:first-child) {
		border-right: 1px solid #ddd;
	} */
	thead tr {
		border-bottom: 1px solid black;
	}
	.mainData {
		background: rgb(214, 236, 248);
		padding: 0.2em 0.4em;
		font-size: larger;
		font-weight: bold;
	}
	.gpLogo {
		vertical-align: middle;
	}
	.sticky {
		position: sticky;
		z-index: 2;
	}
	.headingCell {
		border-right: 2px solid black;
	}
	@media (min-width: 350px) {
		.headingCell {
			padding-left: 0.4em;
			padding-right: 0.2em;
		}
	}
	.activeCell {
		background-color: #fff;
	}
	.inactiveCell {
		background-color: #ccc;
	}
	.selectedCell {
		background-color: hsl(62, 100%, 50%);
		border: red 3px dotted !important;
	}
	.btnCopyPrev {
		background-color: #f2f7fa;
		padding: 0.2em;
		border: 1px black solid;
		border-radius: 3px;
		font-size: small;
		cursor: pointer;
		margin: 3px;
	}
</style>
