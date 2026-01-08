"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";
import { axiosClient } from "@/lib/axiosClient";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token as string;
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axiosClient.get(`/auth/verify-email/${token}/`);
        setSuccess(true);
        // Refresh user data to update email_verified status
        await refreshUser();
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ||
          "Verification failed. The link may be invalid or expired.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, refreshUser]);

  if (loading) {
    return (
      <AuthCard title="Verifying your email" description="Please wait...">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard
        title="Email verified!"
        description="Your email has been successfully verified"
        footer={
          <Link href="/dashboard" className="text-primary hover:underline">
            Go to dashboard
          </Link>
        }
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <p className="text-muted-foreground">
            Thank you for verifying your email address. You now have full access
            to your account.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/dashboard">Continue to dashboard</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verification failed"
      description="We couldn't verify your email"
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="text-center">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-muted-foreground">
          The verification link may have expired or already been used. Please
          request a new verification email from your account settings.
        </p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
