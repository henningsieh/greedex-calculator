import type { z } from "zod";

import type { ProjectParticipantWithUserSchema } from "./validation-schemas";

// ============================================================================
// PARTICIPANT TYPES
// ============================================================================

/**
 * Participant with user details
 */
export type ProjectParticipantWithUser = z.infer<
  typeof ProjectParticipantWithUserSchema
>;
