import { WorkerEntrypoint } from "cloudflare:workers";
import { getNotifierHandlerForUid } from "./app/load-balancer";
import { Notifier } from "./app/notifier";
import { router } from "./app/routes";

export default class SSEWorker extends WorkerEntrypoint implements SSEWorkerRpc {
	async fetch(request: Request): Promise<Response> {
		return router.handle(request);
	}

	sendEvent(uid: string, data: string) {
		const notifier = getNotifierHandlerForUid(uid);
		return notifier.sendEvent(uid, data);
	}


	double(n: number) {
		return n * 2;
	}

};

export { Notifier };

// Please copy paste this into other project
interface SSEWorkerRpc {
	sendEvent(uid: string, data: string): Promise<void>;
	fetch(request: Request): Promise<Response>;
	double(n: number): number;
};
