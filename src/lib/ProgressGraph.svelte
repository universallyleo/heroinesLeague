<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto'; //make everything in Chart available
	// @ts-ignore
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	//to be made export
	let { progressData, title, revertY = false } = $props();
	// let maxlength = $derived(progressData ? progressData.datasets[0].data.length : 0);
	// let canvasWidth = $derived(Math.max(maxlength * 80, 1000));
	let maxData = $derived(Math.max(...progressData.datasets.map(({ data }) => Math.max(...data))));
	// let canvasHeight = $derived(Math.min(200 + progressData.datasets.length * 50, 800));
	let canvasHeight = $derived(Math.min(200 + maxData * (maxData < 20 ? 80 : 10), 800));
	// $inspect('canvasHeight', canvasHeight);

	/****** Graph related setup ******/
	let canvasContainer;

	const tooltipLine = {
		id: 'tooltipLine',
		beforeDraw: (chart) => {
			if (chart.tooltip._active && chart.tooltip._active.length) {
				const ctx = chart.ctx;
				ctx.save();
				const activePoint = chart.tooltip._active[0];
				ctx.beginPath();
				ctx.setLineDash([5, 7]);
				ctx.moveTo(activePoint.element.x, chart.chartArea.top);
				ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
				ctx.lineWidth = 2;
				ctx.strokeStyle = 'black';
				ctx.stroke();
				ctx.restore();
			}
		}
	};

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
			interaction: {
				mode: 'index'
			},
			scales: {
				x: {
					offset: true
				},
				y: {
					suggestedMax: 100
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
					text: '',
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
				}
			}
		},
		plugins: [
			tooltipLine //see https://youtu.be/rLUwF1UQcbI
		]
	};

	let thechart;

	onMount(() => {
		// make plugins usable
		Chart.register(ChartDataLabels);
		const ctx = thechart.getContext('2d');
		// @ts-ignore
		thechart = new Chart(ctx, config); //initialise
	});

	$effect(() => {
		// maxlength = progressData ? progressData.datasets[0].data.length : 0;
		progressData.spanGaps = true;
		config.data = progressData;
		config.options.plugins.title.text = title;
		config.options.scales.y.reverse = revertY;
		config.options.scales.y.suggestedMax = maxData + (maxData < 15 ? 1 : 10);
		if (revertY) {
			config.options.scales.y.suggestedMin = 0;
		}

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
