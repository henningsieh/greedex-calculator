import {
  DISTANCE_KM_STEP,
  MAX_DISTANCE_KM,
  MIN_DISTANCE_KM,
} from "@greendex/config/project-shared-travel";
import type { useTranslations } from "@greendex/i18n/client";
import { z } from "zod";

type TranslateFn = ReturnType<typeof useTranslations>;

/**
 * Check whether a distance uses the configured increment without losing to
 * floating-point precision.
 */
export function isMultipleOfDistanceStep(
  distanceKm: number,
  step = DISTANCE_KM_STEP,
): boolean {
  const multiplier = 1 / step;
  const scaledDistance = distanceKm * multiplier;
  const roundedDistance = Math.round(scaledDistance);
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(scaledDistance));

  return Math.abs(scaledDistance - roundedDistance) <= tolerance;
}

export function validateDistanceStep(distanceKm: number): boolean {
  return isMultipleOfDistanceStep(distanceKm);
}

/**
 * Create a localized distance schema for Project Shared Travel Leg forms.
 */
export function createProjectSharedTravelLegDistanceSchema(
  t: TranslateFn,
  isOptional = false,
) {
  const schema = z
    .number()
    .min(MIN_DISTANCE_KM, {
      message: t("project.shared-travel.form.validation.distanceKm.min", {
        min: MIN_DISTANCE_KM,
      }),
    })
    .max(MAX_DISTANCE_KM, {
      message: t("project.shared-travel.form.validation.distanceKm.max", {
        max: MAX_DISTANCE_KM,
      }),
    })
    .refine(validateDistanceStep, {
      message: t("project.shared-travel.form.validation.distanceKm.step", {
        step: DISTANCE_KM_STEP,
      }),
    });

  return isOptional ? schema.optional() : schema;
}
