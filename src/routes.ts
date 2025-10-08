import { Elysia, sse } from "elysia";
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import { sleep } from "./lib/time";

export const router = new Elysia({
	adapter: CloudflareAdapter
})
	.get("/sse", async function* () {
		yield sse('ทหกดืราห่้ก');
		await sleep(2000);
		yield sse('2');
	})
	.compile();
