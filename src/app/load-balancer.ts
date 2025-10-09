import { env } from "cloudflare:workers";

export function getNotifierHandlerForUid(uid: string) {
	const name = "todo";

	return env.NOTIFIER.getByName(name);
}
