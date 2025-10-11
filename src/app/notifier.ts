import { DurableObject } from "cloudflare:workers";
import { MultiMap } from "../lib/multi-map";

export class Notifier extends DurableObject<Env> {
	// key is uid, Should we allow muliple client tho
	#wss = new MultiMap<string, WebSocket>();

	fetch(req: Request): Response {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		server.accept();

		// close if no jwt are sent in 1 sec
		const id = setTimeout(() => {
			console.log("closing idle ws connection");
			server.close();
		}, 1000);

		const persistConnection = (uid: string) => {
			console.log("persist", { uid });
			clearTimeout(id);
			const connections = this.#wss.get(uid);

			if (connections.length >= 5) {
				console.log("too many connections, closing", { uid });
				server.close(1008, "Too many connections");
				return
			}

			this.#wss.add(uid, server);

			server.addEventListener("close", (cls) => {
				this.#wss.remove(uid, server);
			});
		}

		server.addEventListener("message", ({ data }) => {
			// const uid = "TODO: verify jwt on first message, ignore subsequent";
			const uid = String(data);
			persistConnection(uid);
		}, { once: true })

		// return client
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
