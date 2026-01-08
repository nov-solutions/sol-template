"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { axiosClient } from "@/lib/axiosClient";
import { useState } from "react";
import { toast } from "sonner";

export function VerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  // Don't show if user is verified or banner is dismissed
  if (!user || user.email_verified || dismissed) {
    return null;
  }

  const daysRemaining = user.days_until_deletion;

  const handleResend = async () => {
    setSending(true);
    try {
      await axiosClient.post("/auth/resend-verification/");
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-500/10">
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Please verify your email address.
            {daysRemaining !== null && daysRemaining <= 3 && (
              <span className="ml-1 font-medium text-yellow-600 dark:text-yellow-400">
                {daysRemaining === 0
                  ? "Your account may be deleted today!"
                  : daysRemaining === 1
                    ? "1 day remaining!"
                    : `${daysRemaining} days remaining!`}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? "Sending..." : "Resend email"}
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
