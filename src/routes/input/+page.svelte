<script>
	import { dataCollection } from '$lib/processData.js';

	const leagueLabel = ['決勝リーグ', 'League 1', 'League 2', '入替戦', '昇格戦'];

	let selectedSeriesIdx = $state(1);
	let selectedSeasonIndex = $state(0);
	let selectedMatchIndex = $state(0);
	let includeAbema = $state(false);
	let includeMC = $state(false);
	let shimeiValues = $state([]);
	let mcInfoValue = $state('');
	let fcRankSelections = $state([]);
	let abemaVoteValues = $state([]);
	let mcScoreValues = $state([]);
	let result = $state(null);

	let seriesData = $derived(
		Object.values(dataCollection)
			.map((sGroup) => sGroup[selectedSeriesIdx])
			.filter(Boolean)
			.sort((a, b) => b.season - a.season)
	);
	let selectedSeriesSeasons = $derived(seriesData.map(({ season }) => season) ?? []);
	let selectedSeason = $derived(seriesData[selectedSeasonIndex] ?? null);
	let matchList = $derived(selectedSeason?.extData?.matches ?? []);
	let selectedMatch = $derived(matchList[selectedMatchIndex] ?? null);
	let groups = $derived(selectedSeason?.extData?.groups ?? []);
	let fcRankToCount = $derived(selectedMatch?.mPts?.FC?.rankToCount ?? []);

	function resetInputs() {
		shimeiValues = new Array(groups.length).fill('');
		fcRankSelections = new Array(groups.length).fill('');
		mcInfoValue = '';
		abemaVoteValues = new Array(groups.length).fill('');
		mcScoreValues = new Array(groups.length).fill('');
		result = null;
	}

	function handleSeriesChange() {
		selectedSeasonIndex = 0;
		selectedMatchIndex = 0;
		resetInputs();
	}

	function handleSeasonChange() {
		selectedMatchIndex = 0;
		resetInputs();
	}

	function handleMatchChange() {
		resetInputs();
	}

	function setShimeiValue(index, event) {
		const nextValue = event.target.value.replace(/\D/g, '');
		shimeiValues[index] = nextValue;
		shimeiValues = [...shimeiValues];
	}

	function setFcIndex(index, event) {
		fcRankSelections[index] = event.target.value;
		fcRankSelections = [...fcRankSelections];
	}

	function setAbemaVoteValue(index, event) {
		const nextValue = event.target.value.replace(/\D/g, '');
		abemaVoteValues[index] = nextValue;
		abemaVoteValues = [...abemaVoteValues];
	}

	function setMcScoreValue(index, event) {
		const nextValue = event.target.value.replace(/\D/g, '');
		mcScoreValues[index] = nextValue;
		mcScoreValues = [...mcScoreValues];
	}

	function submitForm() {
		result = {
			shimeiNum: shimeiValues.map((value) => Number(value))
		};

		const mPts = {};
		let hasMPts = false;

		// FC rank points are now part of mPts
		mPts.FC = { rank: fcRankSelections.map((value) => (value === '' ? null : Number(value))) };
		hasMPts = true;

		if (includeAbema) {
			mPts.Abema = { vote: abemaVoteValues.map((value) => Number(value)) };
			hasMPts = true;
		}

		if (includeMC) {
			mPts.MC = { count: mcScoreValues.map((value) => (value === '' ? null : Number(value))) }; // Allow empty input for MC score
			if (mcInfoValue !== '') {
				mPts.MC.info = mcInfoValue;
			}
			hasMPts = true;
		}

		if (hasMPts) {
			result.mPts = mPts;
		}
	}

	let isFormComplete = $derived(
		groups.length > 0 &&
			shimeiValues.length === groups.length &&
			shimeiValues.every((value) => value !== '') &&
			fcRankSelections.length === groups.length && // FC rank selection is mandatory if the form is complete
			fcRankSelections.every((value) => value !== '') && // Ensure a rank is selected (dropdown prevents empty string)
			(!includeAbema || abemaVoteValues.length === groups.length) && // If Abema is included, ensure array length matches
			(!includeMC || mcScoreValues.length === groups.length) // If MC is included, ensure array length matches
	);
</script>

<section class="page-shell">
	<h1>Match Input Builder</h1>

	<div class="form-row">
		<label for="series-select">Select data series</label>
		<select id="series-select" bind:value={selectedSeriesIdx} onchange={handleSeriesChange}>
			{#each leagueLabel as lb, idx (lb)}
				<option value={idx}>{lb}</option>
			{/each}
		</select>
	</div>

	{#if seriesData.length > 1}
		<div class="form-row">
			<label for="season-select">Select season</label>
			<select id="season-select" bind:value={selectedSeasonIndex} onchange={handleSeasonChange}>
				{#each selectedSeriesSeasons as season, index (season)}
					<option value={index}>
						{leagueLabel[selectedSeriesIdx]} - season {season}
					</option>
				{/each}
			</select>
		</div>
	{/if}

	{#if matchList.length > 0}
		<div class="form-row">
			<label for="match-select">Select match</label>
			<select id="match-select" bind:value={selectedMatchIndex} onchange={handleMatchChange}>
				{#each matchList as match, index (index)}
					<option value={index}>
						{match.shortdate ?? match.date} - {match.venue ?? 'Unknown venue'}
					</option>
				{/each}
			</select>
		</div>
	{:else}
		<p class="notice">No matches available for the selected data series.</p>
	{/if}

	{#if selectedMatch}
		<h2>Group Inputs for {leagueLabel[selectedSeriesIdx]} (season {selectedSeason.season})</h2>

		<div class="options-row">
			<label>
				<input type="checkbox" bind:checked={includeAbema} /> Include Abema Votes
			</label>
			<label>
				<input type="checkbox" bind:checked={includeMC} /> Include MC Score
			</label>
		</div>

		<table class="input-table">
			<thead>
				<tr>
					<th>Group</th>
					<th>shimeiNum</th>
					<th>FC rank points</th>
					{#if includeAbema}
						<th>Abema votes</th>
					{/if}
					{#if includeMC}
						<th>
							MC score
							<input
								type="text"
								bind:value={mcInfoValue}
								placeholder="MC Info"
								size="10"
								maxlength="10"
								class="mc-info-input"
							/>
						</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each groups as group, index (group)}
					<tr>
						<th>{group}</th>
						<td>
							<input
								type="text"
								inputmode="numeric"
								pattern="[0-9]*"
								value={shimeiValues[index]}
								oninput={(event) => setShimeiValue(index, event)}
								placeholder="0"
							/>
						</td>
						<td>
							<select
								value={fcRankSelections[index]}
								onchange={(event) => setFcIndex(index, event)}
							>
								<option value="" disabled selected hidden>Select rank</option>
								{#if fcRankToCount.length > 0}
									{#each fcRankToCount as count, idx (idx)}
										<option value={idx + 1}>{idx + 1}位 ({count}pt)</option>
									{/each}
								{:else}
									<option value="" disabled>No FC rank options</option>
								{/if}
							</select>
						</td>
						{#if includeAbema}
							<td>
								<input
									type="text"
									inputmode="numeric"
									pattern="[0-9]*"
									value={abemaVoteValues[index]}
									oninput={(event) => setAbemaVoteValue(index, event)}
									placeholder="0"
								/>
							</td>
						{/if}
						{#if includeMC}
							<td>
								<input
									type="text"
									inputmode="numeric"
									pattern="[0-9]*"
									value={mcScoreValues[index]}
									oninput={(event) => setMcScoreValue(index, event)}
									placeholder="0"
								/>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>

		<button class="primary" onclick={submitForm} disabled={!isFormComplete}> Build arrays </button>

		{#if result}
			<section class="result-box">
				<h3>Result</h3>
				<pre>{JSON.stringify(result, null, 2)}</pre>
			</section>
		{/if}
	{/if}
</section>

<style>
	.page-shell {
		padding: 1rem;
		max-width: 900px;
	}

	.form-row {
		margin-bottom: 1rem;
		display: grid;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
	}

	select,
	input[type='text'] {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		font-size: 1rem;
	}

	.options-row {
		margin: 1rem 0;
		display: flex;
		gap: 2rem;
	}

	.mc-info-input {
		margin-top: 0.5rem;
	}

	.input-table {
		width: auto;
		border-collapse: collapse;
		margin: 1rem 0;
	}

	.input-table th,
	.input-table td {
		border: 1px solid #ddd;
		padding: 0.75rem;
		text-align: left;
	}
	.input-table td input[type='text'],
	.input-table td select {
		box-sizing: border-box; /* Fix for input fields overflowing column width */
	}

	.input-table td input[inputmode='numeric'] {
		width: 5.5rem;
		box-sizing: border-box;
	}

	.input-table th {
		background: #f7f7f7;
	}

	.primary {
		margin-top: 1rem;
		padding: 0.75rem 1.25rem;
		border: none;
		background: #2b6cb0;
		color: white;
		border-radius: 6px;
		cursor: pointer;
	}

	.primary:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.result-box {
		margin-top: 1rem;
		padding: 1rem;
		background: #f3f4f6;
		border-radius: 8px;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
	}

	.notice {
		color: #555;
		font-size: 0.95rem;
	}
</style>
