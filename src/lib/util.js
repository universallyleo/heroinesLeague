export function padNum(num, maxDigit, positiveOnly = true, by = '&nbsp;') {
	if (isNaN(num)) return Array(maxDigit).fill('&nbsp;').join('');
	let s = positiveOnly && num < 0 ? '-' : num.toString();
	if (by == '&nbsp;') {
		let d = maxDigit - s.length;
		return (d > 0 ? Array(d).fill('&nbsp;').join('') : '') + s;
	}
	return s.padStart(maxDigit, by);
}

export function rank(arr, f = (a, b) => b - a) {
	// see https://stackoverflow.com/questions/14834571/ranking-array-elements
	// this allows same point getting same rank
	// result.inv[i] = i-th ranked entry
	// result.prev[i] = index of entry that is ranked one place higher (smaller)
	return arr
		.map((x, i) => [x, i])
		.sort((a, b) => f(a[0], b[0]))
		.reduce(
			(a, x, i, s) => {
				[a.rank[x[1]], a.prev[x[1]]] =
					i > 0 && f(s[i - 1][0], x[0]) === 0
						? [a.rank[s[i - 1][1]], a.prev[s[i - 1][1]]]
						: [i + 1, i > 0 ? s[i - 1][1] : -1];
				a.inv[i] = x[1];
				return a;
			},
			{ rank: [], prev: [], inv: [] }
		);
}

export function diffFromRanked(arr, rank, prev) {
	return arr.map((x, i) => (rank[i] > 1 ? arr[prev[i]] - x : -1));
}

/**
 *
 * @param {number[]} arr arr to rank
 * @param {Object} obj object to store the results
 * @param {string} rkKey store rankings in obj[rkKey]
 * @param {string} diffKey store difference in obj[diffKey]
 * @param {(a:number,b:number)=>number} f  compare function
 */
export function rankDiffAssign(arr, obj, rkKey, diffKey, f = (a, b) => b - a) {
	let ranked = rank(arr, f);
	if (rkKey !== '') obj[rkKey] = ranked.rank;
	if (diffKey !== '') obj[diffKey] = diffFromRanked(arr, ranked.rank, ranked.prev);
}

export function betterObjectFromEntries(entries, source) {
	return Object.fromEntries(entries.filter((k) => k in source).map((k) => [k, source[k]]));
}

export function deltaTime(fromTime, toTime) {
	//return delta time in minutes
	//assume time string format is "hhmm"
	let dh = parseInt(toTime.slice(0, 2)) - parseInt(fromTime.slice(0, 2));
	let shift = 60 * dh;
	return parseInt(toTime.slice(2)) + shift - parseInt(fromTime.slice(2));
}

const nowDTObj = new Date();
export function isFuture(date, shift = 1) {
	let target = new Date(date);
	shift == 0 ? null : target.setDate(target.getDate() + shift);
	return target.getTime() > nowDTObj.getTime();
}

export function JPDateDisplay(date) {
	let gps = date.split('-');
	return gps.length > 2 ? `${gps[0]}年${gps[1]}月${gps[2]}日` : `${gps[0]}月${gps[1]}日`;
}

export function ShortJPDate(ISOdate, noyear = false) {
	let slash = ISOdate.replace(/-/g, '/');
	return ISOdate.length > 5 ? (noyear ? slash.slice(5) : slash) : slash;
}

export function numberToKanji(num) {
	const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
	const units = ['', '十', '百', '千'];
	const bigUnits = ['', '万', '億', '兆'];

	if (num === 0) return '零';

	let result = '';
	let strNum = String(num);
	let bigUnitIndex = 0;

	while (strNum.length > 0) {
		let chunk = strNum.slice(-4); // take last 4 digits
		strNum = strNum.slice(0, -4);

		let part = '';
		for (let i = 0; i < chunk.length; i++) {
			let digit = Number(chunk[chunk.length - 1 - i]);
			if (digit !== 0) {
				// omit "一" in the "十" or "百" or "千" place if it's the only one
				if (digit === 1 && i > 0) {
					part = units[i] + part;
				} else {
					part = digits[digit] + units[i] + part;
				}
			}
		}

		if (part) {
			result = part + bigUnits[bigUnitIndex] + result;
		}
		bigUnitIndex++;
	}

	return result;
}

// cf: https://colorbrewer2.org/#type=qualitative&scheme=Paired&n=12
export const palette = [
	'#e41a1c',
	'#377eb8',
	'#4daf4a',
	'#984ea3',
	'#ff7f00',
	'#a6cee3',
	'#a65628',
	'#f781bf',
	'#b2df8a',
	'#cab2d6',
	'#555555',
	'#ffff99'
];

export const sortMethod = {
	incWithNullAtLast: (a, b) => {
		if (a === null && b === null) return 0; //allow null
		if (a === null) return 1;
		if (b === null) return -1;
		return a - b;
	},
	decWithNullAtLast: (a, b) => {
		if (a === null && b === null) return 0; //allow null
		if (a === null) return 1;
		if (b === null) return -1;
		return b - a;
	}
};

export function levelAllArrayEntries(arr, fillEntry = 0) {
	let len = Math.max(...arr.map((a) => a.length));
	return arr.map((a) => fillArrayBy(a, len, fillEntry));
}

export function fillArrayBy(arr, len, fillEntry = 0) {
	return arr.length == 0
		? Array(len).fill(fillEntry)
		: arr.length == len
			? arr
			: arr.concat(Array(len - arr.length).fill(fillEntry));
	// concat is non-destructive
}

export const findAllIndices = (arr, val) =>
	arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);
