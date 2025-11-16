"use client";

import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransportIcon } from "../transport-icon";
import type { ActivityType } from "../types";

interface TransportData {
  type: ActivityType;
  distanceKm: number;
}

interface TransportStepProps {
  initialTransports: TransportData[];
  onComplete: (transports: TransportData[]) => void;
  onBack: () => void;
}

const TRANSPORT_TYPES: { value: ActivityType; label: string }[] = [
  { value: "car", label: "Car" },
  { value: "bus", label: "Bus" },
  { value: "train", label: "Train" },
  { value: "boat", label: "Boat/Ferry" },
];

export function TransportStep({
  initialTransports,
  onComplete,
  onBack,
}: TransportStepProps) {
  const [transports, setTransports] = useState<TransportData[]>(
    initialTransports.length > 0 ? initialTransports : [],
  );
  const [selectedType, setSelectedType] = useState<ActivityType>("car");
  const [distance, setDistance] = useState("");

  const handleAddTransport = () => {
    const distanceKm = Number.parseFloat(distance);
    if (distanceKm > 0) {
      setTransports([...transports, { type: selectedType, distanceKm }]);
      setDistance("");
    }
  };

  const handleRemoveTransport = (index: number) => {
    setTransports(transports.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transports.length > 0) {
      onComplete(transports);
    }
  };

  const totalDistance = transports.reduce((sum, t) => sum + t.distanceKm, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="mb-2 font-bold text-2xl text-foreground">
            Transportation Details
          </h2>
          <p className="text-muted-foreground">
            Add all modes of transport you used to reach the project location.
            Include both arrival and departure journeys.
          </p>
        </div>

        {/* Transport Type Selection */}
        <div className="space-y-2">
          <Label>Select Transport Mode</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRANSPORT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  selectedType === type.value
                    ? "border-teal-500 bg-teal-500/10"
                    : "border-border hover:border-border/50 hover:bg-accent"
                }`}
              >
                <TransportIcon type={type.value} className="h-8 w-8" />
                <span
                  className={`text-sm ${
                    selectedType === type.value
                      ? "font-semibold text-teal-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Distance Input */}
        <div className="space-y-2">
          <Label htmlFor="distance">Distance (kilometers)</Label>
          <div className="flex gap-2">
            <Input
              id="distance"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 250"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddTransport}
              disabled={!distance || Number.parseFloat(distance) <= 0}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Tip: Use Google Maps or the Erasmus+ Distance Calculator to find
            accurate distances.
          </p>
        </div>
      </div>

      {/* Added Transports List */}
      {transports.length > 0 && (
        <div className="space-y-3 rounded-lg border border-primary/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 p-4">
          <h3 className="font-semibold text-foreground">Your Journeys</h3>
          <div className="space-y-2">
            {transports.map((transport, index) => (
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTransport(index)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-border/50 border-t pt-3">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">
                Total Distance
              </span>
              <span className="font-bold text-teal-400">
                {totalDistance.toFixed(1)} km
              </span>
            </div>
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
          disabled={transports.length === 0}
          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
