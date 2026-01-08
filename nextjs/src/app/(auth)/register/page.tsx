"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { useAuth } from "@/hooks/use-auth";
import { axiosClient } from "@/lib/axiosClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const { loading, error, clearError, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== passwordConfirm) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosClient.post("/auth/register/", {
        email,
        password,
        password_confirm: passwordConfirm,
      });
      await refreshUser();

      // If user came from pricing page with a plan, redirect back to complete checkout
      if (plan) {
        router.push(`/pricing?plan=${plan}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorData = (
        err as {
          response?: {
            data?: { error?: string; email?: string[]; password?: string[] };
          };
        }
      )?.response?.data;
      const errorMessage =
        errorData?.error ||
        errorData?.email?.[0] ||
        errorData?.password?.[0] ||
        "Registration failed. Please try again.";
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details to get started"
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Confirm Password</Label>
          <Input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleButton />

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
