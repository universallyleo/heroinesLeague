<script>
	import RuleProgression from '$lib/RuleProgression.svelte';
	import { leagueOne, leagueTwo } from '$lib/processData.js';
	import { levelAllArrayEntries, ShortJPDate } from '$lib/util.js';

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

	let dates = $derived([
		leagueOne[0].matches.map(({ date }) => ShortJPDate(date, true)),
		leagueTwo[0].matches.map(({ date }) => ShortJPDate(date, true))
	]);
	// $inspect(rankToPointsCollec[0]);
</script>

<RuleProgression
	array={rankToPointsCollec}
	title="「マッチ順位 → ポイント」の変化"
	headings={dates}
/>

<RuleProgression array={fcRankToCountCollec} title="「FC投票得点」の変化" headings={dates} />

<h2>他の事項</h2>
<!-- <div style="width: 100%;"> -->
<div style="width: 90%; margin: 0 auto;">
	本ページでは区別のため、<br />
	{@render defText('得点')}とは： 入場指名数、または FC投票によって獲得できる点数
	(最近、運営は後者を{@render defText('FC pt')}と呼んでいる)
	<br />
	{@render defText('ポイント')} または {@render defText('pt')} 、 {@render defText('リーグpt')} とは：得点に基づいて決まった順位に応じて付与される点数<br
	/>

	<p>
		各戦で、<span style="font-weight: bolder;">「入場指名数」＋「FC投票得点」＝「総合得点」</span>
		(ただし、FC投票が行われない戦もある) <br />
		総合得点に基づいて順位（マッチ順位）を決定し、その順位に応じて「ポイント（pt）」を付与<br />
		各リーグ内ランキングは、各戦のポイントの合計により決まります
	</p>

	<p>
		2025-07の時点で、<br />
		{@render defText('上位グループ')}とは：リーグ１の場合は1～4位、リーグ２の場合は1～3位 {@render cautionText()}
		<br />
		{@render defText('下位グループ')}とは：リーグ１の場合は最後のグループ、リーグ２はなし<br />
		シーズン終了時（期間は半年または1年、未確定）、<br />
		リーグ１の下位グループ ＋ リーグ２の上位グループ ➡ {@render defText('入れ替え戦')}
		<br />
		➡ 入れ替え戦の前半３グループがリーグ１に昇格、後半３グループがリーグ２に
		<br />
		リーグ1の上位グループによる何らかの方式で王者ランキングが決定される予定です {@render cautionText()}<br
		/>
		また、リーグ１で全バトルにおいて1位を獲得したグループは{@render defText(
			'殿堂入り'
		)}となります<br />
		殿堂入りグループは今後リーグ戦免除らしい {@render cautionText()}<br />
	</p>

	※要確認事項：ソースを教えてください。
</div>
<!-- </div> -->

{#snippet defText(t)}
	「<span class="definition">{t}</span>」
{/snippet}

{#snippet cautionText()}
	&nbsp;<span class="caution">（※要確認！！）</span>&nbsp;
{/snippet}

<style>
	.caution {
		color: red;
		font-size: small;
	}

	.definition {
		font-weight: bold;
		color: darkorchid;
	}
</style>
