<script>
	import { dataCollection } from '$lib/processData.js';

	const leagueLabel = ['決勝リーグ', 'League 1', 'League 2', '入替戦', '昇格戦'];

	let selectedSeriesIdx = $state(1);
	let selectedSeasonIndex = $state(0);
	let selectedMatchIndex = $state(0);
	let abemaInputMode = $state('');
	let includeMC = $state(false);
	let shimeiValues = $state([]);
	let mcInfoValue = $state('');
	let fcRankSelections = $state([]);
	let abemaVoteValues = $state([]);
	let abemaRankSelections = $state([]);
	let mcScoreValues = $state([]);
	let result = $state(null);
	let displayGroupOrder = $state([]);
	let draggedGroupIndex = $state(null);
	let dragOverGroupIndex = $state(null);

	let seriesData = $derived(
		Object.values(dataCollection)
			.map((sGroup) => sGroup[selectedSeriesIdx])
			.filter(Boolean)
			.sort((a, b) => b.season - a.season)
	);
	let selectedSeriesSeasons = $derived(seriesData.map(({ season }) => season) ?? []);
	let selectedSeason = $derived(seriesData[selectedSeasonIndex] ?? null);
	let matchList = $derived((selectedSeason?.extData?.matches ?? []).toReversed());
	let selectedMatch = $derived(matchList[selectedMatchIndex] ?? null);
	let groups = $derived(selectedSeason?.extData?.groups ?? []);
	let fcRankToCount = $derived(selectedMatch?.mPts?.FC?.rankToCount ?? []);
	let abemaRankToCount = $derived(selectedMatch?.mPts?.Abema?.rankToCount ?? []);
	let includeAbema = $derived(abemaInputMode !== '');
	let displayRows = $derived(
		(displayGroupOrder.length === groups.length
			? displayGroupOrder
			: groups.map((_, index) => index)
		)
			.filter((originalIndex) => groups[originalIndex] !== undefined)
			.map((originalIndex) => ({ group: groups[originalIndex], originalIndex }))
	);

	function resetInputs() {
		shimeiValues = new Array(groups.length).fill('');
		fcRankSelections = new Array(groups.length).fill('');
		mcInfoValue = '';
		abemaVoteValues = new Array(groups.length).fill('');
		abemaRankSelections = new Array(groups.length).fill('');
		mcScoreValues = new Array(groups.length).fill('');
		displayGroupOrder = groups.map((_, index) => index);
		draggedGroupIndex = null;
		dragOverGroupIndex = null;
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

	function setAbemaVoteValue(index, event) {
		const nextValue = event.target.value.replace(/\D/g, '');
		abemaVoteValues[index] = nextValue;
		abemaVoteValues = [...abemaVoteValues];
	}

	function setAbemaInputMode(mode, event) {
		abemaInputMode = event.target.checked ? mode : '';
		result = null;
	}

	function setMcScoreValue(index, event) {
		const nextValue = event.target.value.replace(/\D/g, '');
		mcScoreValues[index] = nextValue;
		mcScoreValues = [...mcScoreValues];
	}

	function handleGroupDragStart(originalIndex, event) {
		draggedGroupIndex = originalIndex;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', String(originalIndex));
	}

	function handleGroupDragOver(originalIndex, event) {
		event.preventDefault();
		dragOverGroupIndex = originalIndex;
		event.dataTransfer.dropEffect = 'move';
	}

	function handleGroupDrop(originalIndex, event) {
		event.preventDefault();

		if (draggedGroupIndex === null || draggedGroupIndex === originalIndex) {
			dragOverGroupIndex = null;
			return;
		}

		const nextOrder = displayRows.map((row) => row.originalIndex);
		const fromIndex = nextOrder.indexOf(draggedGroupIndex);
		const toIndex = nextOrder.indexOf(originalIndex);

		if (fromIndex === -1 || toIndex === -1) {
			draggedGroupIndex = null;
			dragOverGroupIndex = null;
			return;
		}

		const [movedGroupIndex] = nextOrder.splice(fromIndex, 1);
		nextOrder.splice(toIndex, 0, movedGroupIndex);
		displayGroupOrder = nextOrder;
		draggedGroupIndex = null;
		dragOverGroupIndex = null;
	}

	function handleGroupDragEnd() {
		draggedGroupIndex = null;
		dragOverGroupIndex = null;
	}

	function submitForm() {
		result = {
			shimeiNum: shimeiValues.map((value) => Number(value))
		};

		const mPts = {};
		let hasMPts = false;

		if (fcRankToCount.length > 0) {
			// FC rank points are now part of mPts
			mPts.FC = {
				rankToCount: fcRankToCount,
				rank: fcRankSelections.map((value) => (value === '' ? null : Number(value)))
			};
			hasMPts = true;
		}

		if (includeAbema) {
			mPts.Abema =
				abemaInputMode === 'rank'
					? {
							rankToCount: abemaRankToCount,
							rank: abemaRankSelections.map((value) => (value === '' ? null : Number(value)))
						}
					: { vote: abemaVoteValues.map((value) => Number(value)) };
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
			(fcRankToCount.length === 0 ||
				(fcRankSelections.length === groups.length && fcRankSelections.every((v) => v !== ''))) &&
			(!includeAbema ||
				(abemaInputMode === 'rank'
					? abemaRankToCount.length > 0 &&
						abemaRankSelections.length === groups.length &&
						abemaRankSelections.every((v) => v !== '')
					: abemaVoteValues.length === groups.length)) && // If Abema is included, ensure array length matches
			(!includeMC || mcScoreValues.length === groups.length) // If MC is included, ensure array length matches
	);

	// Custom formatter to flatten arrays into a single line after stringifying
	let resultString = $derived(
		result
			? JSON.stringify(result, null, 2).replace(/\[\s+([\s\S]*?)\s+\]/g, (match, content) => {
					return `[${content.replace(/\n\s+/g, ' ')}]`;
				})
			: ''
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
				<input
					type="checkbox"
					checked={abemaInputMode === 'vote'}
					disabled={abemaInputMode === 'rank'}
					onchange={(event) => setAbemaInputMode('vote', event)}
				/>
				Abema vote
			</label>
			<label>
				<input
					type="checkbox"
					checked={abemaInputMode === 'rank'}
					disabled={abemaInputMode === 'vote' || abemaRankToCount.length === 0}
					onchange={(event) => setAbemaInputMode('rank', event)}
				/>
				Abema rank
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
					{#if fcRankToCount.length > 0}
						<th>FC rank points</th>
					{/if}
					{#if includeAbema}
						<th>{abemaInputMode === 'rank' ? 'Abema rank' : 'Abema votes'}</th>
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
				{#each displayRows as { group, originalIndex } (originalIndex)}
					<tr
						draggable="true"
						class:dragging={draggedGroupIndex === originalIndex}
						class:drag-over={dragOverGroupIndex === originalIndex &&
							draggedGroupIndex !== originalIndex}
						aria-grabbed={draggedGroupIndex === originalIndex}
						title="Drag to reorder display rows"
						ondragstart={(event) => handleGroupDragStart(originalIndex, event)}
						ondragover={(event) => handleGroupDragOver(originalIndex, event)}
						ondrop={(event) => handleGroupDrop(originalIndex, event)}
						ondragend={handleGroupDragEnd}
					>
						<th>{group}</th>
						<td>
							<input
								type="text"
								inputmode="numeric"
								pattern="[0-9]*"
								value={shimeiValues[originalIndex]}
								oninput={(event) => setShimeiValue(originalIndex, event)}
								placeholder="0"
							/>
						</td>
						{#if fcRankToCount.length > 0}
							<td>
								<select bind:value={fcRankSelections[originalIndex]}>
									<option value="" disabled selected hidden>Select rank</option>
									{#each fcRankToCount as count, idx (idx)}
										<option value={idx + 1}>{count} ({idx + 1}位)</option>
									{/each}
								</select>
							</td>
						{/if}
						{#if includeAbema}
							<td>
								{#if abemaInputMode === 'rank'}
									<select bind:value={abemaRankSelections[originalIndex]}>
										<option value="" disabled selected hidden>Select rank</option>
										{#each abemaRankToCount as count, idx (idx)}
											<option value={idx + 1}>{count} ({idx + 1}位)</option>
										{/each}
									</select>
								{:else}
									<input
										type="text"
										inputmode="numeric"
										pattern="[0-9]*"
										value={abemaVoteValues[originalIndex]}
										oninput={(event) => setAbemaVoteValue(originalIndex, event)}
										placeholder="0"
									/>
								{/if}
							</td>
						{/if}
						{#if includeMC}
							<td>
								<input
									type="text"
									inputmode="numeric"
									pattern="[0-9]*"
									value={mcScoreValues[originalIndex]}
									oninput={(event) => setMcScoreValue(originalIndex, event)}
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
				<pre>{resultString}</pre>
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
		border: 1px solid var(--color-border-light);
		border-radius: 6px;
		font-size: 1rem;
		background: var(--color-bg-primary);
		color: var(--color-text);
	}

	select:focus,
	input[type='text']:focus {
		border-color: var(--color-border-strong);
		outline: 1px solid var(--color-border-strong);
	}

	input[type='checkbox'] {
		accent-color: var(--color-theme-1);
	}

	input::placeholder {
		color: var(--color-text-muted);
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
		border: 1px solid var(--color-border-light);
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
		background: var(--color-bg-2);
	}

	.input-table tbody tr {
		cursor: move;
	}

	.input-table tbody tr.dragging {
		opacity: 0.55;
	}

	.input-table tbody tr.drag-over th,
	.input-table tbody tr.drag-over td {
		border-top-color: var(--color-border-strong);
	}

	.primary {
		margin-top: 1rem;
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--color-border-strong);
		background: var(--color-theme-1);
		color: var(--color-border-strong);
		border-radius: 6px;
		cursor: pointer;
	}

	.primary:disabled {
		border-color: var(--color-border);
		background: var(--color-bg-2);
		color: var(--color-text-muted);
		cursor: not-allowed;
		opacity: 1;
	}

	.result-box {
		margin-top: 1rem;
		padding: 1rem;
		background: var(--color-bg-2);
		color: var(--color-text);
		border-radius: 8px;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
	}

	.notice {
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}
</style>
