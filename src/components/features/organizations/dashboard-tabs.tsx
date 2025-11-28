"use client";

import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import { DashboardStats } from "@/components/features/organizations/dashboard-stats";
import { TeamTable } from "@/components/features/organizations/team-table";
import { memberRoles } from "@/components/features/organizations/types";
import { ProjectsTab } from "@/components/features/projects/projects-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardTabsProps {
  organizationId: string;
}

export function DashboardTabs({ organizationId }: DashboardTabsProps) {
  const t = useTranslations("organization.dashboard");
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "dashboard",
    parse: (value) =>
      ["dashboard", "participants", "projects"].includes(value)
        ? value
        : "dashboard",
  });

  return (
    <Tabs
      value={activeTab || "dashboard"}
      onValueChange={setActiveTab}
      className="w-full space-y-6"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">{t("tabs.dashboard")}</TabsTrigger>
        <TabsTrigger value="projects">{t("tabs.projects")}</TabsTrigger>
        <TabsTrigger value="participants">{t("tabs.participants")}</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="projects">
        <Suspense fallback={<div>{t("tabs.loading-projects")}</div>}>
          <ProjectsTab />
        </Suspense>
      </TabsContent>

      <TabsContent value="participants">
        <TeamTable
          organizationId={organizationId}
          roles={[memberRoles.Participant]}
        />
      </TabsContent>
    </Tabs>
  );
}
