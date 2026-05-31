<script>
	import {
		dataCollection,
		extractLastMatchDataByGroups,
		groupDisplayShort,
		lastFinishedMatchID,
		ordering,
		seriesFromResult
	} from '$lib/processData.js';
	// import { rankDiffAssign } from '$lib/util';
	import { onMount, onDestroy } from 'svelte';
	import Chart, { _adapters } from 'chart.js/auto'; //make everything in Chart available
	// @ts-ignore
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import 'chartjs-plugin-dragdata';
	import { palette } from '$lib/util';

	//to be made export
	// let { progressData, title, revertY = false } = $props();
	let title = 'Rank Guess Test';
	let league = 1;
	let leagueData = dataCollection[league][0];
	let lastMatchData = $state(extractLastMatchDataByGroups(leagueData.extData));
	// let gpIDs = $state(
	// 	rec.rankedGps.reduce((acc, obj, idx) => {
	// 		acc[obj.group] = idx;
	// 		return acc;
	// 	}, {})
	// );
	let newRanks = $state(new Array(lastMatchData.rankedGps.length).map((_) => []));
	let numGuess = $state(0);
	// extendGuess();
	// let progressData = $derived(seriesFromResult(rec.rankedGps, [rec[0].matchID], 'totalRank'));
	let progressData = { labels: [], datasets: [], spanGaps: true }; // non-reative so chartjs won't redraw everytime
	// resetSeries();
	$inspect('newRanks: ', newRanks);
	// $inspect(progressData);
	const dragDataConfig = {
		round: 0,
		showToolTip: false,
		onDragStart: (evt, datasetIdx, idx, val) => {
			if (idx == 0) {
				// not allow to change first data
				return false;
			}
		},
		onDrag: (evt, datasetIdx, idx, val) => {
			if (val < 0 || val > newRanks.length) {
				return false;
			}
		},
		onDragEnd: (evt, datasetIdx, idx, val) => {
			newRanks[datasetIdx][idx] = Math.round(val);
		}
	};

	let canvasHeight = 200 + lastMatchData.rankedGps.length * 40;

	function extendGuess() {
		for (let i = 0; i < newRanks.length; i++) {
			// newRanks[i][numGuess] = numGuess > 0 ? newRanks[i][numGuess - 1] : gpIDs[rec.rankedGps[i].group];
			if (numGuess > 0) {
				newRanks[i].push(newRanks[i][numGuess - 1]);
			} else {
				newRanks[i] = [lastMatchData.rankedGps[i].totalRank, lastMatchData.rankedGps[i].totalRank];
			}
		}
		numGuess = numGuess + 1;
		updateSeries();
	}

	function updateSeries() {
		// lastMatchData = extractLastMatchDataByGroups(leagueData.extData);
		// take data snapshot so svelte won't throw error...
		let d = $state.snapshot(newRanks);

		progressData.labels = d[0].map((_, i) => `戦${lastMatchData.matchID + i + 1}`);
		progressData.datasets = lastMatchData.rankedGps.map((gr, i) => {
			return {
				label: groupDisplayShort(gr.group),
				data: d[i],
				borderColor: `${palette[i]}`,
				backgroundColor: `${palette[i]}`,
				pointHitRadius: 25 // for imporved touch support
			};
		});
		// console.log(progressData);
	}

	/****** Graph related setup ******/
	let canvasContainer;

	// const tooltipLine = {
	// 	id: 'tooltipLine',
	// 	beforeDraw: (chart) => {
	// 		if (chart.tooltip._active && chart.tooltip._active.length) {
	// 			const ctx = chart.ctx;
	// 			ctx.save();
	// 			const activePoint = chart.tooltip._active[0];
	// 			ctx.beginPath();
	// 			ctx.setLineDash([5, 7]);
	// 			ctx.moveTo(activePoint.element.x, chart.chartArea.top);
	// 			ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
	// 			ctx.lineWidth = 2;
	// 			ctx.strokeStyle = 'black';
	// 			ctx.stroke();
	// 			ctx.restore();
	// 		}
	// 	}
	// };

	const config = {
		type: 'line',
		data: progressData,
		options: {
			layout: {
				padding: {
					left: 20,
					right: 50,
					top: 10,
					bottom: 30
				}
			},
			responsive: true,
			maintainAspectRatio: false,
			hover: {
				mode: 'dataset',
				intersect: true
			},
			// interaction: {
			// 	mode: 'index'
			// },
			scales: {
				x: {
					offset: true
				},
				y: {
					reverse: true,
					suggestedMin: 0,
					suggestedMax: 13,
					ticks: {
						stepSize: 1
					}
				}
			},
			plugins: {
				legend: {
					position: 'top',
					labels: { padding: 15 },
					title: { padding: 15 }
				},
				title: {
					display: true,
					font: {
						size: 20
					},
					text: title,
					padding: 5
				},
				datalabels: {
					backgroundColor: function (context) {
						return context.dataset.backgroundColor;
					},
					borderRadius: 6,
					color: 'white',
					font: {
						weight: 'bold'
					},
					formatter: Math.round,
					align: 'center',
					anchor: 'center',
					textAlign: 'center',
					padding: 4
					// padding: {
					// 	top: 2,
					// 	bottom: 1
					// }
				},
				dragData: dragDataConfig
			}
		}
	};

	let thechart;

	onMount(() => {
		extendGuess();
		// make plugins usable
		Chart.register(ChartDataLabels);
		const ctx = thechart.getContext('2d');
		// @ts-ignore
		thechart = new Chart(ctx, config); //initialise
		console.log('chartjs init finished');
	});

	$effect(() => {
		// maxlength = progressData ? progressData.datasets[0].data.length : 0;
		// config.data = progressData;
		// config.options.scales.y.suggestedMax = progressData.datasets.length + 1;
		if (!thechart) return;
		thechart.update();
	});

	onDestroy(() => {
		if (thechart) thechart.destroy();
		thechart = null;
	});
</script>

<!-- <div bind:this={canvasContainer} style="width:100%; height:30vh; border: 1px red solid;"> -->
<div bind:this={canvasContainer} class="canvasDiv" style:height={`${canvasHeight}px`}>
	<canvas bind:this={thechart}> </canvas>
</div>

<style>
	.canvasDiv {
		width: 100%;
		border: 1px solid #aaa;
	}
</style>
