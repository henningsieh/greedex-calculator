import { createSelectSchema } from "drizzle-zod";
import {
  projectParticipantsTable,
  user as userTable,
} from "@/lib/drizzle/schema";

// Schema for participant with user details (as returned by the API)
export const ProjectParticipantWithUserSchema = createSelectSchema(
  projectParticipantsTable,
).extend({
  user: createSelectSchema(userTable).omit({
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
  }),
});

// Schema for UI participant display - flattens user fields for easier access
export const ParticipantSchema = createSelectSchema(
  projectParticipantsTable,
).extend({
  name: createSelectSchema(userTable).shape.name,
  // Note: country is already in projectParticipantsTable, no need to extend
});

// Computed fields type for participant statistics
// These are calculated on-the-fly and not stored in the database
export type ParticipantComputedFields = {
  totalCO2: number;
  rank?: number;
};
