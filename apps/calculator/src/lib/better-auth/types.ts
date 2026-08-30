import type { auth } from "@/lib/better-auth";

/**
 * Full session response from Better Auth
 * Includes both session and user objects
 */
export type SessionResponse = typeof auth.$Infer.Session;
