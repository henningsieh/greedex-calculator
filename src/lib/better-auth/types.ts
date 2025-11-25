import z from "zod";
import type { auth } from "@/lib/better-auth";

/**
 * Full session response from Better Auth
 * Includes both session and user objects
 */
export type SessionResponse = typeof auth.$Infer.Session;

/**
 * Just the session object portion
 */
export type Session = SessionResponse["session"];

/**
 * Just the user object portion
 */
export type User = SessionResponse["user"];

/**
 * Minimal validation schema for Better Auth session
 * Actual validation is handled by Better Auth itself
 */
export const SessionSchema = z
  .custom<SessionResponse>((val) => {
    return val === null || (typeof val === "object" && val !== null);
  })
  .nullable();
