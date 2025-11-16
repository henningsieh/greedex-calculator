"use client";

import { ArrowRight, Calendar, Globe, MapPin, Sprout } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  name: string;
  location: string;
  country: string;
  startDate: Date;
  endDate: Date;
  welcomeMessage?: string | null;
}

interface WelcomeStepProps {
  project: Project;
  onComplete: (name: string, country: string) => void;
}

export function WelcomeStep({ project, onComplete }: WelcomeStepProps) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && country.trim()) {
      onComplete(name.trim(), country.trim());
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2">
          <Sprout className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold text-emerald-400 text-sm">
            Hello, fellow Earth walker!
          </span>
        </div>

        <h2 className="font-bold text-2xl text-foreground sm:text-3xl">
          {project.name}
        </h2>

        {project.welcomeMessage && (
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            {project.welcomeMessage}
          </p>
        )}

        {!project.welcomeMessage && (
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            We're excited to calculate the carbon footprint of your journey to
            this Erasmus+ project. Your participation helps us understand and
            reduce our environmental impact together.
          </p>
        )}
      </div>

      {/* Project Details */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/30 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
            <MapPin className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-muted-foreground text-sm">
              Location
            </p>
            <p className="mt-1 text-foreground">{project.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/30 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <Calendar className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-muted-foreground text-sm">Dates</p>
            <p className="mt-1 text-foreground text-sm">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/30 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
            <Globe className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-muted-foreground text-sm">
              Country
            </p>
            <p className="mt-1 text-foreground">{project.country}</p>
          </div>
        </div>
      </div>

      {/* Participant Info Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 rounded-lg border border-primary/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 p-6">
          <h3 className="font-semibold text-foreground text-xl">
            Let's get started
          </h3>
          <p className="text-muted-foreground text-sm">
            Please provide some basic information to begin calculating your
            carbon footprint.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-border/50 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Your Country</Label>
              <Input
                id="country"
                type="text"
                placeholder="Enter your home country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="border-border/50 bg-background"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
          disabled={!name.trim() || !country.trim()}
        >
          Start Greendex
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
