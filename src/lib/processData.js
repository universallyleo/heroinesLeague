import {
	rank,
	betterObjectFromEntries,
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
const gradeUpFiles = import.meta.glob('./data/gradeup/*.json', { eager: true });
/**
 * @enum {number}
 */
export const LeagueType = { CHAMP: 0, ONE: 1, TWO: 2, PLAYOFFS: 3 };

/** @type {LeagueDataRaw[]} */
export const leagueOne = [];
/** @type {LeagueDataRaw[]} */
export const leagueTwo = [];
/** @type {LeagueDataRaw[]} */
export const playoffs = [];
/** @type {LeagueDataRaw[]} */
export const champLeague = [];
/** @type {LeagueDataRaw[]} */
export const gradeUp = [];
export const groups = [];
[
	[groupFiles, groups],
	[championLeagueFiles, champLeague],
	[leagueOneFiles, leagueOne],
	[leagueTwoFiles, leagueTwo],
	[playoffsFiles, playoffs],
	[gradeUpFiles, gradeUp]
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
 * RAW = score directly to point; RANKED = rank the score first then use a pre-assigned table to convert to point
 * @enum {number}
 */
export const CountType = { RAW_COUNT: 0, RANKED_HIDDEN_VOTE: 2, RANKED_WITH_VOTE: 1 };
/**
 *
 * @typedef {Object} MatchPointRecord
 * @property {number[]} [count]  count of -1 are ignored.
 * @property {Array<number|null>} [vote] vote of -1 are ignored; null = no data/not applicable.
 * @property {number[]} [voteDiff]
 * @property {number[]} [rank] not needed even if data is ranked and count is provided (rank will be computed back from count)
 * @property {number[]} [rankToCount]
 *
 *  * add category when needed
 * @typedef {Object} MatchPointRecordCollec
 * @property {MatchPointRecord} FC
 * @property {MatchPointRecord} Abema
 * @property {MatchPointRecord} MC
 *
 * @typedef {Object} MatchPointType
 * @property {string} label
 * @property {number} id  requirement: ScoreType[this.label] = this.id
 * @property {string} icon
 * @property {string} [longLabel]
 * @property {string} [additionalLabel] follows long/jp label
 * @property {string[]} jpLabel
 * @property {string} sortKey
 * @property {CountType} countType
 */
/** @type {MatchPointType[]} */
export const MatchPointsData = [
	{
		label: 'FC',
		id: 0,
		icon: '🗳️',
		longLabel: 'FC Pt',
		jpLabel: ['FC投票Pt', 'FC pt'],
		sortKey: 'fcCount',
		countType: CountType.RANKED_HIDDEN_VOTE
	},
	{
		label: 'Abema',
		id: 1,
		icon: '▶️',
		longLabel: 'Abmea Pt',
		jpLabel: ['Abema Pt', 'Ab.pt'],
		sortKey: 'abemaCount',
		countType: CountType.RANKED_WITH_VOTE
	},
	{
		label: 'MC',
		id: 2,
		icon: '🎙️',
		longLabel: 'MC Pt',
		jpLabel: ['MC指名Pt', 'MC pt'],
		sortKey: 'mcCount',
		countType: CountType.RAW_COUNT
	}
];
/**
 *
 * @typedef {Object} StageSchedule
 * @property {string} group group ID
 * @property {Array<string>} time starts and ends time
 * @property {Array<string>} tokuten starts and ends time of buppan
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
 * @property {Array<number>} rankToLP n-th entry = points given to (n+1)st place group
 * @property {MatchPointRecordCollec} [mPts] to handle FC pt, Abema pt, etc.
 * @property {Array<number>} [shimeiNum] array of number of 指名入場
 * @property {Array<number>} [rank] both result and rank are read in the order of the league data group
 * @property {Array<string>} [src] array of sources of match result data
 * @property {string[]} [guests] codename of the guests with result data, i-th guest will have data in each match pt record in the ((length of main players)+i)-th entry
 * @property {string[]} [comments]
 * @property {number[]} [guestTTidx] index of guest group in Timetable's stage order
 * @property {string[]} [resultRecord]
 * @property {AssignMatchLPt[]} [lpFormulae]
 * 
 //* * @property {Array<number>} [fcRank] array of FC投票 ranking
 //* * @property {Array<number>} [fcRankToCount] n-th entry = counts given to (n+1)st placed group
 // * @property {Array<number>} [abemaRank] Abema Rank (new from 2026)
 // * @property {Array<number>} [abemaRankToCount] Abema Rank (new from 2026)
 //  * @property {[string,number]} [guestAbemaRk] [groupName, abemaRank]
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
 * @property {number[]} [abmeaRank]
 * @property {number[]} [abemaCount]
 * @property {number[]} [countDiff]
 * @property {number[]} [totalCount]
 * @property {number[]} totalRank
 * @property {number[]} [getLPt]
 */

/**
 * @enum {number}
 * 0 = scoring category not included in current match
 * 1 = scoring category is included in current match, but no result recorded yet
 * 2 = scoring category is included and results has been recorded;
 */
const ResultRecordType = { NA: 0, included: 1, hasResult: 2 };
/** 
 * @typedef {Object} HasResultType
 * @property {boolean} hasShimei
 * @property {ResultRecordType} FC
 * @property {ResultRecordType} Abmea
 * @property {ResultRecordType} MC
 * 
 * @typedef {Object} RankCountDiffData
 * @property {string} scoreType
 * @property {number[]} rank
 * @property {number[]} count
 * @property {number[]} diff
 *  * 
 * @typedef {Object} MatchDataExt
 * @extends MatchDataRaw
 * @property {string} shortdate 
 * @property {number} numActivePlayers 
 * @property {HasResultType} hasResults
//  * @property {boolean} hasFC
//  * @property {boolean} hasFCResult
//  * @property {boolean} hasShimei
//  * @property {boolean} hasAbema
//  * @property {boolean} hasAbemaResult
 * @property {string} displayType one of 'RESULT', 'TT_ONLY', 'NONE'
 * @property {number[]} [shimeiRank]
 * @property {number[]} [shimeiDiff]
 * @property {[number,number]} [shimeiTotal] 1st entry = only match member, 2nd = include guest
//  * @property {number[]} [fcCount]
//  * @property {number[]} [abemaRank]
//  * @property {number[]} [abemaDiff]
 * @property {number[]} totalCount
 * @property {number[]} countDiff
 * @property {number[]} totalRank
 * @property {number[]} getLPt
 * @property {number[]} [assignedLP] only for later joined group
 * @property {number[]} accumShimei
 * @property {number[]} [accumPPV]
 * @property {number[]} accumPt
 * @property {number[]} accumPtDiff
 * @property {number[]} accumRank
 * @property {GuestResultData[]} guestResults
 *
 * @typedef {Object} LeagueDataRaw
 * @property {number} league
 * @property {number} season
 * @property {string} title
 * @property {Array<string>} groups
 * @property {Array<MatchDataRaw>} matches array of all matches data
 * @property {number} [lastUpperGroup]
 * @property {number} [topLowerGroup] this number should be less than 0 (= counting from the last.  last group=-1, 2nd last=-2, etc.)
 * @property {number} assignLPWeight weighting on league pts assigned to groups in match they have not yet participated (league assigned in each match = WEIGHTED average of partcipated matches)
 *
 * @typedef {Object} LeagueDataExt
 * @property {number} league
 * @property {number} season
 * @property {string} title
 * @property {Array<string>} groups
 * @property {Array<MatchDataExt>} matches array of all matches data
 * @property {number} [lastUpperGroup]
 * @property {number} [topLowerGroup]
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
	let knownGuest = new Set(rawMatch?.guests ?? []);
	// let res = (rawMatch?.guests ?? []).map((x) => rawTT.find(({ group }) => group == x[0]));
	let gSet = new Set(groups).difference(knownGuest);
	let res = rawTT.map(({ group }, i) => (gSet.has(group) ? -1 : i)).filter((i) => i !== -1);
	return [...new Set(res)].sort((a, b) => a - b);
}

//#region match data fn

export const ordering = {
	totalRank: (a, b) => sortMethod.incWithNullAtLast(a, b),
	shimeiNum: (a, b) => sortMethod.decWithNullAtLast(a, b),
	mPts: (a, b, i, cat) => {
		const sortOn =
			MatchPointsData.find(({ label }) => label == cat)?.countType == CountType.RANKED_WITH_VOTE
				? 'vote'
				: 'count';
		return sortMethod.decWithNullAtLast(a.mPts[cat][sortOn][i], b.mPts[cat][sortOn][i]);
	},
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

// export function resultTypes(gpResult, matchID = 0) {
// 	let hasShimei = gpResult.shimeiNum[matchID] != null;
// 	let hasFC = gpResult.fcCount[matchID] != null;
// 	let hasAbema = gpResult.abemaCount[matchID] != null;
// 	return { hasShimei, hasFC, hasAbema };
// }

/**
 * Use raw data to compute rank-diff of each match pt type, and details which match pt type is present and is with record
 * !!NOTE: this mutates mPts
 *
 * @param {MatchPointRecordCollec} mPts
 * @param {boolean} [hasShimei=false]
 * @returns {HasResultType}
 */
function initResultTypeAndExtendMatchPoint(mPts, hasShimei = false) {
	// console.log('***initiale match point extension: ', mPts);

	const otherMP = Object.fromEntries(
		MatchPointsData.map((restype) => {
			const hasCat = mPts ? restype.label in mPts : false;
			// extends match point data here (not part of return value)
			let hasResult = false;
			if (hasCat) {
				const data = mPts[restype.label]; //! this is mutated

				if (restype.countType != CountType.RAW_COUNT) {
					if ('vote' in data && data.vote.length > 0) {
						rankDiffAssign(data.vote, data, 'rank', 'voteDiff');
						hasResult = true;
					} else if ('rank' in data && data.rank.length > 0) {
						// const { prev } = rank(data.rank, sortMethod.incWithNullAtLast);
						// data.diff = diffFromRanked(data.rank, data.rank, prev);
						hasResult = true;
					}
					data.count = hasResult ? data.rank.map((r) => data.rankToCount[r - 1]) : [];
				} else {
					if ('count' in data && data.count.length > 0) {
						rankDiffAssign(data.count, data, 'rank', 'voteDiff');
						hasResult = true;
					}
				}
			}

			return [
				restype.label,
				hasCat
					? hasResult
						? ResultRecordType.hasResult
						: ResultRecordType.included
					: ResultRecordType.NA
			];
		})
	);
	// console.log(otherMP);
	// console.log('***initiale match point extension: done ');
	// @ts-ignore
	return { hasShimei, ...otherMP };
}

//#region main calculation

function refinedRankFromTotalCount(totalCount, shimeiNum) {
	let data = totalCount.map((x, i) => [x, shimeiNum[i]]);
	// first compoare totalCount, if tied, then compare shimeiNum
	return rank(
		data,
		(a, b) => sortMethod.decWithNullAtLast(a[0], b[0]) || sortMethod.decWithNullAtLast(a[1], b[1])
	);
}

/**
 * @param  {MatchDataRaw} rawMatch
 * @param  {string[]} leaguePlayers
 * @param  {MatchDataExt|null} prevMatchExt=null
 */
function ExtendMatchData(rawMatch, leaguePlayers, prevMatchExt = null) {
	/** @type {MatchDataExt} */
	// @ts-ignore
	let mExt = { ...rawMatch }; // faster than structured clone; our data are only array of numbers and strings anyway
	if (!('mPts' in mExt)) mExt.mPts = {};
	let hasPrevMatch = prevMatchExt !== null;
	// @ts-ignore
	let hasMatchRecord = 'shimeiNum' in rawMatch || 'rank' in rawMatch;
	mExt.shortdate = ShortJPDate(rawMatch.date, true);
	mExt.displayType = hasMatchRecord ? 'RESULT' : hasTT(rawMatch) ? 'TT_ONLY' : 'NONE';
	mExt.hasShimei = hasMatchRecord && 'shimeiNum' in rawMatch;
	mExt.hasResults = initResultTypeAndExtendMatchPoint(rawMatch.mPts, mExt.hasShimei);

	const mptd = mExt.mPts;

	const numGuests = 'guests' in rawMatch ? rawMatch.guests.length : 0;
	let guestTotalCount = [];
	// exclude those in TT but shimei/FC not counted
	const numPlayers = rawMatch?.shimeiNum?.length ?? rawMatch.rankToLP.length;
	// number of groups that are in league in the current match
	const numActivePlayers =
		numGuests > 0
			? Math.min(
					...rawMatch.guests.map((g) => {
						const i = leaguePlayers.indexOf(g);
						return i > 0 ? i : leaguePlayers.length;
					}),
					numPlayers,
					rawMatch.rankToLP.length
				)
			: numPlayers;

	// if (rawMatch.date == '2025-08-06') {
	// 	console.log(
	// 		`${rawMatch.date} numActive ${numActivePlayers} numPlayers ${numPlayers} numGuests ${numGuests}`
	// 	);
	// }

	mExt.numActivePlayers = numActivePlayers;

	// if (rawMatch.date == '2025-07-14') {
	// 	console.log(
	// 		'numGuests:',
	// 		numGuests,
	// 		' |activePlayers:',
	// 		numActivePlayers,
	// 		' |leaguePlayers num:',
	// 		leaguePlayers.length
	// 	);
	// }

	// mExt.hasFC = 'fcRankToCount' in rawMatch;
	// mExt.hasFCResult = mExt.hasFC && 'fcRank' in rawMatch;
	// // @ts-ignore
	// mExt.fcRankToCount = rawMatch?.fcRankToCount ?? [];
	// mExt.hasAbema = 'abemaRankToCount' in rawMatch;
	// mExt.hasAbemaResult = mExt.hasAbema && 'abemaRank' in rawMatch;
	// // @ts-ignore
	// mExt.abemaRankToCount = rawMatch?.abemaRankToCount ?? [];

	// console.log('Processing: ', rawMatch.date);
	if (hasMatchRecord) {
		/** @type {number[]} */
		let totalCount = MatchPointsData.reduce(
			(acc, { label }) => acc.map((val, i) => val + (mptd?.[label]?.count?.[i] ?? 0)),
			Array(numPlayers).fill(0)
		);

		// if (rawMatch.date == '2026-05-20') {
		// 	console.log('Abema', mExt.mPts.Abema);
		// }

		// if (mExt.hasFCResult) {
		// 	// @ts-ignore
		// 	mExt.fcCount = rawMatch.fcRank.map((x) => mExt.fcRankToCount[x - 1]);
		// 	totalCount = mExt.fcCount;
		// }

		// if (mExt.hasAbemaResult) {
		// 	// @ts-ignore
		// 	mExt.abemaCount = rawMatch.abemaRank.map((x) => mExt.abemaRankToCount[x - 1]);
		// 	// @ts-ignore
		// 	totalCount = mExt.hasFC ? totalCount.map((x, i) => x + mExt.abemaCount[i]) : mExt.abemaCount;
		// }

		if (mExt.hasShimei) {
			rankDiffAssign(
				rawMatch.shimeiNum.slice(0, numActivePlayers),
				mExt,
				'shimeiRank',
				'shimeiDiff'
			);
			mExt.shimeiTotal = [rawMatch.shimeiNum.reduce((a, x) => a + x, 0), null];
			mExt.accumShimei = hasPrevMatch
				? rawMatch.shimeiNum.map(
						(x, i) => x + (i < prevMatchExt.accumShimei.length ? prevMatchExt.accumShimei[i] : 0)
					)
				: rawMatch.shimeiNum;

			totalCount = totalCount.map((x, i) => x + rawMatch.shimeiNum[i]);
			guestTotalCount = totalCount.slice(numActivePlayers);
			rankDiffAssign(totalCount, mExt, '', 'countDiff');
		} else {
			// only happens if match rank is public without shimeiNum
			//update accumShimei even if there is no shimei data for current match
			mExt.accumShimei = hasPrevMatch
				? prevMatchExt.accumShimei
				: new Array(rawMatch.rank.length).fill(0);
		}

		// console.log('*** mpd: ', mExt?.mPts);
		// console.log('*** accumShimei: ', mExt.accumShimei);
		// console.log('*** rank data now');

		// having rank in rawMatch allows over-riding ranking determined by counts;
		// e.g. when there is guest who can changes ranking but without publicised shimei/FC data.

		let rankedData =
			'rank' in rawMatch
				? rank(rawMatch.rank, (a, b) => a - b)
				: refinedRankFromTotalCount(
						totalCount.slice(0, numActivePlayers),
						mExt.shimeiNum.slice(0, numActivePlayers)
					);

		// if (rawMatch.date == '2025-08-06') {
		// 	console.log('rankedData: (length =', rankedData.rank.length, '), data=', rankedData);
		// }
		mExt.totalRank = 'rank' in rawMatch ? rawMatch.rank : rankedData.rank;
		mExt.totalCount = totalCount;
		// if no rankToLP data, then just use totalCount as league point.
		mExt.getLPt = mExt.totalRank.map((r, i) =>
			'rankToLP' in mExt
				? i < mExt.rankToLP.length
					? mExt.rankToLP[r - 1]
					: 0
				: totalCount[rankedData.inv[r - 1]]
		);
		// mExt.getLPtDiff = diffFromRanked(mExt.getLPt, rankedData.rank, rankedData.prev);
		// console.log(`totalRank: `, mExt.totalRank);
		// console.log(`getLPt: `, mExt.getLPt);

		//  set accumPt=0 for groups not joined yet
		mExt.accumPt = new Array(leaguePlayers.length)
			.fill(0)
			.map(
				(_, i) =>
					(i < mExt.getLPt.length ? mExt.getLPt[i] : 0) +
					(hasPrevMatch ? prevMatchExt.accumPt[i] : 0)
			);

		// flag positions of groups that needs to assign LP by taking entry=0
		mExt.assignedLP = new Array(leaguePlayers.length)
			.fill()
			.map((_, i) => (i >= numActivePlayers ? 0 : null));
		// if (numActivePlayers < leaguePlayers.length) {
		// 	console.log(`(numActivePlayers < leaguePlayers) assignLP: `, mExt.assignedLP);
		// }
	} else {
		mExt.accumShimei = [];
		mExt.totalRank = [];
		mExt.totalCount = [];
		mExt.getLPt = [];
		mExt.assignedLP = [];
	}

	// tidy guest data if there is any
	if (!('guestIdx' in rawMatch)) {
		// @ts-ignore
		mExt.guestIdx = [];
	}
	mExt.guestResults = [];
	if ('guests' in rawMatch && hasMatchRecord) {
		// if (numActivePlayers + numGuests != mExt.shimeiNum.length) {
		// if (rawMatch.date == '2025-06-26') {
		// 	console.log(
		// 		`** numActivePlayers: ${numActivePlayers} | numGuests: ${numGuests} | numShimeiRecord: ${mExt.shimeiNum.length}`
		// 	);
		// }
		let shimei = rawMatch.guests.map((_, i) => mExt.shimeiNum[numActivePlayers + i]);
		// @ts-ignore
		mExt.shimeiTotal[1] = shimei.reduce((a, x) => a + x);
		let shimeiRk = rank(shimei);
		let shimeiDiff = diffFromRanked(shimei, shimeiRk.rank, shimeiRk.prev);
		let scoreRk = rank(guestTotalCount);
		let fcData = mptd?.FC ?? null;
		let [fcRank, fcCount] =
			fcData && fcData.rank.length > numActivePlayers
				? [fcData.rank.slice(numActivePlayers), fcData.count.slice(numActivePlayers)]
				: [new Array(numGuests).fill(null), new Array(numGuests).fill(null)];

		let gd = rawMatch.guests.map((g, i) => {
			// let [fcRank, fcCount] = hasFCrank
			// 	? [fcData.rank[numActivePlayers + i], fcData.count[numActivePlayers + i]]
			// 	: [null, null];
			return {
				group: g,
				shimeiNum: [shimei[i]],
				shimeiRank: [shimeiRk.rank[i]],
				shimeiDiff: [shimeiDiff[i]],
				fcRank: [fcRank[i]],
				fcCount: [fcCount[i]],
				totalRank: [scoreRk.rank[i]],
				totalCount: [guestTotalCount[i]],
				countDiff: [scoreRk.prev[i] > -1 ? guestTotalCount[scoreRk.prev[i]] : 0],
				getLPt: [-1] // for distinguish guest from match groups
			};
		});
		// @ts-ignore
		mExt.guestResults = gd;
	}

	return mExt;
}

/**
 * @param  {LeagueDataRaw} raw
 * @return {LeagueDataExt}
 */
export function CalculateLeagueResult(raw) {
	const res = betterObjectFromEntries(
		['league', 'groups', 'season', 'title', 'assignLPWeight', 'lastUpperGroup', 'topLowerGroup'],
		raw
	);
	res.matches = [];
	// let numGp = raw.groups.length;

	// console.log(`********* League ${raw.league} ************ `);
	// let firstJoinAt = new Array(raw.groups.length);
	for (const [sn, match] of Object.entries(raw.matches)) {
		let n = parseInt(sn);
		// 	console.log(`************ ${n} ************ (${match.date})`);
		let mExt = ExtendMatchData(match, raw.groups, n > 0 ? res.matches[n - 1] : null);
		// console.log(mExt);
		res.matches[n] = mExt;
	}

	let finalMatchWithResult = lastFinishedMatchID(res.matches);
	// console.log(`*** Final Match with result: ${finalMatchWithResult + 1}***`);
	let joinAfter = res.matches.reduce(
		(arr, { assignedLP }, j) =>
			assignedLP.length > 0 ? assignedLP.map((v, i) => (v === 0 ? j : arr[i])) : arr,
		new Array(raw.groups.length).fill(null)
	);
	let finalAssignedLP = joinAfter.map((v, i) =>
		v
			? (res.matches[finalMatchWithResult].accumPt[i] * raw.assignLPWeight) /
				(finalMatchWithResult - v)
			: null
	);

	// if (raw.league == 2) {
	// 	console.log(
	// 		'finalMatchID:',
	// 		finalMatchWithResult,
	// 		' | num match in leagues:',
	// 		joinAfter.map((v, i) => (i > 7 ? finalMatchWithResult - v : null)).filter((x) => x != null)
	// 	);
	// 	console.log(joinAfter, finalAssignedLP);
	// 	console.log([8, 9, 10].map((i) => res.matches[finalMatchWithResult].accumPt[i]));
	// }

	// if (raw.season == 2025 && raw.league === 1) {
	// 	console.log('!!!!!! numActivePlayers !!!!!!!!!!');
	// 	console.log(res.matches.map(({ numActivePlayers }) => numActivePlayers));
	// }

	// loop again to process advanced data
	// console.log(`*** 2nd loop`);
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
 * @property {boolean} hasShimei
 * @property {HasResultType} hasResults
//  * @property {boolean} hasFC
//  * @property {boolean} hasAbema
 * @property {string} shortdate
 * @property {string} venue
//  * @property {number[]} fcRankToCount
//  * @property {number[]} abemaRankToCount
 * @property {MatchPointRecordCollec} mPts
 * @property {number[]} rankToLP
 * @property {number} shimeiTotal
 * @property {string} displayType
 * @property {number[]} guestIdx
 * @property {boolean} guestWithFCRank
 */

/**
 * @param {LeagueDataExt} leagueResExt
 * @returns {MatchSummary[]}
 */
export function extractSummaryFromLeagueResExt(leagueResExt) {
	const summaryKeys = [
		'shortdate',
		'venue',
		// 'fcRankToCount',
		'rankToLP',
		'shimeiTotal',
		'displayType',
		// 'hasFC',
		'hasShimei',
		'hasResults',
		'mPts',
		// 'hasAbema',
		// 'abemaRankToCount',
		'lastUpperGroup',
		'topLowerGroup',
		'guestIdx'
	];

	// @ts-ignore
	return leagueResExt.matches.map((match) => betterObjectFromEntries(summaryKeys, match, true));
	// return leagueResExt.matches.map((match) => {
	// 	const base = betterObjectFromEntries(summaryKeys, match, true);
	// 	base.guestWithFCRank = match.guestResults.reduce(
	// 		(/** @type {boolean} */ flag, { fcRank }) => flag || fcRank[0] > 0,
	// 		false
	// 	);
	// 	return base;
	// });
}

// /**
//  * @typedef {Object} GroupLastData
//  * @property {string} group
//  * @property {number} accumPt
//  * @property {number} accumPtDiff
//  * @property {number} accumRank
//  * @property {number} accumShimei
//  * @property {number} totalRank
//  *
//  * @typedef {Object} LastData
//  * @property {number} matchID index of the last match in season
//  * @property {number[]} rankToLP
//  * @property {GroupLastData[]} rankedGps
//  */

// /**
//  * @param {LeagueDataExt} extData
//  * @returns {LastData}
//  */
// export function extractLastMatchDataByGroups(extData) {
// 	let n = lastFinishedMatchID(extData.matches);
// 	let lastMatch = extData.matches[n];
// 	// console.log(lastMatch.rankToLP);
// 	//! does not yet handle the case when there is special assigned league pt.
// 	return {
// 		matchID: n,
// 		rankToLP: lastMatch.rankToLP,
// 		rankedGps: extData.groups
// 			.map((gp, i) => {
// 				return {
// 					group: gp,
// 					accumPt: lastMatch.accumPt[i],
// 					accumPtDiff: lastMatch.accumPtDiff[i],
// 					accumRank: lastMatch.accumRank[i],
// 					accumShimei: lastMatch.accumShimei[i],
// 					totalRank: lastMatch.totalRank[i]
// 				};
// 			})
// 			.toSorted((a, b) => ordering.accumRank(a.accumRank, b.accumRank))
// 	};
// }

//#region Series handling
/** 
 * 
 * @typedef {Object} GroupResultSeries
 * @property {string} group  i-th entry of each of the remaining properties is the data from i-th match
 * @property {number} id
 * @property {number} activeSince = p if becomes league player in the (p+1)-th match
 * @property {number} rankNow
 * @property {"upperGp"|"lowerGp"|""} category 上位・下位グループ
 * @property {number[]} shimeiNum
 * @property {number[]} shimeiRank
 * @property {number[]} shimeiDiff difference in shimei number from the group of one rank higher
//  * @property {number[]} fcRank
//  * @property {number[]} fcCount calculated using fcRankToCount
//  * @property {number[]} abemaRank
//  * @property {number[]} abemaCount
 * @property {MatchPointRecordCollec} mPts
 * @property {number[]} totalRank determined by shimeiNum+fcCount+abemaCount
 * @property {number[]} totalCount
 * @property {number[]} countDiff
 * @property {number[]} getLPt = rankToLP[totalRank]
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
		// 'fcRank',
		// 'fcCount',
		// 'abemaRank',
		// 'abemaCount',
		'totalCount',
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
	const matches = resultdata.matches;
	// let n = resultdata.matches.findLastIndex(({ accumRank }) => accumRank.length > 0);
	let n = lastFinishedMatchID(matches);
	// console.log('n=', n, ' out of ', resultdata.matches.length, ' matches');

	for (const [si, gp] of Object.entries(resultdata.groups)) {
		let i = parseInt(si);

		// @ts-ignore
		gpResultData[i] = {
			group: gp,
			id: i,
			rankNow: n >= 0 ? matches[n].accumRank[i] : i + 1,
			accumShimei: n >= 0 ? matches[n].accumShimei[i] : 0
		};
		for (const key of keys) {
			// !every data that has no value will be default to null
			// if(gp == 'ion'){
			// 	console.log(`i=${i}: key=${key}, in data=${key in m}`)
			// }
			gpResultData[i][key] = matches.map((m) =>
				key in m ? (m[key].length > i ? m[key][i] : null) : null
			);
		}
		gpResultData[i].activeSince = 0;

		// console.log(gp);
		// if (gp === 'ion' && resultdata.season == 2025 && resultdata.league === 1){
		// 	console.log("!!!!!!!!!!!! iON !!!!!!!!!!!!!!!!!!!!!!!!!")
		// }
		// @ts-ignore
		gpResultData[i].mPts = Object.fromEntries(
			MatchPointsData.map(({ label }) => {
				const vote = new Array(matches.length);
				const voteDiff = new Array(matches.length);
				const rank = new Array(matches.length);
				const count = new Array(matches.length);

				for (let m = 0; m < matches.length; m++) {
					// secretely flagging if group joins later
					gpResultData[i].activeSince += i >= matches[m].numActivePlayers ? 1 : 0;
					// if (gp === 'ion' && resultdata.season == 2025 && resultdata.league === 1){
					// 	console.log('id: ', i, ' | numActivePlayers: ')

					if ('mPts' in matches[m]) {
						const data = matches[m]?.mPts?.[label];

						vote[m] = data?.vote?.[i] ?? null;
						voteDiff[m] = data?.voteDiff?.[i] ?? null;
						rank[m] = data?.rank?.[i] ?? null;
						count[m] = data?.count?.[i] ?? null;
					} else {
						vote[m] = null;
						voteDiff[m] = null;
						rank[m] = null;
						count[m] = null;
					}

					// if (gp == 'ion' && resultdata.league == 1 && resultdata.season == 2026) {
					// if (
					// 	gp === 'ion' &&
					// 	resultdata.league == 1 &&
					// 	resultdata.season == 2025 &&
					// 	label === 'FC' &&
					// 	m > 3
					// ) {
					// console.log(`Match ${m}.  Cat ${label}.  Gp Id: ${i}`);
					// console.log('mPts', matches[m]?.mPts);
					// if (matches[m].mPts) {
					// 	console.log('has mPts');
					// 	if (label == 'Abema') {
					// 		console.log('has Abema : ', label in matches[m].mPts);
					// 		console.log('Abema : ', matches[m]?.mPts?.[label]);
					// 		console.log('rank??', matches[m]?.mPts?.[label]?.rank);
					// 		console.log('i-th rank??', matches[m]?.mPts?.[label]?.rank?.[i]);
					// 	}
					// }
					// console.log(rank[m], count[m], vote[m], voteDiff);
					// }
				}
				// if (gp === 'ion' && resultdata.league === 1 && resultdata.season == 2025) {
				// 	console.log('!!!!!!!!!!!!! ion rank');
				// 	console.log(
				// 		'mPts in series: ',
				// 		resultdata.matches.map((m) => m.mPts)
				// 	);
				// 	console.log([label, { vote, voteDiffs, rank, count }]);
				// }

				return [label, { vote, voteDiff, rank, count }];
			})
		);
		// if (gp === 'ion' && resultdata.season == 2025 && resultdata.league === 1) {
		// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		// 	// 	console.log(`gp: ${gp}. mPts: `);
		// 	console.log(gpResultData[i].activeSince);
		// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		// }
		// check grade up/down criteria
		if (n > -1) {
			const { rankNow } = gpResultData[i];
			const { lastUpperGroup, topLowerGroup, groups } = resultdata;
			// note if key is not present in the object, then it is undefined, and the comparison will be automatically "false"
			gpResultData[i].category =
				rankNow <= lastUpperGroup
					? 'upperGp'
					: rankNow >= groups.length + 1 + topLowerGroup
						? 'lowerGp'
						: '';
		}
	}

	if (n >= 0) {
		gpResultData.sort((a, b) => ordering.accumRank(a.accumRank[n], b.accumRank[n]));
	}
	// console.log('gpResultData', gpResultData);
	return gpResultData;
}

//#region Chartjs related
// dashed segment for data gap in series
// see: https://www.chartjs.org/docs/latest/samples/line/segments.html
const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined);
/**
 * @param  {GroupResultSeries[]} gpresultdata
 * @param  {string[]} labels
 * @param  {'accumPt'|'accumRank'|'totalRank'|'shimeiNum'|'shimeiPercent'|'fcRank'|'abemaVote'} series
 */
export function seriesFromResult(gpresultdata, labels, series, shimeiTotal = []) {
	return {
		labels,
		datasets: gpresultdata.map((/** @type {GroupResultSeries} */ gr, i) => {
			let data;
			switch (series) {
				case 'shimeiPercent':
					data = gr['shimeiNum'].map((n, j) =>
						shimeiTotal[j] ? ((n * 100) / shimeiTotal[j][0]).toFixed(2) : null
					);
					break;
				case 'fcRank':
					data = gr.mPts?.FC.rank ?? null;
					break;
				default:
					data = gr[series];
					break;
			}
			return {
				label: groupDisplayShort(gr.group),
				data,
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
 * @property {number} league  1=1, 2=2, 3=playoffs 入替戦, 0=champion 決勝リーグ, 4=gradeup 昇格
 * @property {string} title  1=1, 2=2, 3=playoffs, 0=champion
 * @property {LeagueDataExt} extData
 * @property {GroupResultSeries[]} resByGp
 * @property {MatchSummary[]} summary
 */
/**
 * @typedef {Object} LeagueInfo
 * @property {number} league
 * @property {string} title
 */

/** @type {Record<number, LeagueInfo[]>} */
export const leaguesOfSeason = {};

/** @type {Record<number, Record<number, SeasonLeagueData>>} */
export const dataCollection = [champLeague, leagueOne, leagueTwo, playoffs, gradeUp]
	.flatMap((leagueData, i) => leagueData.map((raw) => ({ raw, i })))
	.reduce((acc, { raw, i }) => {
		const extData = CalculateLeagueResult(raw);
		/** @type {SeasonLeagueData} */
		const res = {
			league: i,
			title: raw.title,
			season: raw.season,
			extData,
			resByGp: partitionResultToSortedGroups(extData),
			summary: extractSummaryFromLeagueResExt(extData)
		};

		if (!acc[res.season]) acc[res.season] = {};
		acc[res.season][i] = res;

		if (!leaguesOfSeason[res.season]) leaguesOfSeason[res.season] = [];
		leaguesOfSeason[res.season].push({ league: i, title: res.title });

		return acc;
	}, {});

// Sort leagues within each season according to the predefined order
const leagueOrder = [3, 0, 1, 2, 4]; // Playoffs, Champ, L1, L2, GradeUp
for (const s in leaguesOfSeason) {
	leaguesOfSeason[s].sort((a, b) => leagueOrder.indexOf(a.league) - leagueOrder.indexOf(b.league));
}

// console.log(dataCollection[1].map((x) => x.title));

/**
 * @typedef {Object} LeagueLabel
 * @property {number} season
 * @property {number} [league]  1=1, 2=2, 3=playoffs 入替戦, 0=champion 決勝リーグ, 4=gradeup 昇格
 * @property {string} [title]
 */
/**
 * @param {LeagueLabel} criteria
 * @return {SeasonLeagueData|null}
 */
export function dataCollec(criteria) {
	if (!criteria || !('season' in criteria) || (!('league' in criteria) && !('title' in criteria))) {
		console.error('missing criteria for data request');
		return null;
	}
	// console.log('Finding data: league=', criteria?.league, ' title=', criteria?.title);

	const seasonGroup = dataCollection[criteria.season];
	if (!seasonGroup) return null;

	if ('league' in criteria) {
		return seasonGroup[criteria.league] ?? null;
	}

	return Object.values(seasonGroup).find((l) => l.title === criteria.title) ?? null;
}
