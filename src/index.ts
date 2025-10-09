import { WorkerEntrypoint } from "cloudflare:workers";
import { getNotifierHandlerForUid } from "./app/load-balancer";
import { Notifier } from "./app/notifier";
import { router } from "./app/routes";

export default class SSEWorker extends WorkerEntrypoint implements SSEWorkerRpc {
	fetch(request: Request): Response | Promise<Response> {
		return router.handle(request);
	}

	sendEvent(uid: string, data: string) {
		const notifier = getNotifierHandlerForUid(uid);
		return notifier.sendEvent(uid, data);
	}
};

export { Notifier };

// Please copy paste this into other project
interface SSEWorkerRpc {
	sendEvent(uid: string, data: string): Promise<void>;
};
