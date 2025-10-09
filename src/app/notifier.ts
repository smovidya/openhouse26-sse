import { DurableObject } from "cloudflare:workers";
import { MultiMap } from "../lib/multi-map";

export class Notifier extends DurableObject<Env> {
	// key is uid, Should we allow muliple client tho
	#wss = new MultiMap<string, WebSocket>();

	// idk if i need to name this `fetch` or not
	createConnection(uid: string): Response {
		const connections = this.#wss.get(uid);
		if (connections.length >= 5) {
			return new Response("too many connections", {
				status: 429
			});
		}

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		server.accept();
		this.#wss.add(uid, client);

		server.addEventListener("close", (cls) => {
			this.#wss.remove(uid, client);
			server.close(cls.code, "Durable Object is closing WebSocket");
		});

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
