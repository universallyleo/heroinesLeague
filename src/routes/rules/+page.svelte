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

<RuleProgression array={rankToPointsCollec} title="「戦順位 → ポイント」の変化" headings={dates} />

<RuleProgression array={fcRankToCountCollec} title="「FC投票得点」の変化" headings={dates} />

<h2>他の事項</h2>
<!-- <div style="width: 100%;"> -->
<div style="width: 90%; margin: 0 auto;">
	各種点数に関する用語
	<ul>
		<li>
			{@render defText(
				'入場指名数'
			)}：入場時に投票箱へ投入された票数、または入場スタッフが集計した指名の数。1人につき1ptのみで、複数チケットでの入場不可。(本ページの用語、{@render defText(
				'入場得点'
			)}ともいう)
		</li>
		<li>
			{@render defText('動員pt')}：入場指名数のこと。(
			<a href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig">2025-07</a> から運営の用語 )
		</li>
		<li>
			{@render defText(
				'FC得点'
			)}：ファンクラブ投票の順位に応じて各グループに付与される点数。(本ページの用語)
		</li>
		<li>
			{@render defText('FC pt / FC投票順位pt')}：FC得点のこと。 (
			<a href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig"> 2025-07 </a> から運営の用語 )
			会場規模で決まる{@render confirmed('2025-07', '1943545159154577604')}
		</li>
		<li>
			{@render defText('総合得点')}：入場指名数＋FC得点の総和 (本ページの用語)
		</li>
		<li>
			{@render defText('得点')}： 入場指名数、FC得点、総合得点のいずれか (本ページの用語)
		</li>
		<li>
			{@render defText(
				'ポイント / pt'
			)}：各戦の総合得点に基づき決定された順位に応じて付与される点数のこと。(本ページの用語)
		</li>
		<li>
			{@render defText('リーグポイント / リーグpt')}： ポイントのこと。(
			<a href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig"> 2025-07 </a> から運営の用語. さらに、1つの戦で獲得できるものを「リーグ獲得pt」、シーズン全体で累計したものを「リーグ合計pt」と区別する
			)
		</li>
	</ul>
	各戦で、
	<ul>
		<li>
			<span style="font-weight: bolder;">「入場指名数」＋「FC得点」＝「総合得点」</span>
			(ただし、FC投票が行われない戦もある)
		</li>
		<li>総合得点に基づいて順位（戦順位）を決定し、その順位に応じて「ポイント」を付与</li>
		<li>各リーグ内ランキングは、各戦のポイントの合計により決まります</li>
		<li>
			ゲストも得点が集計されるため、他のグループの獲得リーグptに影響します {@render confirmed(
				'2025-08',
				'1957373881947435427',
				'例：2025-07 League 2 大阪戦'
			)}
		</li>
	</ul>

	シーズン終了に関する事項
	<ul>
		<li>シーズン期間：2025リーグ1は5月から9月まで計6戦。</li>
		<li>
			{@render defText('最終ランキング')}：
			リーグポイントで決まる。ただし、同点の場合は累計総動員数により順位を調整する。{@render confirmed(
				'2025-08',
				'1955555152917930171'
			)}
		</li>
		<li>
			{@render defText('上位グループ')}：リーグ１の場合は最終ランキングの1～4位 {@render confirmed(
				'2025-08',
				'1955555152917930171'
			)}、リーグ２の場合は1～4位 {@render confirmed('2025-08', '1957373881947435427')}
		</li>
		<li>
			{@render defText('下位グループ')}：リーグ１の場合はランキングの下位4グループ 、リーグ２はなし
		</li>
		<li>
			{@render defText('入れ替え戦')}：参戦グループは リーグ１の下位グループ ＋
			リーグ２の上位グループ
			<br />
			➡ 昇格降格は入れ替え戦の結果で決まる。（基準未明）
		</li>
		<li>
			{@render defText('決勝リーグ')}
			参戦グループは リーグ1の上位グループ {@render confirmed('2025-08', '1955555152917930171')}
		</li>
		<li>
			<s>
				リーグ１で全バトルにおいて1位を獲得したグループは{@render defText('殿堂入り')}となります {@render confirmed(
					'２戦目のツイート',
					'1923694990804517087'
				)}
			</s>
			<br />
			※
			<a href="https://pbs.twimg.com/media/Gvjb_TXbQAADK5S.jpg:orig">３戦目のツイート</a
			>からこのルールを削除する (?)
		</li>
		<!-- <li>殿堂入りグループは今後リーグ戦免除する {@render cautionText()}</li> -->
	</ul>

	<!-- <p style="font-size: smaller; color: #777;">※要確認事項：ソースを教えてください。</p> -->
</div>
<!-- </div> -->

{#snippet defText(t)}
	「<span class="definition">{t}</span>」
{/snippet}

{#snippet cautionText()}
	&nbsp;<span class="caution">（ ※要確認！）</span>&nbsp;
{/snippet}

{#snippet confirmed(date, src, comment = '')}
	&nbsp; <span class="confirmed"
		>（ <a href={`https://x.com/heroines_idol/status/${src}`}>{date}で確認済み</a> &nbsp; {comment}）
	</span> &nbsp;
{/snippet}

<style>
	.confirmed {
		color: var(--color-theme-1);
		font-size: small;
	}

	.caution {
		color: red;
		font-size: small;
	}

	.definition {
		font-weight: bold;
		color: darkorchid;
	}
</style>
