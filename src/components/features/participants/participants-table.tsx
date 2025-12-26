"use client";

import { memberRoles } from "@/components/features/organizations/types";
import { UsersTable } from "@/components/features/organizations/users-table";

interface ParticipantsTableProps {
  organizationId: string;
}

/**
 * Participants table component
 * Displays organization members with "member" role (project participants)
 * Reuses the UsersTable component but without the invite functionality
 */
export function ParticipantsTable({ organizationId }: ParticipantsTableProps) {
  return (
    <UsersTable
      organizationId={organizationId}
      roles={[memberRoles.Participant]}
      showInviteButton={false}
    />
  );
}
