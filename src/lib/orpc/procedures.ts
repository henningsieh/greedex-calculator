import { randomUUID } from "node:crypto";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import { project } from "@/lib/drizzle/schema";
import { base } from "./context";
import { authorized } from "./middleware";

// Generate insert schema from Drizzle table
const insertProjectSchema = createInsertSchema(project, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Public hello world procedure
 * Simple demonstration of a basic oRPC procedure
 */
export const helloWorld = base
  .input(
    z.object({
      name: z.string().optional().default("World"),
    }),
  )
  .handler(async ({ input }) => {
    return {
      message: `Hello, ${input.name}!`,
      timestamp: new Date().toISOString(),
    };
  });

/**
 * Public health check procedure
 * Returns server status and uptime
 */
export const getHealth = base.handler(async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };
});

/**
 * Protected procedure example
 * Requires authentication and returns user info
 */
export const getProfile = authorized.handler(async ({ context }) => {
  return {
    user: {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email,
    },
    session: {
      id: context.session.id,
      expiresAt: context.session.expiresAt,
    },
  };
});

/**
 * Create a new project
 * Requires authentication and uses Drizzle-generated schema
 */
export const createProject = authorized
  .input(insertProjectSchema)
  .handler(async ({ input, context }) => {
    const newProject = await db
      .insert(project)
      .values({
        id: randomUUID(),
        ...input,
        location: input.location ?? null,
        welcomeMessage: input.welcomeMessage ?? null,
        responsibleUserId: context.user.id,
      })
      .returning();

    return {
      success: true,
      project: newProject[0],
    };
  });
