"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Globe,
  Leaf,
  TreePine,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ParticipantFormData } from "../participate-form";
import { TransportIcon } from "../transport-icon";
import { CO2_FACTORS } from "../types";

interface Project {
  id: string;
  name: string;
  location: string;
  country: string;
  startDate: Date;
  endDate: Date;
  welcomeMessage?: string | null;
}

interface ReviewStepProps {
  formData: ParticipantFormData;
  project: Project;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewStep({
  formData,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: project data may be used in future
  project,
  onSubmit,
  onBack,
}: ReviewStepProps) {
  // Calculate total CO2
  const totalCO2 = formData.transports.reduce((sum, transport) => {
    const co2Factor = CO2_FACTORS[transport.type];
    return sum + transport.distanceKm * co2Factor;
  }, 0);

  // Calculate trees needed (average tree absorbs ~22kg CO₂ per year)
  const treesNeeded = Math.ceil(totalCO2 / 22);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="mb-2 font-bold text-2xl text-foreground">
            Review Your Information
          </h2>
          <p className="text-muted-foreground">
            Please review your details before submitting. This information will
            help calculate your carbon footprint.
          </p>
        </div>
      </div>

      {/* Participant Info */}
      <Card className="border-primary/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 p-6">
        <h3 className="mb-4 font-semibold text-foreground text-lg">
          Participant Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-teal-400" />
            <div>
              <p className="text-muted-foreground text-sm">Name</p>
              <p className="font-medium text-foreground">
                {formData.participantName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-teal-400" />
            <div>
              <p className="text-muted-foreground text-sm">Country</p>
              <p className="font-medium text-foreground">
                {formData.participantCountry}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Transport Details */}
      <Card className="border-primary/20 p-6">
        <h3 className="mb-4 font-semibold text-foreground text-lg">
          Transportation
        </h3>
        <div className="space-y-2">
          {formData.transports.map((transport, index) => {
            const co2 = transport.distanceKm * CO2_FACTORS[transport.type];
            return (
              <div
                key={`${transport.type}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3"
              >
                <div className="flex items-center gap-3">
                  <TransportIcon type={transport.type} className="h-6 w-6" />
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {transport.type}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {transport.distanceKm.toFixed(1)} km
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {co2.toFixed(1)} kg
                  </p>
                  <p className="text-muted-foreground text-xs">CO₂</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Accommodation Details */}
      {formData.accommodation && (
        <Card className="border-primary/20 p-6">
          <h3 className="mb-4 font-semibold text-foreground text-lg">
            Accommodation
          </h3>
          <div className="space-y-2 text-foreground">
            <p>
              <span className="text-muted-foreground">Type:</span>{" "}
              <span className="font-medium capitalize">
                {formData.accommodation.type}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Nights:</span>{" "}
              <span className="font-medium">
                {formData.accommodation.nights}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Energy:</span>{" "}
              <span className="font-medium capitalize">
                {formData.accommodation.energyType}
              </span>
            </p>
          </div>
        </Card>
      )}

      {/* CO2 Summary */}
      <div className="rounded-lg border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-6">
        <div className="space-y-4">
          <div className="text-center">
            <p className="mb-2 text-muted-foreground text-sm">
              Your Estimated Carbon Footprint
            </p>
            <div className="flex items-center justify-center gap-2">
              <Leaf className="h-8 w-8 text-emerald-400" />
              <span className="font-bold text-4xl text-teal-400">
                {totalCO2.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-xl">kg CO₂</span>
            </div>
          </div>

          <div className="border-teal-500/30 border-t pt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <TreePine className="h-6 w-6 text-green-400" />
              <p className="text-foreground">
                <span className="font-bold text-2xl text-green-400">
                  {treesNeeded}
                </span>{" "}
                <span className="text-muted-foreground">
                  {treesNeeded === 1 ? "tree" : "trees"} needed to offset
                </span>
              </p>
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              Based on average tree absorption of ~22kg CO₂ per year
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-primary/20 bg-card/50 p-4">
        <p className="text-muted-foreground text-sm">
          <strong className="text-foreground">Note:</strong> This calculation is
          for your travel activities only. After submission, you can view the
          collective impact of all participants and explore ways to offset your
          carbon footprint together.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Submit
        </Button>
      </div>
    </div>
  );
}
