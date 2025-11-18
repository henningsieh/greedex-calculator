import { redirect } from "next/navigation";
import BackToHome from "@/components/back-to-home";
import { ResetPasswordForm } from "@/components/features/authentication/reset-password-form";
import RightSideImage from "@/components/features/authentication/right-side-image";

interface ResetPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  // If no token is provided, redirect to forgot password page
  if (!token || typeof token !== "string") {
    redirect("/forgot-password");
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col p-6 md:p-10">
        <div className="absolute top-6 left-6 z-10">
          <BackToHome />
        </div>
        <div className="flex flex-1 justify-center pt-12">
          <div className="w-full max-w-lg">
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
      <RightSideImage />
    </div>
  );
}
