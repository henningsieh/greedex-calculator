import { ArrowRight, ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

interface PillCTAProps {
  children: React.ReactNode;
  className?: string;
  showNewBadge?: boolean;
  onClick?: () => void;
}

/**
 * Premium pill-shaped CTA button component
 * OpenClaw.ai style with enhanced visual treatment
 * Simple arrow icon, elegant hover state
 * Theme-aware (works in light/dark)
 */
export function PillCTA({
  children,
  className,
  showNewBadge = false,
  onClick,
}: PillCTAProps) {
  return (
    <button
      className={cn(
        // Base styles
        "group relative inline-flex items-center gap-2.5 rounded-full",
        "border-2 border-primary/80 bg-background/90",
        "px-6 py-3 text-sm font-medium text-foreground",
        // Clean, visible default shadow and moderate backdrop blur (subtle, not overpowering)
        "shadow-[0_12px_36px_rgba(4,120,87,0.22),0_6px_18px_rgba(0,0,0,0.48)] backdrop-blur-sm",
        // Transitions
        "transition-all duration-300 ease-out",
        // Hover state - much stronger, more dramatic shadow + stronger glow
        "hover:border-primary/30 hover:bg-background hover:shadow-[0_40px_140px_rgba(16,185,129,0.28),0_18px_64px_rgba(0,0,0,0.6)] hover:shadow-primary/35",
        "hover:scale-[1.03]",
        // Focus state
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        // Active state
        "active:scale-[0.98] active:duration-100",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      {/* Subtle gradient overlay on hover (stronger) */}
      <span className="absolute inset-0 rounded-full bg-linear-to-r from-emerald-500/0 via-teal-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-300 group-hover:from-emerald-500/15 group-hover:via-teal-500/15 group-hover:to-cyan-500/15 group-hover:opacity-100" />

      {showNewBadge && (
        <span className="relative rounded-full bg-linear-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          NEW
        </span>
      )}
      <span className="relative">{children}</span>
      <ArrowRight
        className="relative size-4 transition-transform duration-300 group-hover:translate-x-2"
        strokeWidth={2.5}
      />
    </button>
  );
}

interface PillCTALinkProps extends Omit<PillCTAProps, "onClick"> {
  href: string;
}

/**
 * Pill CTA as a link component
 */
export function PillCTALink({
  children,
  className,
  showNewBadge = false,
  href,
}: PillCTALinkProps) {
  return (
    <Link
      className={cn(
        // Base styles
        "group relative inline-flex items-center gap-2.5 rounded-full",
        "border border-primary/40 bg-background/90",
        "px-6 py-3 text-sm font-medium text-foreground",
        // Visible, slightly tighter default shadow and moderate backdrop blur
        "shadow-[0_14px_56px_rgba(4,120,87,0.28),0_8px_28px_rgba(0,0,0,0.52)] backdrop-blur-md",
        // Transitions
        "transition-all duration-200 ease-out",
        // Hover state - much stronger, more dramatic glow + shadow
        "hover:border-primary/90 hover:bg-background hover:shadow-[0_48px_170px_rgba(16,185,129,0.32),0_20px_80px_rgba(0,0,0,0.65)] hover:shadow-primary/40",
        "hover:scale-[1.04]",
        // Focus state
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        // Active state
        "active:scale-[0.99] active:duration-100",
        className,
      )}
      href={href}
    >
      {/* Subtle gradient overlay on hover (stronger) */}
      <span className="absolute inset-0 rounded-full bg-linear-to-r from-emerald-500/0 via-teal-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-300 group-hover:from-emerald-500/15 group-hover:via-teal-500/15 group-hover:to-cyan-500/15 group-hover:opacity-100" />

      {showNewBadge && (
        <Badge className="relative rounded-full bg-linear-to-r from-emerald-600 to-teal-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          NEW
        </Badge>
      )}
      <span className="relative">{children}</span>
      <ArrowRightIcon
        className="relative size-4 transition-transform duration-300 group-hover:translate-x-2"
        strokeWidth={2.5}
      />
    </Link>
  );
}
