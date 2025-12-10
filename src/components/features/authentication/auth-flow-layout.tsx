import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { AnimatedGroup } from "@/components/animated-group";
import { BackToHome } from "@/components/back-to-home";
import { AuthBackground } from "@/components/features/authentication/auth-background";
import { RightSideImage } from "@/components/features/authentication/right-side-image";
import { cn } from "@/lib/utils";

const highlightKeys = ["one", "two", "three"] as const;

type AuthFlowLayoutProps = {
  children: ReactNode;
  backLabel?: string;
  backHref?: string;
};

export function normalizeRedirectPath(
  nextPageUrl: string | string[] | undefined,
  fallbackPath: string,
): string {
  const normalizedRedirect =
    typeof nextPageUrl === "string"
      ? nextPageUrl
      : Array.isArray(nextPageUrl)
        ? nextPageUrl[0]
        : undefined;
  return normalizedRedirect ?? fallbackPath;
}

/**
 * Layout used for authentication pages that presents a left content panel (with an optional back link and badge) and a translated right-side hero image.
 *
 * Renders children inside the left panel; the right side displays translated headline, description, hero fields, and highlights.
 *
 * @param children - Content to render in the left panel of the layout
 * @param backHref - Optional URL for the back link; when omitted the back control is rendered without a destination
 * @param backLabel - Optional label for the back link; defaults to "Back to Home" when not provided
 * @returns A React element containing the authentication layout
 */
export default async function AuthFlowLayout({
  children,
  backHref,
  backLabel,
}: AuthFlowLayoutProps) {
  const t = await getTranslations("authentication.brand");
  const highlights = highlightKeys.map((key) => t(`values.${key}`));

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <AuthBackground />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col justify-center gap-10 p-4 sm:px-6 sm:py-10 md:px-8 lg:flex-row lg:items-center lg:gap-14">
        <div
          className={cn(
            "mx-auto w-full max-w-xl",
            "rounded-3xl border border-border/40 bg-card/40 p-8 shadow-2xl backdrop-blur-xl",
            "xl:mx-0 xl:w-1/2 xl:max-w-none",
            "xl:p-12",
          )}
        >
          <AnimatedGroup
            className="flex flex-col gap-6"
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              },
              item: {
                hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.5,
                    ease: "easeOut",
                  },
                },
              },
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BackToHome label={backLabel ?? "Back to Home"} href={backHref} />
              <span className="rounded-full border border-primary/50 bg-primary/10 px-4 py-1 font-semibold text-primary text-xs uppercase tracking-[0.4em]">
                {t("badge")}
              </span>
            </div>

            <div className="space-y-8">{children}</div>
          </AnimatedGroup>
        </div>

        <RightSideImage
          headline={t("headline")}
          description={t("description")}
          highlights={highlights}
          heroBadge={t("heroBadge")}
          heroTitle={t("heroTitle")}
          heroCaption={t("heroCaption")}
          heroStatOne={t("heroStatOne")}
          heroStatTwo={t("heroStatTwo")}
        />
      </div>
    </div>
  );
}
