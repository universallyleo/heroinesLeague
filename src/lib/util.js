export function rank(arr, f = (a, b) => b - a) {
	// see https://stackoverflow.com/questions/14834571/ranking-array-elements
	// this allows recurring numbers
	return arr
		.map((x, i) => [x, i])
		.sort((a, b) => f(a[0], b[0]))
		.reduce(
			(a, x, i, s) => ((a[x[1]] = i > 0 && f(s[i - 1][0], x[0]) === 0 ? a[s[i - 1][1]] : i + 1), a),
			[]
		);
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
