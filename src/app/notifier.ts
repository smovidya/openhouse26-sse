import { DurableObject } from "cloudflare:workers";
import { MultiMap } from "../lib/multi-map";
import { verifySignature } from "./auth";

export class Notifier extends DurableObject<Env> {
	// key is participantId, Should we allow muliple client tho
	#wss = new MultiMap<string, WebSocket>();

	fetch(req: Request): Response {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		server.accept();

		// close if no jwt are sent in 1 sec
		const id = setTimeout(() => {
			console.log("[ws] closing idle ws connection");
			server.close();
		}, 10000);

		const persistConnection = (participantId: string) => {
			console.log("[ws] Persisting", { participantId });
			clearTimeout(id);
			const connections = this.#wss.get(participantId);

			if (connections.length >= 5) {
				console.log("too many connections, closing", { participantId });
				server.close(1008, "Too many connections");
				return
			}

			this.#wss.add(participantId, server);

			server.addEventListener("close", (cls) => {
				this.#wss.remove(participantId, server);
			});
		}

		server.addEventListener("message", ({ data }) => {
			// console.log("received", data)
			try {
				const { signature, participantId } = JSON.parse(String(data));
				if (!signature || typeof signature !== "string" || !participantId || typeof participantId !== "string") {
					console.warn("[ws] Invalid payload", { signature, participantId })
					server.close(1003, "Invalid payload")
					return
				}


				const asyncTask = (async () => {
					const ok = await verifySignature(signature, participantId)
					// console.log({ ok })
					if (ok) {
						persistConnection(participantId);
					} else {
						console.warn("[ws] Invalid signature", { signature, participantId })
						server.close(1003, "Invalid signature")
					}
				})()

				this.ctx.waitUntil(asyncTask)
			} catch (e) {
				console.warn("[ws]", e)
			}
		}, { once: true })

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	sendEvent(to: string, data: string | ArrayBuffer) {
		const sockets = this.#wss.get(to);

		for (const socket of sockets) {
			socket.send(data);
		}
	}
}
