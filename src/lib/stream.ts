import type { MaybePromise } from "./router";

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

export type StreamIterator = AsyncIterator<InternalStreamCommand, any, any>;

export class StopError extends Error {
	readonly reason?: unknown;
	constructor(reason?: unknown) {
		super(reason instanceof Error ? reason.message : String(reason ?? 'StopError'));
		this.reason = reason;
		this.name = 'StopError';
		Object.setPrototypeOf(this, StopError.prototype);
	}
}


export function createStream<T extends object>(body: (controller: StreamController & T) => MaybePromise<StreamIterator>, extras: T) {
	let generator: MaybePromise<StreamIterator>;
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
			generator = await generator;

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
			// generator.throw(new StopError(reason));
		},
	});
}


export function createSendableStream<T>() {
	const buffer: T[] = [];
	let closed = false;
	let resolve: (() => void) | undefined = undefined;
	let reject: ((err: any) => void) | undefined = undefined;

	return {
		send(value: T) {
			if (closed) {
				return;
			}
			buffer.push(value);
			if (resolve) {
				resolve();
				resolve = undefined;
				reject = undefined;
			}
		},
		close() {
			closed = true;
			if (reject) {
				reject(new StopError("closed"));
				resolve = undefined;
				reject = undefined;
			}
		},
		stream: {
			async next() {
				if (buffer.length === 0) {
					const p = Promise.withResolvers<void>();
					resolve = p.resolve;
					reject = p.reject;

					await p.promise;
				}
				return {
					done: closed,
					value: buffer.pop()!
				};
			},
		} satisfies AsyncIterator<T>
	};
}
