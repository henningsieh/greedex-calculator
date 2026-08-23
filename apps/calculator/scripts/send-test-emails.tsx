import { createEmailSender, createTransporter } from "@greendex/email";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(import.meta.dirname, "../../../.env") });

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set to send test emails.`);
  }
  return value;
}

const smtpPortString = getRequiredEnvironmentVariable("SMTP_PORT");
const smtpPort = Number.parseInt(smtpPortString, 10);
if (
  Number.isNaN(smtpPort) ||
  smtpPortString !== String(smtpPort) ||
  smtpPort < 1 ||
  smtpPort > 65535
) {
  throw new Error("SMTP_PORT must be a number.");
}

const baseUrl = getRequiredEnvironmentVariable("NEXT_PUBLIC_BASE_URL");

const emailSender = createEmailSender({
  baseUrl,
  transporter: createTransporter({
    host: getRequiredEnvironmentVariable("SMTP_HOST"),
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: getRequiredEnvironmentVariable("SMTP_USERNAME"),
      pass: getRequiredEnvironmentVariable("SMTP_PASSWORD"),
    },
  }),
  sender: getRequiredEnvironmentVariable("SMTP_SENDER"),
});

async function sendTestEmails() {
  const testRecipient =
    process.env.TEST_EMAIL_RECIPIENT ??
    getRequiredEnvironmentVariable("SMTP_SENDER");

  console.log("Sending email verification test...");
  await emailSender.sendEmailVerificationEmail({
    user: { email: testRecipient, name: "Henning Sieh" },
    url: new URL("/verify?token=test123", baseUrl).toString(),
  });

  console.log("Sending password reset test...");
  await emailSender.sendPasswordResetEmail({
    user: { email: testRecipient, name: "Henning Sieh" },
    url: new URL("/reset-password?token=test456", baseUrl).toString(),
  });

  console.log("Sending organization invitation test...");
  await emailSender.sendOrganizationInvitation({
    email: testRecipient,
    inviteLink: new URL("/invite/accept?token=test789", baseUrl).toString(),
    inviterName: "Anna Schmidt",
    organizationName: "GreenTech Solutions",
  });

  console.log(`All test emails sent successfully to ${testRecipient}.`);
}

sendTestEmails().catch((error: unknown) => {
  console.error("Error sending test emails:", error);
  process.exitCode = 1;
});
