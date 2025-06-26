function convertMBData(inputText) {
	const lines = inputText
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
	const result = [];

	const pattern =
		/^\*\s+\[\[(.+?)\]\]\s+\((.+?);\s+\{\{(?:Colortext|colortext)\|(.+?)\|(.+?)\}\}\)\s*(.*?)$/i;

	for (const line of lines) {
		const match = line.match(pattern);
		if (match) {
			const [, name, display, colorCode, color, rawJoin] = match;
			let join = rawJoin;
			const joinedMatch = rawJoin.match(/^<small>\(Joined\s+(.+)\)<\/small>$/i);
			if (joinedMatch) {
				join = joinedMatch[1].trim();
			}
			result.push({
				name,
				display,
				colorCode,
				color,
				join
			});
		}
	}

	return result;
}

export function convertJPWKExtractToJson(inputText) {
	const sections = inputText.split(/==(.+?)==/g).slice(1); // Split and discard first empty item
	const result = [];

	for (let i = 0; i < sections.length; i += 2) {
		const id = sections[i].trim();
		const content = sections[i + 1].trim();

		const [firstSubsection, secondSubsection] = content.split(/\n\s*\n/).map((s) => s.trim());
		const members = firstSubsection ? convertMBData(firstSubsection) : [];

		const sns = {};
		if (secondSubsection) {
			const lines = secondSubsection.split('\n').map((line) => line.trim());
			for (const line of lines) {
				const match = line.match(/^\*\[(.*?)\]$/);
				if (!match) continue;

				const content = match[1];
				const parts = content.split(/\s+/);
				const url = parts[0];
				const description = parts.slice(1).join(' ').toLowerCase();

				const platforms = ['twitter', 'instagram', 'tiktok', 'youtube'];
				for (const platform of platforms) {
					if (description.includes(platform)) {
						try {
							const urlObj = new URL(url);
							const segments = urlObj.pathname.split('/').filter(Boolean);
							if (segments.length > 0) {
								sns[platform] = segments[segments.length - 1];
							}
							// eslint-disable-next-line no-unused-vars
						} catch (e) {
							// Invalid URL
							continue;
						}
					}
				}
			}
		}

		const obj = { id, members };
		if (Object.keys(sns).length > 0) {
			obj.sns = sns;
		}
		result.push(obj);
	}

	return JSON.stringify(result);
}
