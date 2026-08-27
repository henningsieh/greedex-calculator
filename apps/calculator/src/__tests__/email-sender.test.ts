import { createEmailSender } from "@greendex/email";
import { beforeEach, describe, expect, it, vi } from "vitest";

const senderAddress = "greendex@sieh.org";
const baseUrl = "https://greendex.apps.sieh.org";
const recipient = `recipient-${Date.now()}@sieh.org`;
const sendMail = vi.fn();

const emailSender = createEmailSender({
  baseUrl,
  transporter: { sendMail } as unknown as Parameters<
    typeof createEmailSender
  >[0]["transporter"],
  sender: senderAddress,
});

describe("email sender", () => {
  beforeEach(() => {
    sendMail.mockResolvedValue({ messageId: "test-message-id" });
    sendMail.mockClear();
  });

  it("renders and sends an email verification message", async () => {
    const verificationUrl = `https://greendex.apps.sieh.org/verify?token=verification`;

    await emailSender.sendEmailVerificationEmail({
      user: { email: recipient, name: "Ada Lovelace" },
      url: verificationUrl,
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: senderAddress,
        to: recipient,
        subject: "Verify Your Email Address",
        html: expect.stringContaining(verificationUrl),
      }),
    );
  });

  it("renders and sends a password reset message", async () => {
    const resetUrl = `https://greendex.apps.sieh.org/reset?token=reset`;

    await emailSender.sendPasswordResetEmail({
      user: { email: recipient, name: "Ada Lovelace" },
      url: resetUrl,
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: senderAddress,
        to: recipient,
        subject: "Reset Your Password",
        html: expect.stringContaining(resetUrl),
      }),
    );
  });

  it("renders and sends an organization invitation", async () => {
    const inviteLink = `https://greendex.apps.sieh.org/invitations/invite`;

    await emailSender.sendOrganizationInvitation({
      email: recipient,
      inviteLink,
      inviterName: "Ada Lovelace",
      organizationName: "Analytical Engine Society",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: senderAddress,
        to: recipient,
        subject: "You're invited to join Analytical Engine Society",
        html: expect.stringContaining(inviteLink),
      }),
    );

    const [{ html }] = sendMail.mock.calls[0];
    const renderedEmail = new DOMParser().parseFromString(html, "text/html");

    expect(renderedEmail.body.textContent).toContain(
      "If the button doesn't work, copy and paste this link into your browser:",
    );
    expect(renderedEmail.body.textContent).toContain(inviteLink);
    expect(html).toContain(baseUrl);
  });

  it("sends a magic-link message with HTML and plain text content", async () => {
    const magicLink = `https://greendex.apps.sieh.org/magic-link?token=magic`;

    await emailSender.sendMagicLinkEmail({ email: recipient, url: magicLink });

    expect(sendMail).toHaveBeenCalledWith({
      from: senderAddress,
      to: recipient,
      subject: "Sign in to your account",
      html: expect.stringContaining(magicLink),
      text: `Click the link below to sign in: ${magicLink}`,
    });
  });
});
