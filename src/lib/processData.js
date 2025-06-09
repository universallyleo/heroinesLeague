// import aggregate from "$lib/data/aggregate.json";
import { rank, ShortJPDate, isFuture, diffFromRanked } from './util.js';

const groupFiles = import.meta.glob('./data/groups/*.json', { eager: true });
const leagueOneFiles = import.meta.glob('./data/league1/*.json', { eager: true });
const leagueTwoFiles = import.meta.glob('./data/league2/*.json', { eager: true });
export const leagueOne = [];
export const leagueTwo = [];
export const groups = [];
[
	[groupFiles, groups],
	[leagueOneFiles, leagueOne],
	[leagueTwoFiles, leagueTwo]
].forEach(([f, g]) => {
	Object.keys(f).map((path) => {
		// @ts-ignore
		g.push(f[path]);
	});
});
// Object.keys(leagueOneFiles).map((path) => {leagueOne})
// Object.keys(groupFiles).map((path) => {
// 	groups.push(groupFiles[path]);
// });

/**
 * @typedef {Object} SNSData
 * @property {string} [twitter]
 * @property {string} [ig] isntagram
 * @property {string} [tiktok]
 * @property {string} [yt]
 *
 * @typedef {Object} MemberData
 * @property {string} name Romanji name for identifier
 * @property {string} display display name
 * @property {string} [nickname] 愛称
 * @property {string} color member color for display
 * @property {string} colorCode member color in HEX
 * @property {string} [bday]
 * @property {string} join join date
 * @property {string} [left] left date
 * @property {string} [leftReason] gradate/withdraw/fire/support-ended
 * @property {SNSData} [sns]
 *
 * @typedef {Object} GroupData
 * @property {string} id
 * @property {string} displayName
 * @property {string[]} [displayNameAlt]
 * @property {string} [displayShort]
 * @property {string} debut debut date
 * @property {SNSData} sns
 * @property {Array<MemberData>} members
 */

//#region group info fn
/**
 * @param  {string} search_id
 * @return {GroupData}
 */
export function getGroup(search_id) {
	return groups.find(({ id }) => id === search_id);
}

export function groupDisplayShort(search_id) {
	let g = getGroup(search_id);
	return g ? ('displayShort' in g ? g.displayShort : g.displayName) : search_id;
}

/**
 *
 * @typedef {Object} StageSchedule
 * @property {string} group group ID
 * @property {Array<string>} time starts and ends time
 * @property {Array<string>} tokuten starts and ends time of buppan
 *
 * @typedef {Object} MatchDataRaw
 * @property {string} date
 * @property {string} venue
 * @property {Array<StageSchedule>} timetable
 * @property {Array<number>} [rankToPoints] n-th entry = points given to (n+1)st place group
 * @property {Array<number>} [shimeiNum] array of number of 指名入場
 * @property {Array<number>} [fcRank] array of FC投票 ranking
 * @property {Array<number>} [fcRankToCount] n-th entry = counts given to (n+1)st placed group
 * @property {Array<number>} [rank] both result and rank are read in the order of the league data group
 * @property {Array<string>} [src] array of sources of match result data
 * if have shimei and fcRank
 * 		=> match rank determined by (fcRankToCount + shimeiNum)
 * { league: "1",
 * 	groups: ["A", "B", "C"],
 *  matches: [ {date, venu, rank: [3,1,2]} ]}
 * means group A is ranked 3, group B is ranked 1, group C is ranked 2
 *
 * @typedef {Object} MatchDataExt
 * @extends MatchDataRaw
 * @property {number[]} [shimeiRank]
 * @property {number[]} [shimeiDiff]
 * @property {number[]} [fcCount]
 * @property {number[]} totalRank
 * @property {number[]} getPt
 * @property {number[]} accumPt
 * @property {number[]} accumPtDiff
 * @property {number[]} accumRank
 *
 * @typedef {Object} LeagueDataRaw
 * @property {string} league
 * @property {Array<string>} groups
 * @property {Array<number>} [rankToPoints] n-th entry = points given to (n+1)st place group
 * @property {Array<number>} [fcRankToCount] n-th entry = counts given to (n+1)st placed group
 * @property {Array<MatchDataRaw>} matches array of all matches data
 *
 * @typedef {Object} LeagueDataExt
 * @property {string} league
 * @property {Array<string>} groups
 * @property {Array<number>} [rankToPoints] n-th entry = points given to (n+1)st place group
 * @property {Array<number>} [fcRankToCount] n-th entry = counts given to (n+1)st placed group
 * @property {Array<MatchDataExt>} matches array of all matches data
 *
 *
 * @typedef {Object} GroupResultSeries
 * @property {string} group  i-th entry of each of the remaining properties is the data from i-th match
 * @property {number[]} shimeiNum
 * @property {number[]} shimeiRank
 * @property {number[]} shimeiDiff difference in shimei number from the group of one rank higher
 * @property {number[]} fcRank
 * @property {number[]} fcCount calculated using fcRankToCount
 * @property {number[]} totalRank determined by fcCount+shimeiNum
 * @property {number[]} getPt = rankToPoints[totalRank]
 * @property {number[]} accumPt
 * @property {number[]} accumPtDiff
 * @property {number[]} accumRank
 * // @property {number[]} shimeiLostRatio
 */

//#region match data fn
/**
 * @param  {LeagueDataRaw} raw
 * @return {string[]}
 */
export function matchDates(raw) {
	return raw.matches.map(({ date }) => ShortJPDate(date, true));
}
/**
 * @param  {LeagueDataRaw} raw
 * @return {MatchDataRaw[]}
 */
export function futureMatches(raw) {
	return raw.matches.filter(({ date }) => isFuture(date));
}

/**
 * @param  {LeagueDataRaw} raw
 * @return {LeagueDataExt}
 */
export function CalculateLeagueResult(raw) {
	const res = Object.fromEntries(
		['league', 'groups', 'rankToPoints', 'fcRankToCount']
			.filter((k) => k in raw)
			.map((k) => [k, raw[k]])
	);
	res.matches = [];
	let numGp = raw.groups.length;

	for (const [sn, match] of Object.entries(raw.matches)) {
		let n = parseInt(sn);
		/** @type {MatchDataExt} */
		let mExt = { ...match }; // faster than structured clone; our data are only array of numbers anyway

		// skip calculation if no result record
		if (['shimeiNum', 'fcRank', 'rank'].reduce((p, c) => p && !(c in match), true)) {
			mExt.totalRank = Array(numGp).fill(-1);
			mExt.getPt = Array(numGp).fill(0);
			mExt.accumPt = n > 0 ? res.matches[n - 1].accumPt : Array(numGp).fill(0);
			mExt.accumDiff = Array(numGp).fill(0);
			continue;
		}

		let rkConvert = match?.rankToPoints ?? raw.rankToPoints;
		// let rkptDiff = rkConvert.reduce(
		// 	(res, pt, i, o) => ((res[i] = i > 0 ? pt - o[i - 1] : -1), res),
		// 	[]
		// );
		let fcConvert = match?.fcRankToCount ?? raw.fcRankToCount;
		let totalCount = [];
		if ('fcRank' in match) {
			mExt.fcCount = match.fcRank.map((x) => fcConvert[x - 1]);
			totalCount = mExt.fcCount;
		}
		if ('shimeiNum' in match) {
			totalCount =
				totalCount.length > 0 ? totalCount.map((x, i) => x + match.shimeiNum[i]) : match.shimeiNum;
			let shimeiRk = rank(match.shimeiNum);
			mExt.shimeiRank = shimeiRk.rank;
			mExt.shimeiDiff = diffFromRanked(match.shimeiNum, shimeiRk.rank, shimeiRk.prev);
		}
		// if (totalCount.length == 0) totalCount = match.rank;

		let rankedData = totalCount.length == 0 ? rank(match.rank, (a, b) => a - b) : rank(totalCount);
		mExt.totalRank = rankedData.rank;
		mExt.getPt = rankedData.rank.map((r) => rkConvert[r - 1]);

		mExt.accumPt =
			n > 0 ? mExt.getPt.map((pt, i) => pt + res.matches[n - 1].accumPt[i]) : mExt.getPt;
		rankedData = rank(mExt.accumPt);
		mExt.accumRank = rankedData.rank;
		mExt.accumPtDiff = diffFromRanked(mExt.accumPt, rankedData.rank, rankedData.prev);

		res.matches[n] = mExt;
	}
	// @ts-ignore
	return res;
}

/**
 * @param  {LeagueDataExt} resultdata
 * @return {GroupResultSeries[]}
 */
export function partitionResultToSortedGroups(resultdata) {
	let keys = [
		'shimeiNum',
		'shimeiRank',
		'shimeiDiff',
		'fcRank',
		'fcCount',
		'totalRank',
		'getPt',
		'accumPt',
		'accumPtDiff',
		'accumRank'
	];
	let gpResultData = [];

	for (const [si, gp] of Object.entries(resultdata.groups)) {
		let i = parseInt(si);
		gpResultData[i] = { group: gp };
		for (const key of keys) {
			gpResultData[i][key] = resultdata.matches.map((m) => (key in m ? m[key][i] : null));
		}
	}
	let n = resultdata.matches.length;
	// @ts-ignore
	gpResultData.sort((a, b) => a.accumRank[n - 1] - b.accumRank[n - 1]);
	// @ts-ignore
	return gpResultData;
}

/**
 * @param  {GroupResultSeries[]} gpresultdata
 * @param  {string[]} labels
 * @param  {'accumPt'|'shimeiNum'|'fc'|'totalRank'} series
 */
export function seriesFromResult(gpresultdata, labels, series) {
	return {
		labels,
		datasets: gpresultdata.map((gr) => {
			return {
				label: groupDisplayShort(gr.group),
				data: gr[series]
			};
		})
	};
}
