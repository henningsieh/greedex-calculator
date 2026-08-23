import React from "react";
import { Section } from "react-email";

import { EmailButton } from "../components/email-button";
import { EmailCode } from "../components/email-code";
import { EmailHeading } from "../components/email-heading";
import { EmailLink } from "../components/email-link";
import { EmailText } from "../components/email-text";
import { emailSpacing } from "../config/styles";
import { EmailLayout } from "./components/email-layout";

interface OrganizationInvitationProps {
  baseUrl: string;
  organizationName: string;
  inviterName?: string;
  inviteLink: string;
}

export function OrganizationInvitation({
  baseUrl,
  organizationName,
  inviterName,
  inviteLink,
}: OrganizationInvitationProps) {
  return (
    <EmailLayout
      previewText={`Join ${organizationName} on Greendex - accept your invitation`}
      websiteUrl={baseUrl}
    >
      <EmailHeading>You've Been Invited</EmailHeading>
      <EmailText>
        {inviterName ? (
          <>
            <strong>{inviterName}</strong> invited you to join the
            organization{" "}
          </>
        ) : (
          "You were invited to join the organization "
        )}
        <EmailLink>{organizationName}</EmailLink>.
      </EmailText>
      <EmailText>
        Accept the invitation to start collaborating with your team and access
        shared resources.
      </EmailText>
      <Section style={emailSpacing.section}>
        <EmailButton href={inviteLink}>Accept Invitation</EmailButton>
      </Section>
      <EmailText variant="muted">
        If the button doesn't work, copy and paste this link into your browser:
      </EmailText>
      <EmailCode>{inviteLink}</EmailCode>
      <EmailText variant="muted">
        If you didn't expect this invitation, you can safely ignore this email.
      </EmailText>
    </EmailLayout>
  );
}
