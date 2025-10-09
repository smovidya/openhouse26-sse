import { WorkerEntrypoint } from "cloudflare:workers";
import { getNotifierHandlerForUid } from "./app/load-balancer";
import { Notifier } from "./app/notifier";
import { router } from "./app/routes";

export default class SSEWorker extends WorkerEntrypoint {
	fetch(request: Request): Response | Promise<Response> {
		return router.handle(request);
	}

	sendEvent(uid: string, data: string) {
		const notifier = getNotifierHandlerForUid(uid);
		return notifier.sendEvent(uid, data);
	}
};

export { Notifier };

