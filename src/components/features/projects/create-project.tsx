"use client";

import type { InferRouterInputs } from "@orpc/server";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { OrganizationType } from "@/components/features/organizations/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/lib/orpc/client";
import type { router } from "@/lib/orpc/router";

// Infer the input type directly from the router
type CreateProjectInput = InferRouterInputs<typeof router>["project"]["create"];

interface CreateProjectFormProps {
  userOrganizations: Omit<OrganizationType, "metadata">[];
}

function CreateProjectForm({ userOrganizations }: CreateProjectFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      location: "",
      country: "",
      welcomeMessage: "",
      organizationId: "",
    },
  });

  async function onSubmit(values: CreateProjectInput) {
    try {
      const result = await orpc.project.create(values);

      if (result.success) {
        toast.success("Project created successfully");
      } else {
        toast.error("Failed to create project");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "An error occurred");
    }
  }

  return (
    <div>
      <Toaster />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Project Name</Label>
          <Input {...register("name")} />
          {errors.name && (
            <p className="mt-1 text-destructive text-sm">
              {errors.name?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              {...register("startDate", { valueAsDate: true })}
            />
            {errors.startDate && (
              <p className="mt-1 text-destructive text-sm">
                {errors.startDate?.message}
              </p>
            )}
          </div>

          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              {...register("endDate", { valueAsDate: true })}
            />
            {errors.endDate && (
              <p className="mt-1 text-destructive text-sm">
                {errors.endDate?.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>Country</Label>
          <Input {...register("country")} />
          {errors.country && (
            <p className="mt-1 text-destructive text-sm">
              {errors.country?.message}
            </p>
          )}
        </div>

        <div>
          <Label>Location (optional)</Label>
          <Input {...register("location")} />
        </div>

        <div>
          <Label>Welcome Message (optional)</Label>
          <Textarea {...register("welcomeMessage")} />
        </div>

        <div>
          <Label>Organization</Label>
          <Controller
            control={control}
            name="organizationId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {userOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.organizationId && (
            <p className="mt-1 text-destructive text-sm">
              {errors.organizationId?.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateProjectForm;
