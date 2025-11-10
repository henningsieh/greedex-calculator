import { createProject, getHealth, getProfile, helloWorld } from "./procedures";

/**
 * Main oRPC router
 * Defines all available procedures organized by namespace
 */
export const router = {
  // Public procedures
  helloWorld,
  health: getHealth,

  // User namespace for authenticated procedures
  user: {
    getProfile,
  },

  // Project namespace
  project: {
    create: createProject,
  },
};

export type Router = typeof router;
