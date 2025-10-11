import { DurableObject } from "cloudflare:workers";
import { MultiMap } from "../lib/multi-map";

export class Notifier extends DurableObject<Env> {
	// key is uid, Should we allow muliple client tho
	#wss = new MultiMap<string, WebSocket>();

	// idk if i need to name this `fetch` or not
	createConnection(): Response {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		server.accept();

		// close if no jwt are sent in 1 sec
		const id = setTimeout(() => {
			server.close();
		}, 1000);

		const persistConnection = (uid: string) => {
			clearTimeout(id);
			const connections = this.#wss.get(uid);
			if (connections.length >= 5) {
				return new Response("too many connections", {
					status: 429
				});
			}

			this.#wss.add(uid, client);

			server.addEventListener("close", (cls) => {
				this.#wss.remove(uid, client);
			});
		}

		server.addEventListener("message", ({ data }) => {
			// const uid = "TODO: verify jwt on first message, ignore subsequent";
			const uid = "isei";
			persistConnection(uid);
		}, { once: true })

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	sendEvent(to: string, data: string | ArrayBuffer) {
		const clients = this.#wss.get(to);
		for (const client of clients) {
			client.send(data);
		}
	}
}
