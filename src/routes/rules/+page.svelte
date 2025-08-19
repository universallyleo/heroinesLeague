<script>
	import RuleChangesTable from '$lib/RuleChangesTable.svelte';
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
	let venues = $derived([
		leagueOne[0].matches.map(({ venue }) => venue),
		leagueTwo[0].matches.map(({ venue }) => venue)
	]);
	// $inspect(rankToPointsCollec[0]);
</script>

<RuleChangesTable array={rankToPointsCollec} title="「戦順位 → ポイント」の変化" headings={dates} />

<RuleChangesTable
	array={fcRankToCountCollec}
	title="「FC投票得点」の変化"
	headings={dates}
	subheadings={venues}
/>

<h2>他の事項</h2>
<!-- <div style="width: 100%;"> -->
<div style="width: 90%; margin: 0 auto;">
	各種点数に関する用語
	<div style="width: 90%; margin: 0 auto; padding: 1em 3em;">
		<table class="termTable">
			<thead>
				<tr>
					<th>本ページの用語</th>
					<th>解説</th>
					<th>運営の用語</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						{@render def('入場指名数')}, <br />
						{@render def('入場得点')}
					</td>
					<td>
						入場時に投票箱へ投入された票数、または入場スタッフが集計した指名の数。
						<br />
						1人につき1ptのみで、複数チケットでの入場不可。
					</td>
					<td>
						{@render def('動員pt')} (<a href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig"
							>2025-07</a
						>より)
					</td>
				</tr>
				<tr>
					<td> {@render def('FC得点')}</td>
					<td>
						ファンクラブ投票の順位に応じて各グループに付与される点数。
						<br /> 会場規模で決まるらしい。
					</td>
					<td>
						{@render def('FC pt')},<br />
						{@render def('FC投票順位pt')} <br /> (<a
							href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig"
						>
							2025-07
						</a>より)
					</td>
				</tr>
				<tr>
					<td> {@render def('総合得点')} </td>
					<td> 入場指名数＋FC得点の総和 </td>
					<td> </td>
				</tr>

				<tr>
					<td> {@render def('得点')} </td>
					<td> 入場指名数、FC得点、総合得点のいずれか </td>
					<td> </td>
				</tr>
				<tr>
					<td> {@render def('ポイント')}, {@render def('pt')} </td>
					<td>
						各戦の総合得点に基づき決定された順位に応じて付与される点数のこと。
						<br /> さらに、1つの戦で獲得できるものを「リーグ{@render def('獲得pt')}」、
						<br /> シーズン全体で累計したものを「リーグ{@render def('合計pt')}」と区別する
					</td>
					<td>
						{@render def('リーグポイント')}, <br />
						{@render def('リーグpt')} <br /> (<a
							href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig"
						>
							2025-07
						</a>より)
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<!-- <ul>
		<li>
			：入場時に投票箱へ投入された票数、または入場スタッフが集計した指名の数。1人につき1ptのみで、複数チケットでの入場不可。(本ページの用語、{@render def(
				'入場得点'
			)}ともいう)
		</li>
		<li>
			{@render def('動員pt')}：入場指名数のこと。(
			<a href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig">2025-07</a> から運営の用語 )
		</li>
		<li>
			{@render def(
				'FC得点'
			)}：ファンクラブ投票の順位に応じて各グループに付与される点数。(本ページの用語)
		</li>
		<li>
			{@render def('FC pt / FC投票順位pt')}：FC得点のこと。 (
			<a href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig"> 2025-07 </a> から運営の用語 )
			会場規模で決まる{@render confirmed('2025-07', '1943545159154577604')}
		</li>
		<li>
			{@render def('総合得点')}：入場指名数＋FC得点の総和 (本ページの用語)
		</li>
		<li>
			{@render def('得点')}： 入場指名数、FC得点、総合得点のいずれか (本ページの用語)
		</li>
		<li>
			{@render def(
				'ポイント / pt'
			)}：各戦の総合得点に基づき決定された順位に応じて付与される点数のこと。(本ページの用語)
		</li>
		<li>
			{@render def('リーグポイント / リーグpt')}： ポイントのこと。(
			<a href="https://pbs.twimg.com/media/Gw8LPQ5bkAAUxMM.jpg:orig"> 2025-07 </a> から運営の用語. さらに、1つの戦で獲得できるものを「リーグ獲得pt」、シーズン全体で累計したものを「リーグ合計pt」と区別する
			)
		</li>
	</ul> -->

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
		<li>
			シーズン期間
			<ul>
				<li>リーグ1: 2025年 5月～9月、計6戦。</li>
				<li>リーグ2: 2025年 5月～9月、計8戦。</li>
			</ul>
		</li>
		<li>
			{@render def('最終ランキング')}：
			リーグポイントで決まる。ただし、同点の場合は累計総動員数により順位を調整する。{@render confirmed(
				'2025-08',
				'1955555152917930171'
			)}
		</li>
		<li>
			途中参加グループ（iON!、chuLa、テンラン、ヒロ研阪）のリーグポイント：
			<div style="font-weight: bolder;vertical-align: middle; margin:1em">
				未参加の各リーグ戦の獲得ポイント = &nbsp;
				<span class="fraction">
					<span>参加した+参加予定のリーグ戦で獲得ポイント </span>
					<span class="bar"></span>
					<span>参加した＋参加予定のリーグ戦の数</span>
				</span> &nbsp; x 0.7
			</div>
			&nbsp;<span class="confirmed"
				>（ 2025-08で確認済み: <a href="https://x.com/heroines_idol/status/1955555152917930171"
					>リーグ1</a
				>, <a href="https://x.com/heroines_idol/status/1957373881947435427">リーグ2</a>）
			</span> &nbsp;
		</li>
		<li>
			{@render def('上位グループ')}：リーグ１の場合は最終ランキングの1～4位 {@render confirmed(
				'2025-08',
				'1955555152917930171'
			)}、リーグ２の場合は1～4位 {@render confirmed('2025-08', '1957373881947435427')}
		</li>
		<li>
			{@render def('下位グループ')}：リーグ１の場合はランキングの下位4グループ 、リーグ２はなし
		</li>
		<li>
			{@render def('入れ替え戦')}：参戦グループは リーグ１の下位グループ ＋ リーグ２の上位グループ
			<br />
			➡ 昇格降格は入れ替え戦の結果で決まる。（基準未明）
		</li>
		<li>
			{@render def('決勝リーグ')}
			参戦グループは リーグ1の上位グループ {@render confirmed('2025-08', '1955555152917930171')}
		</li>
		<li>
			<s>
				リーグ１で全バトルにおいて1位を獲得したグループは{@render def('殿堂入り')}となります {@render confirmed(
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

{#snippet def(t)}
	<span class="definition">{t}</span>
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
	.termTable {
		max-width: 90%;
		border-collapse: collapse;
	}
	.termTable th {
		border: black 1px solid;
		vertical-align: middle;
	}
	.termTable td {
		overflow-wrap: break-word;
		word-wrap: break-word;
		white-space: normal;
		border: 1px #999 solid;
	}
	.termTable td:first-child {
		width: 7em;
	}
	.termTable td:nth-child(2) {
		text-align: left;
	}
	.termTable td:last-child {
		width: 8em;
	}

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

	.fraction {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
		vertical-align: middle;
	}
	.fraction > span {
		display: block;
		padding: 0 0.2em;
	}
	.fraction .bar {
		width: 100%;
		height: 2px;
		background: black;
		margin: 0.1em 0;
	}
</style>
