<script>
	import MatchTimeTable from './MatchTimeTable.svelte';
	import Rules from './Rules.svelte';
	import MatchTable from './MatchTable.svelte';
	import { numberToKanji, sumArray } from './util';
	import { CountType, MatchPointsData } from './processData';

	// let { clamp, leagueTitle, rawMatch, gpResults, guestResults, match, matchID } = $props();
	let { clamp, leagueSeasonData, matchID } = $props();

	/** @type {import('./processData').MatchDataExt} */
	let match = $derived(leagueSeasonData.extData.matches[matchID]);
	// $inspect('match data: ', match);
	// $inspect('resByGp: ', leagueSeasonData.resByGp);
	let shimeiStr = $derived(
		match.shimeiTotal != null
			? match.shimeiTotal[1] != null
				? `参戦グループのみ = ${match.shimeiTotal[0]} , ゲスト指名 = ${match.shimeiTotal[1]}  ( 合計： ${match.shimeiTotal[0] + match.shimeiTotal[1]} )`
				: match?.shimeiTotal[0]
			: 'データなし'
	);

	let mPtsInfo = $derived(
		MatchPointsData.map(({ label, countType }) => {
			return countType == CountType.RANKED_WITH_VOTE
				? label in match.mPts && 'vote' in match.mPts[label]
					? sumArray(match.mPts[label].vote.slice(0, match.numActivePlayers))
					: null
				: (match.mPts?.[label]?.info ?? null);
		})
	);
</script>

<div class="matchDetails">
	{#if match.displayType === 'RESULT'}
		<h2>結果</h2>
		{leagueSeasonData.title}
		{numberToKanji(matchID + 1)}戦目
		<br />
		<span style="font-size:small; color: var(--color-text-muted);">
			{match.date} @ {match.venue}
			{#if match.shimeiTotal != null}
				<br />
				入場指名総数：
				{shimeiStr}
			{/if}
		</span>

		<MatchTable
			type="inMatch"
			{clamp}
			gpResults={leagueSeasonData.resByGp}
			{matchID}
			shimeiTotal={match?.shimeiTotal?.[0] ?? null}
			hasResults={match.hasResults}
			{mPtsInfo}
		/>
	{/if}

	<Rules
		hasFC={match.hasResults.FC}
		hasAbema={match.hasResults.Abema}
		rankToLP={match.rankToLP}
		fcRankToCount={match?.mPts?.FC?.rankToCount ?? []}
		abemaRankToCount={match?.mPts?.Abema?.rankToCount ?? []}
		rules={match.rules}
	/>

	{#if match.displayType === 'RESULT' && match.guestResults.length > 0}
		<h2>ゲスト</h2>
		<MatchTable
			type="guest"
			{clamp}
			gpResults={match.guestResults}
			shimeiTotal={match?.shimeiTotal?.[1] ?? null}
			hasResults={match.hasResults}
		/>
	{/if}

	<h2>
		{#if match.tweet}
			<a class="headingLink" href={match.tweet} target="_blank" rel="noopener noreferrer">
				タイムテーブル
			</a>
		{:else}
			タイムテーブル
		{/if}
	</h2>
	<MatchTimeTable
		timetable={match.displayType != 'NONE' ? match.timetable : []}
		guestIdx={match.guestIdx}
	/>
</div>

<style>
	.matchDetails {
		text-align: center;
	}

	.headingLink {
		color: inherit;
		font-size: inherit;
		font-weight: inherit;
	}
</style>
