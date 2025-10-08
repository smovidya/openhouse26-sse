import { Elysia, sse as elysiaSse } from "elysia";


interface StreamController {
	close(): void;
	enqueue(data: any): void;
}

// export function createStream(body: (controller: StreamController) => unknown) {

// }


export function sse(body: any) {
	const converted = new ReadableStream({
		pull(controller) {
			const bytes = new TextEncoder().encode(JSON.stringify(body));
			controller.enqueue(bytes);
			controller.close();
		},
	});

	return elysiaSse(converted);
}
