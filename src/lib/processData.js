// import aggregate from "$lib/data/aggregate.json";
import {
	rank,
	ShortJPDate,
	isFuture,
	palette,
	rankDiffAssign,
	diffFromRanked,
	deltaTime,
	padNum,
	sortMethod
} from './util.js';

const groupFiles = import.meta.glob('./data/groups/*.json', { eager: true });
const leagueOneFiles = import.meta.glob('./data/league1/*.json', { eager: true });
const leagueTwoFiles = import.meta.glob('./data/league2/*.json', { eager: true });
const playoffsFiles = import.meta.glob('./data/playoffs/*.json', { eager: true });
const championLeagueFiles = import.meta.glob('./data/champion/*.json', { eager: true });
/**
 * @enum {number}
 */
export const LeagueType = { CHAMP: 0, ONE: 1, TWO: 2, PLAYOFFS: 3};

/** @type {LeagueDataRaw[]} */
export const leagueOne = [];
/** @type {LeagueDataRaw[]} */
export const leagueTwo = [];
/** @type {LeagueDataRaw[]} */
export const playoffs = [];
/** @type {LeagueDataRaw[]} */
export const champLeague = [];
export const groups = [];
[
	[groupFiles, groups],
	[championLeagueFiles, champLeague],
	[leagueOneFiles, leagueOne],
	[leagueTwoFiles, leagueTwo],
	[playoffsFiles, playoffs]
].forEach(([f, g]) => {
	Object.keys(f).map((path) => {
		// @ts-ignore
		g.push(f[path]);
	});
});

// Object.keys(groupFiles).map((path) => {
// 	groups.push(groupFiles[path]);
// });
//TODO: think about using matchUID and dynamic param to render match details
// export const matchUID = [leagueOne, leagueTwo]
// 	.map((data, i) =>
// 		data.map(({ matches }) =>
// 			matches.map(({ date }) => `L${i + 1}M${date.replace(/-/g, '').slice(2)}`)
// 		)
// 	)
// 	.flat(2);

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
	return (
		groups.find(({ id }) => id === search_id) ?? {
			id: search_id,
			displayName: search_id,
			debute: '',
			sns: {},
			members: []
		}
	);
}

export function groupDisplayShort(search_id) {
	let g = getGroup(search_id);
	return g?.displayShort ?? g.displayName;
}

//#region object def
/**
 *
 * @typedef {Object} StageSchedule
 * @property {string} group group ID
 * @property {Array<string>} time starts and ends time
 * @property {Array<string>} tokuten starts and ends time of buppan
 *
 * @typedef {[string, number, number, number]} GuestDataRaw [codename, shimeiNum, FCrank, FCpt]
 *
 * @typedef {Object} AssignMatchLPt
 * @property {string} group
 * @property {string} lp league pt get at the this match.  In reality this is a function ((getLPts:number[])=>number)
 * storing function is now allowed in JSON, so store as string and evaluates later
 * (this is unsafe, but we are in a closed system so acceptable)
 * example:
			"lpFormulae": [
				{
					"group": "ion",
					"lp": "(pts)=>Math.floor((pts[3]+pts[4]+pts[5])/3*0.7)"
				}
			]
 *
 * @typedef {Object} MatchDataRaw
 * @property {string} date
 * @property {string} venue
 * @property {string} tweet url to tweet of timetable
 * @property {Array<string>} [rules] url to tweet of rules
 * @property {Array<StageSchedule>} timetable
 * @property {Array<number>} [rankToPoints] n-th entry = points given to (n+1)st place group
 * @property {Array<number>} [shimeiNum] array of number of 指名入場
 * @property {Array<number>} [fcRank] array of FC投票 ranking
 * @property {Array<number>} [fcRankToCount] n-th entry = counts given to (n+1)st placed group
 * @property {Array<number>} [rank] both result and rank are read in the order of the league data group
 * @property {Array<string>} [src] array of sources of match result data
 * @property {GuestDataRaw} [guestShimeiFC]
 * @property {string[]} [comments]
 * @property {number[]} [guestIdx]
 * @property {AssignMatchLPt[]} [lpFormulae]
 * if have shimei and fcRank
 * 		=> match rank determined by (fcRankToCount + shimeiNum)
 * { league: "1",
 * 	groups: ["A", "B", "C"],
 *  matches: [ {date, venu, rank: [3,1,2]} ]}
 * means group A is ranked 3, group B is ranked 1, group C is ranked 2
 *
 * @typedef {Object} GuestResultData
 * @property {string} group
 * @property {number[]} [shimeiRank] these are array just for conveniences, they all only have one entry
 * @property {number[]} [shimeiDiff]
 * @property {number[]} [fcRank]
 * @property {number[]} [fcCount]
 * @property {number[]} [countDiff]
 * @property {number[]} totalRank
 * @property {number[]} [getLPt]
 *
 * @typedef {Object} MatchDataExt
 * @extends MatchDataRaw
 * @property {string} shortdate
 * @property {boolean} hasFC
 * @property {boolean} hasShimei
 * @property {string} displayType one of 'RESULT', 'TT_ONLY', 'NONE'
 * @property {number[]} [shimeiRank]
 * @property {number[]} [shimeiDiff]
 * @property {[number,number]} [shimeiTotal] 1st entry = only match member, 2nd = include guest
 * @property {number[]} [fcCount]
 * @property {number[]} countDiff
 * @property {number[]} totalRank
 * @property {number[]} getLPt
 * @property {number[]} [assignedLP] only for later joined group
 * @property {number[]} accumShimei
 * @property {number[]} accumPt
 * @property {number[]} accumPtDiff
 * @property {number[]} accumRank
 * @property {GuestMatchData[]} guestResults
 *
 * @typedef {Object} LeagueDataRaw
 * @property {number} league
 * @property {string} title
 * @property {Array<string>} groups
 * @property {Array<number>} [rankToPoints] n-th entry = points given to (n+1)st place group
 * @property {Array<number>} [fcRankToCount] n-th entry = counts given to (n+1)st placed group
 * @property {Array<MatchDataRaw>} matches array of all matches data
 * @property {number} assignLPWeight weighting on league pts assigned to groups in match they have not yet participated (league assigned in each match = WEIGHTED average of partcipated matches)
 *
 * @typedef {Object} LeagueDataExt
 * @property {number} league
 * @property {string} title
 * @property {Array<string>} groups
 * @property {Array<number>} [rankToPoints] n-th entry = points given to (n+1)st place group
 * @property {Array<number>} [fcRankToCount] n-th entry = counts given to (n+1)st placed group
 * @property {Array<MatchDataExt>} matches array of all matches data
 * @property {number} assignLPWeight weighting on league pts assigned to groups in match they have not yet participated (league assigned in each match = average of league pts in all particpated matches * weight)
 */

//#region timetable
/**
 * @param  {MatchDataRaw} matchDataRaw
 * @return {boolean}
 */
export function hasTT(matchDataRaw) {
	return matchDataRaw.timetable.length == 0
		? false
		: matchDataRaw.timetable.reduce((accum, { time }) => accum && time[0].length == 4, true);
}

/**
 * @typedef {Object} TTSlot
 * @property {string} type one of 'group', 'rest', 'guest'
 * @property {string} group  i-th entry of each of the remaining properties is the data from i-th match
 * @property {[string,string]} time
 * @property {[string,string]} tokuten
 */
export function refineTT(tt, guestIdx = []) {
	let g = 0;
	let nextGuestIdx = (i) => (i < guestIdx.length ? guestIdx[i] : -1);
	let res = [{ ...tt[0], type: nextGuestIdx(g) == 0 ? 'guest' : 'group' }];
	g = nextGuestIdx(g) == 0 ? 1 : g;

	for (let i = 1; i < tt.length; i++) {
		let dt = deltaTime(tt[i - 1].time[1], tt[i].time[0]);
		if (dt > 0) {
			res.push({
				type: 'rest',
				group: 'rest',
				time: [tt[i - 1].time[1], tt[i].time[0]],
				tokuten: [padNum(dt), '']
			});
		}
		if (nextGuestIdx(g) == i) {
			res.push({ ...tt[i], type: 'guest' });
			g++;
		} else {
			res.push({ ...tt[i], type: 'group' });
		}
	}
	return res;
}

export function getGuestIdx(groups, rawTT, rawMatch) {
	let knownGuest = new Set(rawMatch?.guestShimeiFC ?? []);
	// let res = (rawMatch?.guestShimeiFC ?? []).map((x) => rawTT.find(({ group }) => group == x[0]));
	let gSet = new Set(groups).difference(knownGuest);
	let res = rawTT.map(({ group }, i) => (gSet.has(group) ? -1 : i)).filter((i) => i !== -1);
	return [...new Set(res)].sort((a, b) => a - b);
}

//#region match data fn

export const ordering = {
	totalRank: (a, b) => sortMethod.incWithNullAtLast(a, b),
	shimeiNum: (a, b) => sortMethod.decWithNullAtLast(a, b),
	fcCount: (a, b) => sortMethod.decWithNullAtLast(a, b),
	accumPt: (a, b) => sortMethod.decWithNullAtLast(a, b),
	accumRank: (a, b) => sortMethod.incWithNullAtLast(a, b)
};

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
 * @param  {MatchDataExt[]} extMatches
 * @returns {number} index of last match with record
 */
export function lastFinishedMatchID(extMatches) {
	return extMatches.findLastIndex(({ totalRank }) => totalRank.length > 0);
	// return extMatches.reduceRight(
	// 	(foundIdx, m, idx) => (foundIdx !== -1 ? foundIdx : m.accumPt[0] !== undefined ? idx : -1),
	// 	-1
	// );
}

export function hasResult(matchDataRaw) {
	return 'shimeiNum' in matchDataRaw || 'rank' in matchDataRaw;
}

/**
 * @typedef {Object} ResultType
 * @property {boolean} hasShimei
 * @property {boolean} hasFC
 *
 * @param  {GroupResultSeries} gpResult
 * @param  {number} matchID=0, which match we consider
 * @return {ResultType}
 */
export function resultTypes(gpResult, matchID = 0) {
	let hasShimei = gpResult.shimeiNum[matchID] != null;
	let hasFC = gpResult.fcCount[matchID] != null;
	return { hasShimei, hasFC };
}

//#region main calculation
/**
 * @param  {MatchDataRaw} rawMatch
 * @param  {number} numPlayers
 * @param  {number[]} fcRankToCount
 * @param  {number[]} rankToPoints
 * @param  {MatchDataExt|null} prevMatchExt=null
 */
function ExtendMatchData(rawMatch, numPlayers, fcRankToCount, rankToPoints, prevMatchExt = null) {
	/** @type {MatchDataExt} */
	let mExt = { ...rawMatch }; // faster than structured clone; our data are only array of numbers and strings anyway
	let hasPrevMatch = prevMatchExt !== null;
	let hasRes = hasResult(rawMatch);
	mExt.shortdate = ShortJPDate(rawMatch.date, true);
	mExt.displayType = hasRes ? 'RESULT' : hasTT(rawMatch) ? 'TT_ONLY' : 'NONE';
	mExt.hasFC = 'fcRankToCount' in rawMatch;
	mExt.hasShimei = hasRes && 'shimeiNum' in rawMatch;

	mExt.fcRankToCount = rawMatch?.fcRankToCount ?? fcRankToCount;
	mExt.rankToPoints = rawMatch?.rankToPoints ?? rankToPoints;

	if (hasRes) {
		let totalCount = [];
		if (mExt.hasFC) {
			mExt.fcCount = rawMatch.fcRank.map((x) => mExt.fcRankToCount[x - 1]);
			totalCount = mExt.fcCount;
		}

		if (mExt.hasShimei) {
			rankDiffAssign(rawMatch.shimeiNum, mExt, 'shimeiRank', 'shimeiDiff');
			mExt.shimeiTotal = [rawMatch.shimeiNum.reduce((a, x) => a + x, 0), null];
			mExt.accumShimei = hasPrevMatch
				? rawMatch.shimeiNum.map(
						(x, i) => x + (i < prevMatchExt.accumShimei.length ? prevMatchExt.accumShimei[i] : 0)
					)
				: rawMatch.shimeiNum;

			if (mExt.hasFC) {
				totalCount = totalCount.map((x, i) => x + rawMatch.shimeiNum[i]);
				rankDiffAssign(totalCount, mExt, '', 'countDiff');
			} else {
				totalCount = rawMatch.shimeiNum;
				mExt.countDiff = mExt.shimeiDiff;
			}
		} else {
			//update accumShimei even if there is shimei data for current match
			mExt.accumShimei = hasPrevMatch
				? prevMatchExt.accumShimei
				: new Array(rawMatch.rank.length).fill(0);
		}

		// having rank in rawMatch allows over-riding ranking determined by counts;
		// e.g. when there is guest who can changes ranking but without publicised shimei/FC data.

		let rankedData = 'rank' in rawMatch ? rank(rawMatch.rank, (a, b) => a - b) : rank(totalCount);
		mExt.totalRank = 'rank' in rawMatch ? rawMatch.rank : rankedData.rank;
		mExt.getLPt = mExt.totalRank.map((r) => mExt.rankToPoints[r - 1]);
		// mExt.getLPtDiff = diffFromRanked(mExt.getLPt, rankedData.rank, rankedData.prev);
		//  console.log(`** L${raw.league} ***** ${n} **** (${rawMatch.date})`);
		// 	console.log(`totalRank: `, mExt.totalRank);
		// 	console.log(`getLPt: `, mExt.getLPt);
		//  set accumPt=0 for groups not joined yet
		mExt.accumPt = new Array(numPlayers)
			.fill(0)
			.map(
				(_, i) =>
					(i < mExt.getLPt.length ? mExt.getLPt[i] : 0) +
					(hasPrevMatch ? prevMatchExt.accumPt[i] : 0)
			);

		// flag positions of groups that needs to assign LP by taking entry=0
		mExt.assignedLP = new Array(numPlayers)
			.fill()
			.map((_, i) => (i >= mExt.getLPt.length ? 0 : null));
		// console.log(`assignLP: `, mExt.assignedLP);
	} else {
		mExt.accumShimei = [];
		mExt.totalRank = [];
		mExt.getLPt = [];
		mExt.assignedLP = [];
	}

	// tidy guest data if there is any
	if (!('guestIdx' in rawMatch)) {
		mExt.guestIdx = [];
	}
	mExt.guestResults = [];
	if ('guestShimeiFC' in rawMatch) {
		let shimei = rawMatch.guestShimeiFC.map((x) => x[1]);
		mExt.shimeiTotal[1] = shimei.reduce((a, x) => a + x);
		let shimeiRk = rank(shimei);
		let diff = diffFromRanked(shimei, shimeiRk.rank, shimeiRk.prev);
		let gd = rawMatch.guestShimeiFC.map((x, i) => {
			let prevCount =
				i == 0 ? x[1] + x[3] : rawMatch.guestShimeiFC[i - 1][1] + rawMatch.guestShimeiFC[i - 1][3];
			return {
				group: x[0],
				shimeiNum: [x[1]],
				shimeiRank: [shimeiRk.rank[i]],
				shimeiDiff: [diff[i]],
				fcRank: [x[2] == -1 ? null : x[2]],
				fcCount: [x[3] == -1 ? null : x[3]],
				totalRank: [i + 1],
				countDiff: [prevCount - x[1] - Math.max(x[3], 0)],
				getLPt: [-1] // for distinguish guest from match groups
			};
		});
		mExt.guestResults = gd;
	}

	return mExt;
}

/**
 * @param  {LeagueDataRaw} raw
 * @return {LeagueDataExt}
 */
export function CalculateLeagueResult(raw) {
	const res = Object.fromEntries(
		['league', 'groups', 'rankToPoints', 'fcRankToCount', 'assignLPWeight']
			.filter((k) => k in raw)
			.map((k) => [k, raw[k]])
	);
	res.matches = [];
	// let numGp = raw.groups.length;

	console.log(`********* League ${raw.league} ************ `);
	// let firstJoinAt = new Array(raw.groups.length);
	for (const [sn, match] of Object.entries(raw.matches)) {
		let n = parseInt(sn);
		console.log(`************ ${n} ************ (${match.date})`);
		let mExt = ExtendMatchData(
			match,
			raw.groups.length,
			raw.fcRankToCount,
			raw.rankToPoints,
			n > 0 ? res.matches[n - 1] : null
		);
		// console.log(mExt);
		res.matches[n] = mExt;
	}

	let finalMatchWithResult = lastFinishedMatchID(res.matches);
	console.log(`*** Final Match with result: ${finalMatchWithResult+1}***`);
	let joinAfter = res.matches.reduce(
		(arr, { assignedLP }, j) => assignedLP.length>0?(assignedLP.map((v, i) => (v === 0 ? j : arr[i]))):arr,
		new Array(raw.groups.length).fill(null)
	);
	let finalAssignedLP = joinAfter.map((v, i) =>
		v
			? (res.matches[finalMatchWithResult].accumPt[i] * raw.assignLPWeight) /
				(finalMatchWithResult - v)
			: null
	);

	// loop again to process advanced data
	for (const [sn, match] of Object.entries(res.matches)) {
		match.accumRank = new Array(match.totalRank.length); // ensure final output always have accumRank
		if (match.totalRank.length > 0) {
			let n = parseInt(sn);
			let realLPs = match.assignedLP.map((v, i) =>
				v === 0 ? finalAssignedLP[i] : match.getLPt[i]
			);

			// console.log(`*** Loop2 match ${n} ***`);
			if (n < finalMatchWithResult) {
				// use the assignedLP calclated at k-th match to get accumRank of k-th match
				// instead of using final assignedLP
				let assignLPAtTheTime = joinAfter.map((v, i) =>
					v && n > v ? (match.accumPt[i] * raw.assignLPWeight) / (n - v) : null
				);
				let adjusted = assignLPAtTheTime.map(
					(v, i) => match.accumPt[i] + (v === null ? 0 : assignLPAtTheTime[i] * (joinAfter[i] + 1))
				);
				// console.log('adjusted: ', adjusted);
				rankDiffAssign(adjusted, match, 'accumRank', 'accumPtDiff');

				// update accum LP with FINAL confimred assigned-LP's
				match.accumPt = realLPs.map((p, i) => p + (n == 0 ? 0 : res.matches[n - 1].accumPt[i]));
			} else {
				// update accum LP first
				match.accumPt = realLPs.map((p, i) => p + (n == 0 ? 0 : res.matches[n - 1].accumPt[i]));
				rankDiffAssign(match.accumPt, match, 'accumRank', 'accumPtDiff');

				// for final match, refine ranking using accumulated shimei num
				let sortedRanks = match.accumRank.toSorted((a, b) => a - b);
				// console.log(sortedRanks);
				for (let i = 0; i < sortedRanks.length - 1; i++) {
					if (sortedRanks[i] == sortedRanks[i + 1]) {
						// find all entries with the same rank
						let indices = match.accumRank
							.map((x, j) => (x == sortedRanks[i] ? j : -1))
							.filter((x) => x > -1);
						// refine ranking by accumulative shimei num
						let sortedShimei = indices
							.map((j) => [j, match.accumShimei[j]])
							.toSorted((a, b) => b[1] - a[1]);
						for (let k = 0; k < sortedShimei.length; k++) {
							match.accumRank[sortedShimei[k][0]] += k;
						}
					}
				}
				// console.log(match.accumRank);
			}

			// remove from league ranking until the group joins league battle formally.
			match.accumRank = match.accumRank.slice(0, match.totalRank.length);
		}
	}

	// console.log(res);
	// @ts-ignore
	return res;
}

/**
 * @typedef {Object} MatchSummary
 * @property {string} shortdate
 * @property {string} venue
 * @property {number[]} fcRankToCount
 * @property {number[]} rankToPoints
 * @property {number} shimeiTotal
 * @property {string} displayType
 * @property {boolean} hasFC
 * @property {boolean} hasShimei
 * @property {number[]} guestIdx
 */

/**
 * @param {LeagueDataExt} leagueResExt
 * @returns {MatchSummary[]}
 */
export function extractSummaryFromLeagueResExt(leagueResExt) {
	return leagueResExt.matches.map(
		({
			shortdate,
			venue,
			fcRankToCount,
			rankToPoints,
			shimeiTotal,
			displayType,
			hasFC,
			hasShimei,
			guestIdx
		}) => ({
			shortdate,
			venue,
			fcRankToCount,
			rankToPoints,
			shimeiTotal,
			displayType,
			hasFC,
			hasShimei,
			guestIdx
		})
	);
}

/**
 * @typedef {Object} GroupLastData
 * @property {string} group
 * @property {number} accumPt
 * @property {number} accumPtDiff
 * @property {number} accumRank
 * @property {number} accumShimei
 * @property {number} totalRank
 *
 * @typedef {Object} LastData
 * @property {number} matchID index of the last match in season
 * @property {number[]} rankToPoints
 * @property {GroupLastData[]} rankedGps
 */

/**
 * @param {LeagueDataExt} extData
 * @returns {LastData}
 */
export function extractLastMatchDataByGroups(extData) {
	let n = lastFinishedMatchID(extData.matches);
	let lastMatch = extData.matches[n];
	// console.log(lastMatch.rankToPoints);
	//! does not yet handle the case when there is special assigned league pt.
	return {
		matchID: n,
		rankToPoints: lastMatch.rankToPoints,
		rankedGps: extData.groups
			.map((gp, i) => {
				return {
					group: gp,
					accumPt: lastMatch.accumPt[i],
					accumPtDiff: lastMatch.accumPtDiff[i],
					accumRank: lastMatch.accumRank[i],
					accumShimei: lastMatch.accumShimei[i],
					totalRank: lastMatch.totalRank[i]
				};
			})
			.toSorted((a, b) => ordering.accumRank(a.accumRank, b.accumRank))
	};
}

//#region Series handling
/**
 * @typedef {Object} GroupResultSeries
 * @property {string} group  i-th entry of each of the remaining properties is the data from i-th match
 * @property {number} id
 * @property {number} rankNow
 * @property {"upperGp"|"lowerGp"|""} category 上位・下位グループ
 * @property {number[]} shimeiNum
 * @property {number[]} shimeiRank
 * @property {number[]} shimeiDiff difference in shimei number from the group of one rank higher
 * @property {number[]} fcRank
 * @property {number[]} fcCount calculated using fcRankToCount
 * @property {number[]} totalRank determined by fcCount+shimeiNum
 * @property {number[]} countDiff
 * @property {number[]} getLPt = rankToPoints[totalRank]
 * @property {number[]} [assignedLP] = calculated from getLPt, different from points get from battle
 * @property {number[]} accumPt
 * @property {number[]} accumPtDiff
 * @property {number[]} accumRank
 * @property {number} accumShimei
 */

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
		'countDiff',
		'getLPt',
		'assignedLP',
		'accumPt',
		'accumPtDiff',
		'accumRank'
	];
	/** @type {GroupResultSeries[]} */
	let gpResultData = [];
	// let n = resultdata.matches.findLastIndex(({ accumRank }) => accumRank.length > 0);
	let n = lastFinishedMatchID(resultdata.matches);
	// console.log('n=', n, ' out of ', resultdata.matches.length, ' matches');

	for (const [si, gp] of Object.entries(resultdata.groups)) {
		let i = parseInt(si);

		// @ts-ignore
		gpResultData[i] = {
			group: gp,
			id: i,
			rankNow: n >= 0 ? resultdata.matches[n].accumRank[i] : i + 1,
			accumShimei: n >= 0 ? resultdata.matches[n].accumShimei[i] : 0
		};
		for (const key of keys) {
			// !every data that has no value will be default to null
			// if(gp == 'ion'){
			// 	console.log(`i=${i}: key=${key}, in data=${key in m}`)
			// }
			gpResultData[i][key] = resultdata.matches.map((m) =>
				key in m ? (m[key].length > i ? m[key][i] : null) : null
			);
		}
		//! hardcoded category criteria (for now...)
		if (resultdata.league == LeagueType.ONE || resultdata.league == LeagueType.PLAYOFFS) {
			gpResultData[i].category =
				gpResultData[i].rankNow <= 4
					? 'upperGp'
					: gpResultData[i].rankNow > resultdata.groups.length - 4
						? 'lowerGp'
						: '';
		} else if (resultdata.league == LeagueType.TWO) {
			gpResultData[i].category = gpResultData[i].rankNow <= 4 ? 'upperGp' : '';
		} else {
			gpResultData[i].category = '';
		}
	}

	if (n >= 0) {
		gpResultData.sort((a, b) => ordering.accumRank(a.accumRank[n], b.accumRank[n]));
	}
	// console.log('gpResultData', gpResultData);
	return gpResultData;
}

// dashed segment for data gap in series
// see: https://www.chartjs.org/docs/latest/samples/line/segments.html
const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined);
/**
 * @param  {GroupResultSeries[]|GroupLastData[]} gpresultdata
 * @param  {string[]} labels
 * @param  {'accumPt'|'accumRank'|'totalRank'|'shimeiNum'|'shimeiPercent'|'fcRank'} series
 */
export function seriesFromResult(gpresultdata, labels, series, shimeiTotal = []) {
	return {
		labels,
		datasets: gpresultdata.map((gr, i) => {
			return {
				label: groupDisplayShort(gr.group),
				data:
					series !== 'shimeiPercent'
						? gr[series]
						: gr['shimeiNum'].map((n, j) =>
								shimeiTotal[j] ? ((n * 100) / shimeiTotal[j][0]).toFixed(2) : null
							),
				borderColor: `${palette[i]}`,
				backgroundColor: `${palette[i]}`,
				pointHitRadius: 20, // larger area for intersect detection
				segment: {
					borderColor: (ctx) => skipped(ctx, 'rgb(0,0,0,0.5)'),
					borderDash: (ctx) => skipped(ctx, [6, 6])
				},
				spanGaps: true
			};
		})
	};
}

/**
 * @param  {string} strID
 * @param {string} pattern  a key of matchPattern to tell which pattern to match
 * return any subarray of [s,l,m], where s=season number, l=league number, m=match number; depneding on match pattern
 */
export function getIndexFromID(strID, pattern) {
	let strs = strID.match(matchPattern[pattern]);
	return strs ? strs.slice(1).map((d) => parseInt(d) - 1) : [];
}

//#region season handling

const matchPattern = {
	seasonLeague: /S(\d+)L(\d+)/,
	seasonLeagueMatch: /S(\d+)L(\d+)M(\d+)/,
	leagueMatch: /L(\d+)M(\d+)/
};

/**
 * @typedef {Object} SeasonLeagueData
 * @property {number} season
 * @property {number} league  1=1, 2=2, 3=playoffs, 0=champion
 * @property {string} title  1=1, 2=2, 3=playoffs, 0=champion
 * @property {LeagueDataExt} extData
 * @property {GroupResultSeries[]} resByGp
 * @property {MatchSummary[]} summary
 */
/** @type {SeasonLeagueData[][]} */
export const dataCollection = [champLeague, leagueOne, leagueTwo, playoffs].map(
	(leagueSeasonData, i) => {
		let LS = [];
		for (let j = 0; j < leagueSeasonData.length; j++) {
			let extData = CalculateLeagueResult(leagueSeasonData[j]);
			/** @type {SeasonLeagueData} */
			let res = {
				league: i + 1,
				title: leagueSeasonData[j].title,
				season: j + 1,
				extData: extData,
				resByGp: partitionResultToSortedGroups(extData),
				summary: extractSummaryFromLeagueResExt(extData)
			};
			LS.push(res);
		}
		return LS;
	}
);
// console.log(dataCollection);
// console.log(dataCollection[0]);
