import { headers as nextHeaders } from "next/headers";
import { getLocale } from "next-intl/server";
import { TeamTable } from "@/app/[locale]/(app)/org/dashboard/_components/team-table";
import { auth } from "@/lib/better-auth";
import { redirect } from "@/lib/i18n/navigation";

export default async () => {
  const headers = await nextHeaders();
  const locale = await getLocale();

  const sessionResult = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: headers,
  });
  if (!sessionResult) return redirect({ href: "/login", locale });

  const activeOrganizationId = sessionResult.session.activeOrganizationId;

  if (!activeOrganizationId) {
    console.error("No active organization ID found in session");
    await auth.api.signOut({
      headers: headers,
    });
    return redirect({ href: "/login", locale });
  }

  const [ownersResult, adminsResult] = await Promise.all([
    auth.api.listMembers({
      query: {
        organizationId: activeOrganizationId,
        filterField: "role",
        filterOperator: "eq",
        filterValue: "owner",
      },
      headers: headers,
    }),
    auth.api.listMembers({
      query: {
        organizationId: activeOrganizationId,
        filterField: "role",
        filterOperator: "eq",
        filterValue: "admin",
      },
      headers: headers,
    }),
  ]);

  const membersResult = {
    members: [
      ...(ownersResult?.members || []),
      ...(adminsResult?.members || []),
    ],
  };

  return (
    <>
      <h1 className="font-bold text-4xl">Team Members</h1>
      <p className="py-2 text-muted-foreground">
        List of team members goes here.
      </p>
      <TeamTable members={membersResult.members} />
    </>
  );
};
