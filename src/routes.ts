import { Router } from "./lib/router";
import { sleep } from "./lib/time";

export const router = new Router()
	.sse("/sse", async function* ({ enqueue }) {
		let index = 0;
		console.log("isndfo");
		while (true) {
			yield enqueue(`${index} `);
			await sleep(500);
			index += 1;
		}
	});
