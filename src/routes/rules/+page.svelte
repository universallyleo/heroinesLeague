<script>
	import RuleProgression from '$lib/RuleProgression.svelte';
	import { leagueOne, leagueTwo } from '$lib/processData.js';
	import { levelAllArrayEntries } from '$lib/util.js';

	const extractAndLevel = (raw, key) =>
		levelAllArrayEntries(
			raw.matches.map((m) => m[key] ?? []),
			-1
		);

	let rankToPointsCollec = $derived([
		extractAndLevel(leagueOne[0], 'rankToPoints'),
		extractAndLevel(leagueTwo[0], 'rankToPoints')
	]);
	let fcRankToCountCollec = $derived([
		extractAndLevel(leagueOne[0], 'fcRankToCount'),
		extractAndLevel(leagueTwo[0], 'fcRankToCount')
	]);
	// $inspect(rankToPointsCollec[0]);
</script>

<div>
	ノート：<br />
	本ページでは、区別のため、<br />
	「得点」とは：指名入場数、または FC投票で獲得できる「点数」 <br />
	「ポイント」とは：得点合わせて順位により獲得「ポイント」
</div>

<RuleProgression array={rankToPointsCollec} title="「マッチ順位 → ポイント」の変化" />

<RuleProgression array={fcRankToCountCollec} title="「FC順位 → 得点」の変化" />
