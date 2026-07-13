export function loadLocalState(key, fallback) {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (raw == null) return fallback;
		const saved = JSON.parse(raw);
		return saved != null && typeof saved === 'object' && !Array.isArray(saved)
			? { ...fallback, ...saved }
			: fallback;
	} catch {
		return fallback;
	}
}

export function saveLocalState(key, value) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(key, JSON.stringify(value));
}
