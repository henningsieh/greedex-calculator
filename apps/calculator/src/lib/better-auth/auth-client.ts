import {
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import {
  ac,
  OrganizationAdministratorRole,
  ProjectCoordinatorRole,
  ProjectParticipantRole,
} from "@/features/projects/permissions";
import type { auth } from "@/lib/better-auth";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner: OrganizationAdministratorRole,
        admin: ProjectCoordinatorRole,
        member: ProjectParticipantRole,
      },
    }),
    magicLinkClient(),
    lastLoginMethodClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
