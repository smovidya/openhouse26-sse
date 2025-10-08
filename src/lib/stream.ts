import { sleep } from "./time";

type InternalStreamCommand = {
	type: "stop";
} | {
	type: "enqueue",
	data: any;
};

export interface StreamController {
	close(): InternalStreamCommand;
	enqueue(data: any): InternalStreamCommand;
}

export type StreamGenerator = AsyncGenerator<InternalStreamCommand, any, any>;

export class StopError extends Error {
	readonly reason?: unknown;
	constructor(reason?: unknown) {
		super(reason instanceof Error ? reason.message : String(reason ?? 'StopError'));
		this.reason = reason;
		this.name = 'StopError';
		Object.setPrototypeOf(this, StopError.prototype);
	}
}


export function createStream<T extends object>(body: (controller: StreamController & T) => StreamGenerator, extras: T) {
	let generator: StreamGenerator;
	return new ReadableStream({
		start() {
			const our: StreamController = {
				close() {
					return {
						type: "stop"
					};
				},
				enqueue(data) {
					return {
						type: "enqueue",
						data,
					};
				},
			};
			generator = body({ ...our, ...extras });
		},
		async pull(controller) {
			try {
				const { value, done } = await generator.next();

				if (done || value.type === "stop") {
					controller.close();
					return;
				}

				const message = typeof value.data === "string" ? value.data : JSON.stringify(value.data);
				const encoded = new TextEncoder().encode(message);
				controller.enqueue(encoded);
			} catch (e) {
				console.error(e);
			}
		},
		cancel(reason) {
			console.log("cancel");
			generator.throw(new StopError(reason));
		},
	});
}
