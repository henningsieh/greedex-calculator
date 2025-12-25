// verify-email/page.tsx

import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { VerifyEmailContent } from "@/components/features/authentication/verify-email-content";
import { LOGIN_PATH } from "@/config/app-routes";

export default async function VerifyEmailPage() {
  return (
    <AuthFlowLayout backHref={LOGIN_PATH} backLabel="Back to login">
      <VerifyEmailContent />
    </AuthFlowLayout>
  );
}
