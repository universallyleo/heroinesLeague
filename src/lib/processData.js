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
/** @type {LeagueDataRaw[]} */
export const leagueOne = [];
/** @type {LeagueDataRaw[]} */
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
 * @property {number[]} assignedPt calculate from LPFormula
 * @property {number[]} accumPt
 * @property {number[]} accumPtDiff
 * @property {number[]} accumRank
 * @property {GuestMatchData[]} guestResults
 * @property {number[]} [assignedLP] calculated based on rawdata's lpFormula, only for later joined group
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
 */

//#region timetable
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

/**
 * @param  {MatchDataRaw} matchDataRaw
 * @return {boolean}
 */
export function hasTT(matchDataRaw) {
	return matchDataRaw.timetable.length == 0
		? false
		: matchDataRaw.timetable.reduce((accum, { time }) => accum && time[0].length == 4, true);
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
	// let numGp = raw.groups.length;

	for (const [sn, match] of Object.entries(raw.matches)) {
		let n = parseInt(sn);
		// console.log(`************ ${n} ************ (${match.date})`);
		/** @type {MatchDataExt} */
		let mExt = { ...match }; // faster than structured clone; our data are only array of numbers and strings anyway

		let hasRes = hasResult(match);
		mExt.shortdate = ShortJPDate(match.date, true);
		mExt.displayType = hasRes ? 'RESULT' : hasTT(match) ? 'TT_ONLY' : 'NONE';
		(mExt.hasFC = 'fcRankToCount' in match), (mExt.hasShimei = hasRes && 'shimeiNum' in match);
		mExt.fcRankToCount = match?.fcRankToCount ?? raw.fcRankToCount;
		mExt.rankToPoints = match?.rankToPoints ?? raw.rankToPoints;
		if (!('guestIdx' in match)) {
			mExt.guestIdx = [];
		}

		let totalCount = [];
		if ('fcRank' in match) {
			mExt.fcCount = match.fcRank.map((x) => mExt.fcRankToCount[x - 1]);
			totalCount = mExt.fcCount;
		}
		if ('shimeiNum' in match) {
			rankDiffAssign(match.shimeiNum, mExt, 'shimeiRank', 'shimeiDiff');
			mExt.shimeiTotal = [match.shimeiNum.reduce((a, x) => a + x, 0), null];

			if ('fcRank' in match) {
				totalCount = totalCount.map((x, i) => x + match.shimeiNum[i]);
				rankDiffAssign(totalCount, mExt, '', 'countDiff');
			} else {
				totalCount = match.shimeiNum;
				mExt.countDiff = mExt.shimeiDiff;
			}
		}

		let rankedData = match.rank ? rank(match.rank, (a, b) => a - b) : rank(totalCount);
		mExt.totalRank = rankedData.rank;
		mExt.getLPt = rankedData.rank.map((r) => mExt.rankToPoints[r - 1]);
		// mExt.getLPtDiff = diffFromRanked(mExt.getLPt, rankedData.rank, rankedData.prev);

		mExt.assignedLP = new Array(res.groups.length).fill(0).map((_, i) =>
			// just return the index to apply formula
			// do not calculate now, calculate after processed all match data
			i >= mExt.getLPt.length && 'lpFormulae' in match
				? match.lpFormulae.findIndex(({ group }) => group === res.groups[i])
				: null
		);

		// tidy guest data if there is any
		mExt.guestResults = [];
		if ('guestShimeiFC' in match) {
			let shimei = match.guestShimeiFC.map((x) => x[1]);
			mExt.shimeiTotal[1] = shimei.reduce((a, x) => a + x);
			let shimeiRk = rank(shimei);
			let diff = diffFromRanked(shimei, shimeiRk.rank, shimeiRk.prev);
			let gd = match.guestShimeiFC.map((x, i) => {
				let prevCount =
					i == 0 ? x[1] + x[3] : match.guestShimeiFC[i - 1][1] + match.guestShimeiFC[i - 1][3];
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
		res.matches[n] = mExt;
		// console.log(mExt);
	}

	// if (res.league == 1) {
	// 	console.log(
	// 		'first loop finished.',
	// 		res.matches.map(({ totalRank }) => totalRank)
	// 	);
	// }

	// loop again to process advanced data
	for (const [sn, match] of Object.entries(res.matches)) {
		if (match.totalRank.length > 0) {
			let n = parseInt(sn);

			match.assignedLP = match.assignedLP.map((lpfIdx, i) => {
				if (lpfIdx != null) {
					let gpLPts = res.matches.map(({ getLPt }) => (i < getLPt.length ? getLPt[i] : 0));
					let f = eval(raw.matches[n].lpFormulae[lpfIdx].lp);
					return lpfIdx >= 0 ? f(gpLPts) : 0;
				} else {
					return 0;
				}
			});
			// console.log(`${n} (${match.date})`, 'assingedLP: ', match.assignedLP);
			match.accumPt = match.assignedLP.map(
				(pt, i) =>
					((x) => (x > 0 ? x : null))(
						Math.floor(
							//! not sure whether they use round down or round up or normal rounding...
							pt +
								(i < match.getLPt.length ? match.getLPt[i] : 0) +
								(n > 0 ? res.matches[n - 1].accumPt[i] : 0)
						)
					) // accum pt = assigned point + league pt from battle + previous accum. pt
			);

			// console.log(`${n} (${match.date})`, 'accumPt: ', match.accumPt);
			rankDiffAssign(match.accumPt, match, 'accumRank', 'accumPtDiff');
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
 * @property {number} totalRank
 *
 * @typedef {Object} LastData
 * @property {number} matchID index of the last match in season
 * @property {number[]} rankToPoints
 * @property {GroupLastData[]} rankedGps
 */
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
 * @property {number[]} [assignedLP] = calculated from LPFormula, different from points get from battle
 * @property {number[]} accumPt
 * @property {number[]} accumPtDiff
 * @property {number[]} accumRank
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
		gpResultData[i] = { group: gp, id: i, rankNow: resultdata.matches[n].accumRank[i] };
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
		if (resultdata.league == '1') {
			gpResultData[i].category =
				gpResultData[i].rankNow <= 4
					? 'upperGp'
					: gpResultData[i].rankNow > resultdata.groups.length - 4
						? 'lowerGp'
						: '';
		} else if (resultdata.league == '2') {
			gpResultData[i].category = gpResultData[i].rankNow <= 3 ? 'upperGp' : '';
		}
	}

	gpResultData.sort((a, b) => ordering.accumRank(a.accumRank[n], b.accumRank[n]));
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
 * @property {number} league
 * @property {LeagueDataExt} extData
 * @property {GroupResultSeries[]} resByGp
 * @property {MatchSummary[]} summary
 */
/** @type {SeasonLeagueData[][]} */
export const dataCollection = [leagueOne, leagueTwo].map((leagueSeasonData, i) => {
	let LS = [];
	for (let j = 0; j < leagueSeasonData.length; j++) {
		/** @type {SeasonLeagueData} */
		// @ts-ignore
		let res = { league: i + 1, season: j + 1, extData: CalculateLeagueResult(leagueSeasonData[j]) };
		res.resByGp = partitionResultToSortedGroups(res.extData);
		res.summary = extractSummaryFromLeagueResExt(res.extData);
		LS.push(res);
	}
	return LS;
});
// console.log(dataCollection);
