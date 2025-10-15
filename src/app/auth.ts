import { env } from "cloudflare:workers"

export async function verifySignature(signature: string, data: string) {
    const decoded = JSON.parse(atob(env.SSE_PUBLIC_KEY));

    const key = await crypto.subtle.importKey("jwk", decoded, { name: "Ed25519" }, true, ["verify"]);

    const encodedData = new TextEncoder().encode(data);
    const decodedSignature = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const result = await crypto.subtle.verify("ed25519", key, decodedSignature, encodedData);

    return result;
} 