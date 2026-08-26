"use client";

import { useTranslations } from "@greendex/i18n/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProjectSharedTravelLeg } from "@/features/project-shared-travel-legs/types";

import { ProjectSharedTravelLegForm } from "./project-shared-travel-leg-form";

interface ProjectSharedTravelLegDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sharedTravelLeg?: ProjectSharedTravelLeg;
  onSuccess?: () => void;
}

export function ProjectSharedTravelLegDialog({
  open,
  onOpenChange,
  projectId,
  sharedTravelLeg,
  onSuccess,
}: ProjectSharedTravelLegDialogProps) {
  const t = useTranslations("project.shared-travel");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(sharedTravelLeg ? "form.edit-title" : "form.title")}
          </DialogTitle>
        </DialogHeader>
        <ProjectSharedTravelLegForm
          onCancel={() => onOpenChange(false)}
          onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
          }}
          projectId={projectId}
          sharedTravelLeg={sharedTravelLeg}
        />
      </DialogContent>
    </Dialog>
  );
}
