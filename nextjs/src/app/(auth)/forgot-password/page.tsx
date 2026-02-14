"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { axiosClient } from "@/lib/axiosClient";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  useAuthRedirect();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axiosClient.post("/auth/forgot-password/", { email });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent you a password reset link"
        footer={
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="text-center">
          <p className="text-muted-foreground">
            If an account with <strong>{email}</strong> exists, you&apos;ll
            receive an email with instructions to reset your password.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Didn&apos;t receive an email? Check your spam folder or{" "}
            <button
              onClick={() => setSubmitted(false)}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link"
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
