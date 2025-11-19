"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { LastUsedBadge } from "@/components/features/authentication/last-used-badge";
import SocialButtons from "@/components/features/authentication/social-buttons";
import FormField from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { authClient } from "@/lib/better-auth/auth-client";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

const credentialsSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export const magicLinkSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export function LoginForm({
  className,
  nextPageUrl,
  ...props
}: React.ComponentProps<"div"> & { nextPageUrl?: string | string[] }) {
  const router = useRouter();
  const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null);
  console.log("Last login method:", lastLoginMethod);
  const locale = useLocale();
  const t = useTranslations("authentication.login");

  // append the callbackUrl to the env
  const normalizedRedirect =
    typeof nextPageUrl === "string"
      ? nextPageUrl
      : Array.isArray(nextPageUrl)
        ? nextPageUrl[0]
        : undefined;
  const fallbackRedirect = `/${locale}/org/dashboard`;
  const finalRedirect = normalizedRedirect ?? fallbackRedirect;
  const callbackURL = env.NEXT_PUBLIC_BASE_URL + finalRedirect;

  // Get last login method on component mount
  useEffect(() => {
    const method = authClient.getLastUsedLoginMethod();
    setLastLoginMethod(method);
  }, []);

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof credentialsSchema>) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL,
      },
      {
        onError: (c) => {
          if (c.error.code === "EMAIL_NOT_VERIFIED") {
            toast.error("Please verify your email address to continue");
            router.push(
              `/verify-email?email=${encodeURIComponent(data.email)}`,
            );
            return;
          }
          toast.error(c.error.message || "Failed to sign in");
        },
      },
    );
  };

  const onMagicLinkSubmit = async (data: z.infer<typeof magicLinkSchema>) => {
    await authClient.signIn.magicLink(
      {
        email: data.email,
        callbackURL,
      },
      {
        onSuccess: () => {
          toast.success("Magic link sent! Check your email.");
        },
        onError: (c) => {
          toast.error(c.error.message || "Failed to send magic link");
        },
      },
    );
  };

  return (
    <Card className="mx-auto max-w-lg p-12">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <LogInIcon className="size-8 text-primary" />
          </div>
          <CardTitle className="space-y-2">
            <h1 className="font-bold text-2xl">Sign in to your account</h1>
          </CardTitle>
          <CardDescription>
            Enter your credentials below to sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Badges are positioned absolute within the relative containers in the top right */}
          <Tabs defaultValue="password" className="w-full space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className="relative" value="password">
                Password
                {(lastLoginMethod === "email" ||
                  lastLoginMethod === "credential") && (
                  <LastUsedBadge className="-left-8" />
                )}
              </TabsTrigger>
              <TabsTrigger className="relative" value="magic-link">
                Magic Link
                {lastLoginMethod === "magic-link" && <LastUsedBadge />}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className="">
                  <FormField
                    name="email"
                    control={form.control}
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="m@example.com"
                    inputProps={{ disabled: form.formState.isSubmitting }}
                  />
                  <FormField
                    name="password"
                    control={form.control}
                    id="password"
                    type="password"
                    label="Password"
                    rightLabel={
                      <Button variant="link" className="px-0" asChild>
                        <Link
                          href="/forgot-password"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </Button>
                    }
                    inputProps={{ disabled: form.formState.isSubmitting }}
                  />

                  <Button
                    className="mt-2"
                    type="submit"
                    variant="default"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Signing in..." : "Login"}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
            <TabsContent value="magic-link">
              <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}>
                <FieldGroup className="gap-4">
                  <FormField
                    name="email"
                    control={magicLinkForm.control}
                    label="Email"
                    id="magic-email"
                    type="email"
                    placeholder="m@example.com"
                    inputProps={{
                      disabled: magicLinkForm.formState.isSubmitting,
                    }}
                  />

                  <Button
                    className="mt-2"
                    type="submit"
                    variant="default"
                    disabled={magicLinkForm.formState.isSubmitting}
                  >
                    {magicLinkForm.formState.isSubmitting
                      ? "Sending..."
                      : "Send magic link"}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          <div className="w-full">
            <Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Button variant="link" className="px-0 pl-1" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </FieldDescription>

              <FieldSeparator className="my-4 font-bold">
                Or continue with
              </FieldSeparator>

              <SocialButtons
                disabled={form.formState.isSubmitting}
                callbackUrl={callbackURL}
                lastLoginMethod={lastLoginMethod}
              />
            </Field>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
