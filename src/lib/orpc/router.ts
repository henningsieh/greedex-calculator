import {
  createProject,
  listProjects,
} from "@/components/features/projects/procedures";
import { getHealth, getProfile, helloWorld } from "./procedures";

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
    list: listProjects,
  },
};

export type Router = typeof router;
