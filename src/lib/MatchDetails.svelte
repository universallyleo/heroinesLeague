<script>
	import MatchTimeTable from './MatchTimeTable.svelte';
	import Rules from './Rules.svelte';
	import MatchTable from './MatchTable.svelte';
	import { numberToKanji } from './util';
	let { clamp, league, rawMatch, gpResults, guestResults, match, matchID } = $props();

	let shimeiStr = $derived(
		match.shimeiTotal != null
			? match.shimeiTotal[1] != null
				? `参戦グループのみ = ${match.shimeiTotal[0]} , ゲスト指名 = ${match.shimeiTotal[1]}  ( 合計： ${match.shimeiTotal[0] + match.shimeiTotal[1]} )`
				: match?.shimeiTotal[0]
			: 'データなし'
	);
</script>

{#if match.displayType === 'RESULT'}
	<h2>結果</h2>
	リーグ{league} 第{numberToKanji(matchID + 1)}戦
	<br />
	<span style="font-size:small; color: #888;">
		{match.date} @ {rawMatch.venue}
		{#if match.shimeiTotal != null}
			<br />
			指名入場総数：
			{shimeiStr}
		{/if}
	</span>

	<MatchTable type="inMatch" {clamp} {gpResults} {matchID} />
{/if}

<Rules
	hasFC={match.hasFC}
	rankToPoints={match.rankToPoints}
	fcRankToCount={match.fcRankToCount}
	rules={rawMatch.rules}
/>

{#if match.displayType === 'RESULT' && guestResults.length > 0}
	<h2>ゲスト</h2>
	<MatchTable type="guest" {clamp} gpResults={guestResults} />
{/if}

<h2>タイムテーブル</h2>
<MatchTimeTable
	timetable={match.displayType != 'NONE' ? rawMatch.timetable : []}
	tweet={rawMatch.tweet}
	guestIdx={match.guestIdx}
/>
