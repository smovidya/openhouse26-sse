import { WorkerEntrypoint } from "cloudflare:workers";
import { flags } from "./app/feature-flag";
import { Notifier } from "./app/notifier";

export default class SSEWorker extends WorkerEntrypoint implements SSEWorkerRpc {
	async fetch(request: Request): Promise<Response> {
		console.log("fetch", request.url);

		if (!flags.enableService) {
			return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
		}

		const upgradeHeader = request.headers.get("Upgrade");
		if (!upgradeHeader || upgradeHeader !== "websocket") {
			return new Response(null, {
				status: 426,
				statusText: "Durable Object expected Upgrade: websocket",
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}

		const notifier = this.env.NOTIFIER.getByName("default");
		return await notifier.fetch(request);
	}

	async sendEvent(participantId: string, data: string) {
		const notifier = this.env.NOTIFIER.getByName("default");
		await notifier.sendEvent(participantId, data);
		return participantId
	}

	double(n: number) {
		return n * 2;
	}

};



export { Notifier };

// Please copy paste this into other project
interface SSEWorkerRpc {
	sendEvent(participantId: string, data: string): Promise<string>;
	fetch(request: Request): Promise<Response>;
	double(n: number): number;
};
