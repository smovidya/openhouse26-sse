import { Notifier } from "./app/notifier";
import { router } from "./app/routes";

export default {
	async fetch(request, env, context) {
		return await router.handle(request);
	}
} satisfies ExportedHandler<Env>;

export { Notifier };

