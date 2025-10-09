import { Router } from "../lib/router";
import { createStream, mapToUint8Array, streamEvent, streamHeaders } from "../lib/stream";
import { flags } from "./feature-flag";
import { getNotifierHandlerForUid } from "./load-balancer";

export const router = new Router()
	.get("/sse", ({ }) => {
		const { stream, send, close } = createStream<string>();

		const interval = setInterval(() => {
			send(streamEvent({
				event: "sdf",
				data: "afkjhusgfyd"
			}));
		}, 400);

		setTimeout(() => {
			clearInterval(interval);
			close();
		}, 4000);


		return new Response(mapToUint8Array(stream), {
			headers: {
				...streamHeaders()
			}
		});
	})
	.get("/ws/user-event", async ({ request }) => {
		const uid = "TODO: authenticate";

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

		if (!flags.enableService) {
			return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
		}

		const notifier = getNotifierHandlerForUid(uid);
		return notifier.createConnection(uid);
	});
