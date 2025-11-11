/**
 * oRPC module exports
 * Central export point for oRPC functionality
 */

// Context and middleware for creating custom procedures (server-side only)
export { base } from "./context";
export { authMiddleware, authorized } from "./middleware";
// Client for use in components and pages (works on both client and server)
export { orpc } from "./orpc";
// TanStack Query integration - import directly from tanstack-query.ts in client components
// export { orpcQuery } from "./tanstack-query";

// Types for type-safe usage
export type { Router } from "./router";

// Re-export router for server-side use
export { router } from "./router";
