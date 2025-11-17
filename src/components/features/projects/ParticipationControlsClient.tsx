"use client";

import { Link2Icon, QrCodeIcon } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent } from "@/components/ui/field";

interface ParticipationControlsClientProps {
  activeProjectId: string;
  origin: string;
}

export default function ParticipationControlsClient({
  activeProjectId,
  origin,
}: ParticipationControlsClientProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Generate participation URL
  const participationUrl = `${origin}/project/${activeProjectId}/participate`;

  // Generate QR code when modal opens
  useEffect(() => {
    if (isQrModalOpen && participationUrl) {
      QRCode.toDataURL(participationUrl, {
        width: 300,
        margin: 2,
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
          toast.error("Failed to generate QR code");
        });
    }
  }, [isQrModalOpen, participationUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(participationUrl);
    toast.success("Participation link copied to clipboard!");
  };

  return (
    <>
      <div className="mb-8 rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Link2Icon className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Participant Link</h2>
        </div>
        <p className="mb-4 text-muted-foreground text-sm">
          Share this link with participants to allow them to join the project
          and submit their travel activities.
        </p>
        <div className="flex flex-wrap gap-2">
          <Field className="flex-1">
            <FieldContent className="relative flex flex-col sm:flex-row">
              <input
                type="text"
                value={participationUrl}
                readOnly
                className="w-full truncate rounded-md border bg-muted px-4 py-2 pr-12 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                title="Participation URL"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 p-0 hover:bg-accent"
                title="Copy to clipboard"
                aria-label="Copy participation URL to clipboard"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </FieldContent>
          </Field>
          <Button variant="outline" onClick={() => setIsQrModalOpen(true)}>
            <QrCodeIcon className="h-4 w-4" />
            QR Code
          </Button>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participation QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to access the participation page
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeDataUrl ? (
              // biome-ignore lint/performance/noImgElement: QR code is a base64 data URL, not an external image
              <img
                src={qrCodeDataUrl}
                alt="QR Code for participation link"
                className="rounded-lg border"
              />
            ) : (
              <div className="flex h-[300px] w-[300px] items-center justify-center rounded-lg border">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}
            <p className="break-all text-center font-mono text-muted-foreground text-xs">
              {participationUrl}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
