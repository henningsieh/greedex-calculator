"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { UserSession } from "@/components/user-session";
import type { ThemeKey } from "@/lib/theme";

export function Navbar() {
  const { setTheme } = useTheme();

  const [currentTheme, setCurrentTheme] = useState<ThemeKey | undefined>(
    "system"
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/20 px-8 backdrop-blur-sm">
      <div className="container mx-auto flex h-[63px] items-center">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            {/* Logo or brand name would go here */}
            <p className="font-bold text-2xl text-primary">
              GREEN<span className="text-muted-foreground">DEX</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher
              value={currentTheme}
              onChange={(t: ThemeKey) => {
                setCurrentTheme(t);
                setTheme(t);
              }}
            />
            <UserSession />
          </div>
        </div>
      </div>
    </nav>
  );
}
