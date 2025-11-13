// back-to-home.tsx
import { ChevronLeftIcon } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  href?: string;
};

export default function BackToHome({
  label = "Back to Home",
  href,
}: Props) {
  const defaultHref = "/";
  return (
    <div className="flex justify-start gap-2">
      <Button variant="link" asChild>
        <Link href={href ?? defaultHref}>
          <ChevronLeftIcon />
          {label}
        </Link>
      </Button>
    </div>
  );
}
