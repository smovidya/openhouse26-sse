import { sleep } from "./lib/time";
// import { router } from "./routes";

// export default router;
export default {
	fetch(request, env, context) {
		let i = 0;
		const r = new ReadableStream({
			start(controller) {

			},
			async pull(controller) {
				const message = `sdfjkdu ${i}`;
				const m = new TextEncoder().encode(message);
				controller.enqueue(m);
				await sleep(1000);
				i += 1;
				if (i > 10) {
					controller.close();
				}
			},
		});

		return new Response(r, {
			headers: {
				"Content-Type": "text/event-stream",
				Connection: "keep-alive",
				"Cache-Control": "no-cache"
			}
		});
	}
} satisfies ExportedHandler<Env>;
