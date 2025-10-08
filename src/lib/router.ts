import { createStream, type StreamController } from "./stream";

function normalizeTrailingSlash(url: string) {
	while (url.endsWith('/')) {
		url = url.slice(0, -1);
	}
	return url;
}

interface RequestContext {
	request: Request;
	set: Partial<ResponseInit>;
}

interface SSEContext extends RequestContext, StreamController { }

class RequestContextImpl implements RequestContext {
	request: Request;
	set: Partial<ResponseInit> = {};

	constructor(request: Request) {
		this.request = request;
	}
}

type SSEHandler = (context: SSEContext) => AsyncGenerator;
type RequestHandler = SSEHandler;

export class Router {
	routes = new Map<string, RequestHandler>();

	sse(path: string, handler: SSEHandler) {
		const key = normalizeTrailingSlash(path);
		this.routes.set(key, handler);
		return this;
	}

	async handle(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const path = normalizeTrailingSlash(url.pathname);

		const handler = this.routes.get(path);
		if (!handler) {
			return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
		}

		try {
			const context = new RequestContextImpl(request);
			const stream = createStream(handler, context);

			// do something to reponse based on context
			const { headers, ...rest } = context.set;

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					Connection: "keep-alive",
					"Cache-Control": "no-cache",
					...headers
				},
				...rest
			});
		} catch (e) {
			return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
		}
	}
}

