<script>
	import { dataCollection, extractLastMatchDataByGroups, ordering } from '$lib/processData.js';
	import GroupButton from '$lib/GroupButton.svelte';
	import { onMount } from 'svelte';
	import { rankDiffAssign } from '$lib/util';
	// import Carousel from '$lib/Carousel.svelte';

	let { clamp = false } = $props();
	// let dataset = ['09/11', '10/01', '11/12'];
	let showIcon = $state(true);
	let league = $state(1);
	let lastLeague = 1;
	let rec = $derived(extractLastMatchDataByGroups(dataCollection[league][0].extData));
	// $inspect('rec', rec);
	let cols = $state(1);
	let selectedRow = $state(-1);
	let selectedCol = $state(-1);
	let selectState = $derived(selectedRow != -1 && selectedCol != -1 ? 'selected' : 'selecting');
	let selectedGroup = $state('');
	let numRows = $derived(rec.rankedGps.length);
	// let gpToIdx = $derived(rec.rankedGps.reduce( (res,{group},i) => res[group]=i, {}));
	let newRanks = $state([]);
	$inspect('newRanks', newRanks);
	let finalRes = $derived.by(() => {
		let res = rec.rankedGps.reduce((res, { group, accumPt }) => {
			res[group] = accumPt;
			return res;
		}, {});
		res = newRanks.reduce((obj, rks, i) => {
			rks.forEach((gp) => {
				if (gp !== '') {
					// console.log(`added ${rec.rankToPoints[i]} to ${gp}`);
					obj[gp] += rec.rankToPoints[i];
				}
			});
			return obj;
		}, res);
		console.log('res: ', res);
		let res2 = Object.entries(res).reduce(
			(obj, [key, val]) => {
				obj.groups.push(key);
				obj.accumPt.push(val);
				return obj;
			},
			{ groups: [], accumPt: [] }
		);
		rankDiffAssign(res2.accumPt, res2, 'accumRank', 'accumPtDiff', ordering.accumPt);
		// console.log('res2: ', res2);

		let res3 = res2.groups.map((g, i) => {
			return {
				group: g,
				accumPt: res2.accumPt[i],
				// @ts-ignore
				accumPtDiff: res2.accumPtDiff[i],
				// @ts-ignore
				accumRank: res2.accumRank[i]
			};
		});
		return res3.toSorted((a, b) => ordering.accumRank(a.accumRank, b.accumRank));
	});
	$inspect('finalRes', finalRes);

	// const toggleCell = (i, j) =>
	// 	([selectedRow, selectedCol] = selectState == 'selecting' ? [i, j] : [-1, -1]);
	const resetCalculation = () => {
		cols = 1;
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
		if (selectState == 'selecting') return;
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

	function swapGroup(i, j) {
		console.log('swap called, state=', selectState);
		if (selectState == 'selecting') {
			[selectedRow, selectedCol] = [i, j];
		} else if (selectedCol == j) {
			[newRanks[i][j], newRanks[selectedRow][j]] = [newRanks[selectedRow][j], newRanks[i][j]];
			[selectedRow, selectedCol] = [-1, -1];
		}
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
		<label>
			<input type="checkbox" name="showIcon" bind:checked={showIcon} /> グループロゴを表示
		</label>
		<br />
		リーグ：
		{#each { length: 2 }, i}
			<label><input type="radio" name="league" value={i} bind:group={league} /> {i + 1} </label>
		{/each}
		<button onclick={addCol}> Add battle </button>
	</div>
	<div style="margin-bottom: 1em;">
		使い方： <span style="font-weight:bold;">
			{selectState == 'selecting' ? 'Select cell' : 'Select group to assign or swap'}
		</span>
	</div>

	<table>
		<thead>
			<tr>
				<th style="vertical-align:bottom;"> {rec.matchID + 1}戦目までの順位 <br /> （リーグpt）</th>
				<th></th>
				{#each { length: cols }, i}
					<th>
						{rec.matchID + i + 2} 戦目<br /> 順位予想
						<br />
						<button class="btnCopyPrev" onclick={() => copyPrevRanks(i)}> 前戦からコピペ </button>
					</th>
				{/each}
				<th></th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each rec.rankedGps as gp, i (gp.group)}
				<tr>
					<td class="headingCell sticky" onclick={() => selectGroup(gp.group)}>
						<GroupButton group={gp.group} {clamp} {showIcon} addStyle={'margin: .2em auto;'} />
						<span class="mainData"> {gp.accumPt} </span> &nbsp;&nbsp;
						<span style="font-size:small; color:#555;">
							{@html gp.accumPtDiff >= 0 ? `差&nbsp;${gp.accumPtDiff}` : ''}
						</span>
					</td>

					<td class="arrowBox"> ➡ </td>

					{#each { length: cols }, j}
						<td
							class={[
								selectedCol == j ? 'selectableCell' : '',
								selectedRow == i && selectedCol == j ? 'selectedCell' : ''
							]}
							onclick={() => swapGroup(i, j)}
						>
							{#if newRanks.length > 0 && newRanks[i].length > 0 && newRanks[i][j] !== ''}
								<GroupButton
									group={newRanks[i][j]}
									{clamp}
									{showIcon}
									addStyle={'margin: .2em auto;'}
								/>
								<button> x </button>
							{/if}
							<br />
							+{rec.rankToPoints[i]}
						</td>
					{/each}
					<td class="arrowBox"> ➡ </td>
					<td>
						<GroupButton
							group={finalRes[i].group}
							{clamp}
							showIcon={true}
							addStyle={'margin: .2em auto;'}
						/>
						<span class="mainData"> {finalRes[i].accumPt} </span> &nbsp;&nbsp;
						<span style="font-size:small; color:#555;">
							{@html i > 0 ? `差&nbsp;${finalRes[i].accumPtDiff}` : ''}
						</span>
					</td>
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
	tbody td {
		vertical-align: middle;
	}
	.mainData {
		background: rgb(214, 236, 248);
		padding: 0.2em 0.4em;
		font-size: larger;
		font-weight: bold;
	}
	.sticky {
		position: sticky;
		z-index: 2;
	}
	.headingCell {
		background-color: hsl(328, 88%, 90%);
	}
	.selectableCell {
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
	.arrowBox {
		vertical-align: middle;
		min-width: 1.5em;
	}
</style>
