"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  Hotel,
  Leaf,
  Tent,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AccommodationData {
  type: string;
  nights: number;
  energyType: string;
}

interface AccommodationStepProps {
  initialAccommodation: AccommodationData | null;
  onComplete: (accommodation: AccommodationData) => void;
  onBack: () => void;
}

const ACCOMMODATION_TYPES = [
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "hostel", label: "Hostel", icon: Building2 },
  { value: "airbnb", label: "Airbnb/Apartment", icon: Home },
  { value: "camping", label: "Camping", icon: Tent },
];

const ENERGY_TYPES = [
  { value: "conventional", label: "Conventional Energy", icon: Zap },
  { value: "green", label: "Green Energy", icon: Leaf },
];

export function AccommodationStep({
  initialAccommodation,
  onComplete,
  onBack,
}: AccommodationStepProps) {
  const [accommodationType, setAccommodationType] = useState(
    initialAccommodation?.type || "hotel",
  );
  const [nights, setNights] = useState(
    initialAccommodation?.nights?.toString() || "",
  );
  const [energyType, setEnergyType] = useState(
    initialAccommodation?.energyType || "conventional",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nightsNum = Number.parseInt(nights, 10);
    if (nightsNum > 0) {
      onComplete({
        type: accommodationType,
        nights: nightsNum,
        energyType,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="mb-2 font-bold text-2xl text-foreground">
            Accommodation Details
          </h2>
          <p className="text-muted-foreground">
            Tell us about your accommodation during the project to calculate the
            full environmental impact.
          </p>
        </div>

        {/* Accommodation Type Selection */}
        <div className="space-y-3">
          <Label>Type of Accommodation</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ACCOMMODATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAccommodationType(type.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    accommodationType === type.value
                      ? "border-teal-500 bg-teal-500/10"
                      : "border-border hover:border-border/50 hover:bg-accent"
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 ${
                      accommodationType === type.value
                        ? "text-teal-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-center text-sm ${
                      accommodationType === type.value
                        ? "font-semibold text-teal-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Number of Nights */}
        <div className="space-y-2">
          <Label htmlFor="nights">Number of Nights</Label>
          <Input
            id="nights"
            type="number"
            min="1"
            placeholder="e.g., 7"
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            required
          />
        </div>

        {/* Energy Type */}
        <div className="space-y-3">
          <Label>Energy Source</Label>
          <RadioGroup value={energyType} onValueChange={setEnergyType}>
            <div className="space-y-2">
              {ENERGY_TYPES.map((energy) => {
                const Icon = energy.icon;
                return (
                  <div
                    key={energy.value}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      energyType === energy.value
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <RadioGroupItem
                      value={energy.value}
                      id={energy.value}
                      className="border-2"
                    />
                    <Label
                      htmlFor={energy.value}
                      className="flex flex-1 cursor-pointer items-center gap-3"
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          energyType === energy.value
                            ? "text-teal-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          energyType === energy.value
                            ? "font-semibold text-teal-400"
                            : "text-muted-foreground"
                        }
                      >
                        {energy.label}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
          <p className="text-muted-foreground text-xs">
            If you're unsure about the energy source, select Conventional Energy
            or ask the project coordinator.
          </p>
        </div>
      </div>

      {/* Summary */}
      {nights && Number.parseInt(nights, 10) > 0 && (
        <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 p-4">
          <h3 className="mb-2 font-semibold text-foreground">Summary</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground capitalize">
                {accommodationType}
              </span>{" "}
              • {nights}{" "}
              {Number.parseInt(nights, 10) === 1 ? "night" : "nights"}
            </p>
            <p className="text-muted-foreground">
              Energy:{" "}
              <span className="font-medium text-foreground capitalize">
                {energyType}
              </span>
            </p>
          </div>
        </div>
      )}

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
          type="submit"
          disabled={!nights || Number.parseInt(nights, 10) <= 0}
          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
