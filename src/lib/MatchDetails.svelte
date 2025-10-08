<script>
	import MatchTimeTable from './MatchTimeTable.svelte';
	import Rules from './Rules.svelte';
	import MatchTable from './MatchTable.svelte';
	import { numberToKanji } from './util';
	// let { clamp, leagueTitle, rawMatch, gpResults, guestResults, match, matchID } = $props();
	let { clamp, leagueSeasonData, matchID } = $props();

	// /** @type {MatchDataExt} */
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
	let resultType = $derived({ hasFC: match.hasFC, hasShimei: match.hasShimei });
</script>

{#if match.displayType === 'RESULT'}
	<h2>結果</h2>
	{leagueSeasonData.title} 第{numberToKanji(matchID + 1)}戦
	<br />
	<span style="font-size:small; color: #888;">
		{match.date} @ {match.venue}
		{#if match.shimeiTotal != null}
			<br />
			入場指名総数：
			{shimeiStr}
		{/if}
	</span>

	<MatchTable type="inMatch" {clamp} gpResults={leagueSeasonData.resByGp} {matchID} {resultType} />
{/if}

<Rules
	hasFC={match.hasFC}
	rankToPoints={match.rankToPoints}
	fcRankToCount={match.fcRankToCount}
	rules={match.rules}
/>

{#if match.displayType === 'RESULT' && match.guestResults.length > 0}
	<h2>ゲスト</h2>
	<MatchTable type="guest" {clamp} gpResults={match.guestResults} {resultType} />
{/if}

<h2>タイムテーブル</h2>
<MatchTimeTable
	timetable={match.displayType != 'NONE' ? match.timetable : []}
	tweet={match.tweet}
	guestIdx={match.guestIdx}
/>
