import { env } from "cloudflare:workers";
import { cors, Router } from "../lib/router";
import { dev, flags, production, staging } from "./feature-flag";
import { getNotifierHandlerForUid } from "./load-balancer";

export const router = new Router({
	headers: {
		"X-Powered-By": "Kotchasan"
	}
})
	.use(cors({
		allowedHosts: [
			dev ? "*" : env.MAIN_SITE_URL
 		]
	}))
	.get("/ws/user-event", async ({ request }) => {
		const uid = "TODO: authenticate";

		const upgradeHeader = request.headers.get("Upgrade");
		if (!upgradeHeader || upgradeHeader !== "websocket") {
			return new Response(null, {
				status: 426,
				statusText: "Durable Object expected Upgrade: websocket",
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}

		if (!flags.enableService) {
			return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
		}

		const notifier = getNotifierHandlerForUid(uid);
		return notifier.createConnection(uid);
	});
