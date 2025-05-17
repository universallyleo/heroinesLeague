// import aggregate from "$lib/data/aggregate.json";
import { rank, ShortJPDate, isFuture } from './util.js';

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
 * @property {Array<number>} [result] array of number of 指名入場
 * @property {Array<number>} [rank] both result and rank are read in the order of the league data group
 * @property {string} [src] source of match result data
 * { league: "1",
 * 	groups: ["A", "B", "C"],
 *  matches: [ {date, venu, rank: [3,1,2]} ]}
 * means group A is ranked 3, group B is ranked 1, group C is ranked 2
 *
 * @typedef {Object} LeagueDataRaw
 * @property {string} league
 * @property {Array<string>} groups
 * @property {Array<number>} [rankToPoints] n-th entry = points given to (n+1)st place group
 * @property {Array<MatchDataRaw>} matches array of all matches data
 *
 * @typedef {Object} GroupResult
 * @property {string} group
 * @property {number[]} entrancePt
 * @property {number[]} individualRank
 * @property {number[]} getPt points calculated using rankToPoints
 * @property {number[]} accum
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
 * @return {GroupResult[]}
 */
export function CalculateResult(raw) {
	// let res = structuredClone(raw);
	// let numGrp = raw.groups.length;
	// res.pointsData = new Array(numGrp);
	let gpResultData = raw.groups.map((g) => {
		return { group: g, entrancePt: [], individualRank: [], getPt: [], accum: [] };
	});

	for (const [n, match] of Object.entries(raw.matches)) {
		let ranked = 'rank' in match ? match.rank : 'result' in match ? rank(match.result) : [];
		if (ranked.length == 0) continue; // skip future matches
		// for (const [i, r] of Object.entries(ranked)) {
		for (let i = 0; i < ranked.length; i++) {
			let x = raw.rankToPoints[ranked[i] - 1]; // ranking starts from 1, so minus one
			gpResultData[i].entrancePt.push('rank' in match ? -1 : match.result[i]);
			gpResultData[i].individualRank.push(ranked[i]);
			gpResultData[i].getPt.push(x);
			gpResultData[i].accum.push(parseInt(n) > 0 ? gpResultData[i].accum[parseInt(n) - 1] + x : x);
		}
	}
	let n = gpResultData[0].accum.length;
	return gpResultData.toSorted((a, b) => b.accum[n - 1] - a.accum[n - 1]);
}

/**
 * @param  {GroupResult[]} resultdata
 * @param  {'accum'|'entrancePt'|'individualRank'} series
 */
export function seriesFromResult(resultdata, labels, series) {
	let out = { labels, datasets: [] };
	for (const gp of resultdata) {
		out.datasets.push({
			label: groupDisplayShort(gp.group),
			// data: [null, ...gp[series]] // add empty entry at first to get more space in graph
			data: gp[series]
		});
	}
	return out;
}
