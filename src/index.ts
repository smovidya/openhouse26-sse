import { createStream } from "./lib/stream";
import { sleep } from "./lib/time";
import { router } from "./routes";


export default {
	async fetch(request, env, context) {
		return await router.handle(request);
		// const stream = createStream(async function* ({  }) {
		// 	while (true) {
		// 		yield 12;
		// 		await sleep(420);
		// 	}
		// }, {});

		// return new Response(stream, {
		// 	headers: {
		// 		"Content-Type": "text/event-stream",
		// 		Connection: "keep-alive",
		// 		"Cache-Control": "no-cache",
		// 	},
		// });

	}
} satisfies ExportedHandler<Env>;
