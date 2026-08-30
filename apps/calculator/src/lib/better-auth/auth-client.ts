import {
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ac, admin, member, owner } from "@/features/projects/permissions";
import type { auth } from "@/lib/better-auth";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
    magicLinkClient(),
    lastLoginMethodClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
