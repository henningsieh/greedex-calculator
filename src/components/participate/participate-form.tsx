"use client";

import { CheckCircle2, Leaf } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AccommodationStep } from "./steps/accommodation-step";
import { ReviewStep } from "./steps/review-step";
import { TransportStep } from "./steps/transport-step";
import { WelcomeStep } from "./steps/welcome-step";
import type { ActivityType } from "./types";

interface Project {
  id: string;
  name: string;
  location: string;
  country: string;
  startDate: Date;
  endDate: Date;
  welcomeMessage?: string | null;
}

interface ParticipateFormProps {
  project: Project;
}

export interface TransportData {
  type: ActivityType;
  distanceKm: number;
}

export interface AccommodationData {
  type: string;
  nights: number;
  energyType: string;
}

export interface ParticipantFormData {
  participantName: string;
  participantCountry: string;
  transports: TransportData[];
  accommodation: AccommodationData | null;
}

type FormStep = "welcome" | "transport" | "accommodation" | "review";

const STEPS: FormStep[] = ["welcome", "transport", "accommodation", "review"];

export function ParticipateForm({ project }: ParticipateFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("welcome");
  const [formData, setFormData] = useState<ParticipantFormData>({
    participantName: "",
    participantCountry: "",
    transports: [],
    accommodation: null,
  });

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleWelcomeComplete = (name: string, country: string) => {
    setFormData((prev) => ({
      ...prev,
      participantName: name,
      participantCountry: country,
    }));
    handleNext();
  };

  const handleTransportComplete = (transports: TransportData[]) => {
    setFormData((prev) => ({ ...prev, transports }));
    handleNext();
  };

  const handleAccommodationComplete = (accommodation: AccommodationData) => {
    setFormData((prev) => ({ ...prev, accommodation }));
    handleNext();
  };

  const handleSubmit = () => {
    // TODO: Submit data to backend
    console.log("Form submitted:", formData);
    // For now, just log the data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 px-6 py-2">
          <Leaf className="h-5 w-5 text-teal-400" />
          <span className="font-semibold text-sm text-teal-400">
            Greendex 2.0
          </span>
        </div>
        <h1 className="mb-2 font-bold text-3xl text-foreground sm:text-4xl">
          CO₂ Calculator for Erasmus+ Mobilities
        </h1>
        <p className="text-lg text-muted-foreground">
          Calculate your carbon footprint and help make a difference
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isComplete
                    ? "border-teal-500 bg-teal-500 text-white"
                    : isCurrent
                      ? "border-teal-500 bg-teal-500/10 text-teal-500"
                      : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="font-semibold text-sm">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-center text-xs capitalize ${
                  isCurrent
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="border-primary/20 bg-card/50 p-6 backdrop-blur-sm sm:p-8">
        {currentStep === "welcome" && (
          <WelcomeStep project={project} onComplete={handleWelcomeComplete} />
        )}
        {currentStep === "transport" && (
          <TransportStep
            initialTransports={formData.transports}
            onComplete={handleTransportComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === "accommodation" && (
          <AccommodationStep
            initialAccommodation={formData.accommodation}
            onComplete={handleAccommodationComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === "review" && (
          <ReviewStep
            formData={formData}
            project={project}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        )}
      </Card>
    </div>
  );
}
