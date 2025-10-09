import { env } from "cloudflare:workers";

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
	}
	return Math.abs(hash);
}

export function getNotifierHandlerForUid(uid: string) {
	const hash = hashString(uid);
	const instanceIndex = hash % 8; // Just in case 1 isnt enough
	const name = `notifier-${instanceIndex}`;

	return env.NOTIFIER.getByName(name);
}
