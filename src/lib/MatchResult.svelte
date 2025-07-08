<script>
	import MatchTable from './MatchTable.svelte';
	import { numberToKanji } from './util';

	let { clamp, leagueNum, venue, date, gpResults, matchID, guestData } = $props();
</script>

<h2>結果</h2>
リーグ{leagueNum} 第{numberToKanji(matchID + 1)}戦
<br />
<span style="font-size:small; color: #888;"> {date} @ {venue} </span>

<MatchTable type="inMatch" {clamp} {gpResults} {matchID} />

{#if guestData.length > 0}
	<h2>ゲスト</h2>
	<MatchTable type="guest" {clamp} gpResults={guestData} />
{/if}

<style>
</style>
