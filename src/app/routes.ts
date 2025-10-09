import { Router } from "../lib/router";

export const router = new Router()
	.get("/sse", ({ }) => {
		return "1";
	});
