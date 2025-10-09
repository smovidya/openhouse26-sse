import { Router } from "../lib/router";
import { createStream, mapToUint8Array, streamEvent, streamHeaders } from "../lib/stream";

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
	});
