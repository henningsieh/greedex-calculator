import { headers as nextHeaders } from "next/headers";
import { getTranslations } from "next-intl/server";
import { CreateProjectForm } from "@/components/features/projects/create-project-form";
import { auth } from "@/lib/better-auth";

export default async function CreateProjectPage() {
  const t = await getTranslations("organization.projects.form.new");

  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });
  const organizations = await auth.api.listOrganizations({
    headers,
  });

  const activeOrganizationId =
    session?.session?.activeOrganizationId || organizations[0]?.id || "";

  return (
    <div className="p-0">
      <h1 className="font-semibold text-3xl">{t("title")}</h1>
      <CreateProjectForm activeOrganizationId={activeOrganizationId} />
    </div>
  );
}
