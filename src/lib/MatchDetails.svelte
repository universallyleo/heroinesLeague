<script>
	import Modal from './Modal.svelte';
	import MatchTimeTable from './MatchTimeTable.svelte';
	import Rules from './Rules.svelte';
	import MatchTable from './MatchTable.svelte';
	import { numberToKanji } from './util';
	let {
		open = $bindable(),
		clamp,
		league,
		rawMatch,
		gpResults,
		guestResults,
		match,
		matchID
	} = $props();
</script>

<Modal bind:open>
	{#if match.displayType === 'RESULT'}
		<h2>結果</h2>
		リーグ{league} 第{numberToKanji(matchID + 1)}戦
		<br />
		<span style="font-size:small; color: #888;">
			{match.date} @ {rawMatch.venue}
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
	/>
</Modal>
