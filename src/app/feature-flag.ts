import { env } from "cloudflare:workers";

export const dev = env.ENVIRONMENT === "development";
export const staging = env.ENVIRONMENT === "staging";
export const production = env.ENVIRONMENT !== "production";
export const notProduction = !production;

export const flags = {
	get enableService() {
		return false || notProduction;
	}
};
