import { type StreamController } from "./stream";

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

export type MaybePromise<T> = T | Promise<T>;

// type SSEHandler = (context: SSEContext) => MaybePromise<StreamIterator>;
type HandleResult = number | string | object | Uint8Array | Response;
type HttpRequestHandler = (context: RequestContext) => MaybePromise<HandleResult>;
type RequestHandler = HttpRequestHandler;

type HttpMethod = "get" | "post" | "put" | "patch";

interface Route {
	handler: RequestHandler;
	path: string;
	method: string[] | "all";
}

interface RouterConfig {
	headers?: HeadersInit;
	rickrollOnError?: boolean;
}

// No dynamic path becuase im too lazy, use query params
export class Router {
	config: RouterConfig;
	constructor(config: RouterConfig) {
		this.config = config;
	}
	// well we should use other thing
	routes = new Map<string, Route[]>();

	all(path: string, handler: RequestHandler) {
		this.#addRoute("all", path, handler);
	}

	#addRoute(method: HttpMethod[] | "all", path: string, handler: RequestHandler) {
		const key = normalizeTrailingSlash(path);
		const handlers = this.routes.get(key) ?? [];

		handlers.push({
			path,
			method,
			handler,
		});

		this.routes.set(key, handlers);
		return this;
	}

	#matchHandler(request: Request) {
		const url = new URL(request.url);
		const path = normalizeTrailingSlash(url.pathname);
		const handlers = this.routes.get(path);
		const route = handlers?.find(it => it.method === request.method.toLowerCase());

		return route;
	}

	async handle(request: Request): Promise<Response> {

		const handler = this.#matchHandler(request);
		if (!handler) {
			if (this.config.rickrollOnError) {
				return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
			} else {
				return new Response("Not found", {
					status: 404
				});
			}
		}

		try {
			const context = new RequestContextImpl(request);

			// do something to reponse based on context
			const res = await handler.handler(context);
			if (res instanceof Response) {
				for (const [key, value] of Object.entries(this.config.headers ?? {})) {
					if (!res.headers.has(key)) {
						res.headers.append(key, value);
					}
				}
				return res;
			}

			const isObject = (typeof res === "object" && res !== null);
			const data = isObject ? JSON.stringify(res) : String(res);
			const responseInit: ResponseInit = {
				headers: {
					...this.config.headers
				},
			};

			if (isObject) {
				responseInit.headers ??= {};
				// @ts-ignore
				responseInit.headers["Content-Type"] = "application/json";
			}

			const { headers: responseInitHeaders, ...responseInitRest } = responseInit;
			const { headers: setHeaders, ...setRest } = context.set;

			return new Response(data, {
				headers: {
					...responseInitHeaders,
					...setHeaders
				},
				...responseInitRest,
				...setRest
			});
		} catch (e) {
			console.error(e);
			if (this.config.rickrollOnError) {
				return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
			} else {
				return new Response("Internal server error", {
					status: 500
				});
			}
		}
	}
}

