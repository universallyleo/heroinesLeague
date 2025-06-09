import { rank } from '$lib/util';

/**
 * @param  {import("$lib/processData").LeagueDataRaw} raw
 * @return {import("$lib/processData").GroupResultSeries[]}
 */
export function CalculateResult(raw) {
	// let res = structuredClone(raw);
	// let numGrp = raw.groups.length;
	// res.pointsData = new Array(numGrp);
	let gpResultData = raw.groups.map((g, i) => {
		return {
			group: g,
			id: i,
			shimeiNum: [],
			shimeiRank: [],
			shimeiDiff: [],
			fcRank: [],
			fcCount: [],
			totalRank: [],
			getPt: [],
			accumPt: [],
			accumRank: [],
			accumDiff: []
			// shimeiLostRatio: []
		};
	});

	let accumData = [];

	for (const [sn, match] of Object.entries(raw.matches)) {
		// skip calculation if no result record
		if (['shimeiNum', 'fcRank', 'rank'].reduce((p, c) => p && !(c in match), true)) continue;

		let n = parseInt(sn);
		let rkConvert = match?.rankToPoints ?? raw.rankToPoints;
		// let rkptDiff = rkConvert.reduce(
		// 	(res, pt, i, o) => ((res[i] = i > 0 ? pt - o[i - 1] : -1), res),
		// 	[]
		// );
		let fcConvert = match?.fcRankToCount ?? raw.fcRankToCount;
		let shimeiRk = rank(match?.shimeiNum ?? []);

		let totalRankData = rank(
			'shimeiNum' in match
				? 'fcRank' in match
					? match.shimeiNum.map((n, i) => fcConvert[match.fcRank[i] - 1] + n)
					: match.shimeiNum
				: match.rank
		);
		let accumPt = totalRankData.rank.map((r, i) =>
			rkConvert[r - 1] + n > 0 ? accumData[n - 1].data[i] : 0
		);
		accumData[n] = {
			data: accumPt,
			...rank(accumPt)
		};

		for (const gp of gpResultData) {
			let i = gp.id;
			if ('shimeiNum' in match) {
				gp.shimeiNum.push('rank' in match ? -1 : match.shimeiNum[i]);
				gp.shimeiRank.push(shimeiRk[i]);
				gp.shimeiDiff.push(
					shimeiRk.rank[i] > 1 ? match.shimeiNum[shimeiRk.prev[i]] - match.shimeiNum[i] : -1
				);
			}
			gp.fcRank.push(match?.fcRank[i] ?? 0);
			gp.fcCount.push('fcRank' in match ? fcConvert[match.fcRank[i] - 1] : 0);
			gp.totalRank.push(totalRankData.rank[i]);
			gp.getPt.push(rkConvert[totalRankData.rank[i] - 1]);
			gp.accumPt.push(accumData[n].data[i]);
			gp.accumRank.push(accumData[n].rank[i]);
			gp.accumDiff.push(
				accumData[n].rank[i] > 1
					? accumData[n].data[accumData[n].prev[i]] - accumData[n].data[i]
					: -1
			);
			// gpResultData[i].shimeiLostRatio.push(rkptDiff > -1 ? (rkptDiff / sd).toFixed(2) : 'N/A');
		}
	}

	let n = accumData.length;
	return accumData[n - 1].inv.map((i) => gpResultData[i]);
	// gpResultData.toSorted((a, b) => b.accumPt[n - 1] - a.accumPt[n - 1]);
}
