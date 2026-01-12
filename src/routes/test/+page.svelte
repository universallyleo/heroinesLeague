<script>
	import {
		dataCollection,
		LeagueType,
		lastFinishedMatchID,
		ordering
	} from '$lib/processData.js';
	import { rankDiffAssign } from '$lib/util';
	import GroupButton from '$lib/GroupButton.svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	// import Carousel from '$lib/Carousel.svelte';

	let { clamp = false } = $props();
	// let dataset = ['09/11', '10/01', '11/12'];
	let showIcon = $state(true);
	let league = $state(LeagueType.PLAYOFFS);
	let lastLeague = 0;
	let lastMatchID = $derived(lastFinishedMatchID(dataCollection[league][0].extData.matches));
	let lastMatch = $derived(dataCollection[league][0].extData.matches[lastMatchID]);
	// let rec = $derived(extractLastMatchDataByGroups(dataCollection[league][0].extData));
	let resByGps = $derived(dataCollection[league][0].resByGp);
	// let gpIDs = $derived(
	// 	dataCollection[league][0].extData.groups.reduce((obj, gp, i) => {
	// 		obj[gp] = i;
	// 		return obj;
	// 	}, {})
	// );
	// $inspect('rec', rec);
	let selectedRow = $state(-1);
	let selectedCol = $state(-1);
	let selectState = $derived(selectedRow != -1 && selectedCol != -1 ? 'selected' : 'selecting');
	let selectedGroup = $state('');
	let numFutureMatch = $derived(dataCollection[league][0].extData.matches.length - lastMatchID - 1);
	let cols = $derived(Math.max(numFutureMatch, 1));
	let numRows = $derived(resByGps.length);
	// let gpToIdx = $derived(rec.rankedGps.reduce( (res,{group},i) => res[group]=i, {}));
	let newRanks = $state([]); // (i,j)-entry = name of group at i-th rank in the j-th future mach
	$inspect('newRanks', newRanks);
	let finalRes = $derived.by(() => {
		let lateJoiners = [];
		let accumPts = resByGps.reduce((res, { group, assignedLP, accumPt }) => {
			// determine if we can just copy accumPt or need to recalculate assignedLP
			// console.log("Processing: ", group, " assingedLP: ", assignedLP);
			if (assignedLP.some((x) => x!==0 && x!==null)) {
				const i = dataCollection[league][0].extData.groups.indexOf(group);
				const getPts = dataCollection[league][0].extData.matches.map(({ getLPt }) =>
					i < getLPt.length ? getLPt[i] : 0
				);
				res[group] = getPts.reduce((p, c) => p + c);
				lateJoiners.push({
					group: group,
					id: i,
					numMatchesToAssign: getPts.findIndex((p) => p > 0)
				});
			} else {
				res[group] = accumPt[lastMatchID];
			}
			return res;
		}, {});
		console.log('lateJoiners', lateJoiners);
		accumPts = newRanks.reduce((obj, rks, i) => {
			rks.forEach((gp, j) => {
				if (gp !== '') {
					// console.log(`added ${rec.rankToPoints[i]} to ${gp}`);
					obj[gp] +=
						numFutureMatch > 0
							? dataCollection[league][0].extData.matches[lastMatchID + j + 1].rankToPoints[i]
							: lastMatch.rankToPoints[i];
				}
			});
			return obj;
		}, accumPts);
		let res2 = Object.entries(accumPts).reduce(
			(obj, [gp, pt]) => {
				obj.groups.push(gp);
				obj.accumPt.push(pt);
				let i = lateJoiners.findIndex(({ group }) => group === gp);
				// obj.numMatchesToAssign.push(i >= 0 ? lateJoiners[i].numMatchesToAssign : 0);
				if (i >= 0) {
					const ap =
						pt /
						(dataCollection[league][0].extData.matches.length - lateJoiners[i].numMatchesToAssign);
					obj.assignPt.push(ap * dataCollection[league][0].extData.assignLPWeight);
					const a = obj.accumPt.pop();
					// console.log(
					// 	'a=',
					// 	a,
					// 	' | ap=',
					// 	ap,
					// 	' | wt=',
					// 	dataCollection[league][0].extData.assignLPWeight,
					// 	' | numAssign=',
					// 	lateJoiners[i].numMatchesToAssign
					// );
					obj.accumPt.push(
						a +
							ap *
								dataCollection[league][0].extData.assignLPWeight *
								lateJoiners[i].numMatchesToAssign
					);
				} else {
					obj.assignPt.push(null);
				}
				return obj;
			},
			{ groups: [], accumPt: [], assignPt: [] }
		);
		console.log('res2', res2);
		rankDiffAssign(res2.accumPt, res2, 'accumRank', 'accumPtDiff', ordering.accumPt);
		// console.log('res2: ', res2);

		let res3 = res2.groups.map((g, i) => {
			return {
				group: g,
				accumPt: res2.accumPt[i],
				// @ts-ignore
				accumPtDiff: res2.accumPtDiff[i],
				// @ts-ignore
				accumRank: res2.accumRank[i],
				assignPt: res2.assignPt[i] ?? 0
			};
		});
		return res3.toSorted((a, b) => ordering.accumRank(a.accumRank, b.accumRank));
	});
	$inspect('finalRes', finalRes);

	// const toggleCell = (i, j) =>
	// 	([selectedRow, selectedCol] = selectState == 'selecting' ? [i, j] : [-1, -1]);
	const resetCalculation = () => {
		newRanks = new Array(numRows).fill().map(() => new Array(cols).fill().map(() => ''));
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

	let lastMatchGpsRanked = $derived(
		resByGps.toSorted((a, b) =>
			ordering.totalRank(a.totalRank[lastMatchID], b.totalRank[lastMatchID])
		)
	);
	function copyPrevRanks(col) {
		for (let i = 0; i < numRows; i++) {
			newRanks[i][col] = col > 0 ? newRanks[i][col - 1] : lastMatchGpsRanked[i].group;
		}
	}

	function resetRanks(col) {
		for (let i = 0; i < numRows; i++) {
			newRanks[i][col] = '';
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
		// console.log('swap called, state=', selectState);
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
	<!-- <div style="margin-bottom: 1em;">
		使い方： <span style="font-weight:bold;">
			{selectState == 'selecting' ? 'Select cell' : 'Select group to assign or swap'}
		</span>
	</div> -->

	<table>
		<thead>
			<tr>
				<th style="vertical-align:bottom;"> 現総合順位 <br /> （リーグpt）</th>
				<th></th>
				<th style="vertical-align:bottom;">{lastMatchID + 1} 戦目順位</th>
				{#each { length: cols }, i}
					<th>
						{lastMatchID + i + 2} 戦目<br /> 順位予想
						<br />
						<button class="btn" onclick={() => copyPrevRanks(i)}> 前戦からコピペ </button>
						<button class="btn" onclick={() => resetRanks(i)}> リセット </button>
					</th>
				{/each}
				<th></th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each resByGps as resgp, i (resgp.group)}
				<tr>
					<td class="headingCell sticky" onclick={() => selectGroup(resgp.group)}>
						<GroupButton group={resgp.group} {clamp} {showIcon} addStyle={'margin: .2em auto;'} />
						{resgp.accumPt
							.slice(0, lastMatchID)
							.map((p, i) => parseFloat((p - (i == 0 ? 0 : resgp.accumPt[i - 1])).toFixed(2)))
							.join('+')}
						<br />
						<span class="mainData"> {parseFloat(resgp.accumPt[lastMatchID].toFixed(2))} </span>
						&nbsp;&nbsp;
						<span style="font-size:small; color:#555;">
							{@html resgp.accumPtDiff[lastMatchID] >= 0
								? `差&nbsp;${parseFloat(resgp.accumPtDiff[lastMatchID].toFixed(2))}`
								: ''}
						</span>
					</td>

					<td class="arrowBox"> ➡ </td>
					<td onclick={() => selectGroup(lastMatchGpsRanked[i].group)}>
						<GroupButton
							group={lastMatchGpsRanked[i].group}
							{clamp}
							{showIcon}
							addStyle={'margin: .2em auto;'}
						/>
					</td>
					{#each { length: cols }, j}
						<td
							class={[
								selectedCol == j ? 'selectableCell' : '',
								selectedRow == i && selectedCol == j ? 'selectedCell' : ''
							]}
							onclick={() => swapGroup(i, j)}
						>
							{#if newRanks.length > 0 && newRanks[i].length > 0 && newRanks[i][j] !== ''}
								<div in:fly={{ x: -100, duration: 500 }} out:fly={{ x: 100, duration: 500 }}>
									<GroupButton
										group={newRanks[i][j]}
										{clamp}
										{showIcon}
										addStyle={'margin: .2em auto;'}
									/>
								</div>
								<!-- <button> x </button> -->
							{/if}
							<!-- <br /> -->
							[ +{numFutureMatch > 0
								? dataCollection[league][0].extData.matches[lastMatchID + j + 1].rankToPoints[i]
								: lastMatch.rankToPoints[i]} ]
						</td>
					{/each}
					<td class="arrowBox"> ➡ </td>
					<td class="headingCell">
						<GroupButton
							group={finalRes[i].group}
							{clamp}
							{showIcon}
							addStyle={'margin: .2em auto;'}
						/>
						{#if finalRes[i].assignPt > 0}
							<span style="background: hsl(328, 88%, 70%);">
								{parseFloat(
									resByGps.find(({ group }) => group === finalRes[i].group).accumPt[0].toFixed(2)
								)} → {parseFloat(finalRes[i].assignPt.toFixed(2))}
							</span>
							<br />
						{/if}
						<!-- {resgp.accumPt
							.slice(0, lastMatchID)
							.map((p, i) => parseFloat((p - (i == 0 ? 0 : resgp.accumPt[i - 1])).toFixed(2)))
							.join('+')}
						<br /> -->
						<span class="mainData"> {parseFloat(finalRes[i].accumPt.toFixed(2))} </span>
						&nbsp;&nbsp;
						<span style="font-size:small; color:#555;">
							{@html i > 0 ? `差&nbsp;${parseFloat(finalRes[i].accumPtDiff.toFixed(2))}` : ''}
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
		padding: 0.1em 0.4em;
		margin: 0.1em 0;
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
	.btn {
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
