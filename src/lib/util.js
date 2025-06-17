export function padNum(num, maxDigit, positiveOnly = true, by = '&nbsp;') {
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

export function betterObjectFromEntries(entries, source) {
	return Object.fromEntries(entries.filter((k) => k in source).map((k) => [k, source[k]]));
}

const nowDTObj = new Date();
export function isFuture(date, shift = 0) {
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

export const palette = [
	'#e41a1c',
	'#377eb8',
	'#4daf4a',
	'#984ea3',
	'#ff7f00',
	'#8dd3c7',
	'#a65628',
	'#f781bf',
	'#999999'
];
