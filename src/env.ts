import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z
      .string()
      .refine((value) => value.endsWith("apps.googleusercontent.com"), {
        message: "Must end with apps.googleusercontent.com",
      })
      .refine(
        (value) => {
          const firstTwelve = value.slice(0, 12);
          return (
            firstTwelve.length === 12 &&
            [...firstTwelve].every((char) => char >= "0" && char <= "9")
          );
        },
        {
          message: "Must start with twelve digits",
        }
      ),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .refine((value) => value.startsWith("GOCSPX"), {
        message: "Must start with GOCSPX",
      })
      .min(7),
  },
  client: {
    // Add any client-side environment variables here if needed
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
});
