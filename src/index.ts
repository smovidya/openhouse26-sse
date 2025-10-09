import { router } from "./app/routes";

export default {
	async fetch(request, env, context) {
		return await router.handle(request);
	}
} satisfies ExportedHandler<Env>;
