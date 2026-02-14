"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/loading-button";
import { useSubscription } from "@/hooks/use-subscription";
import {
  RiCheckLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCalendarLine,
} from "@remixicon/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function BillingPage() {
  const {
    subscription,
    loading,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscription();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const handleOpenPortal = async () => {
    try {
      setActionLoading("portal");
      setError(null);
      await openBillingPortal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading("cancel");
      setError(null);
      await cancelSubscription();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel subscription",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    try {
      setActionLoading("reactivate");
      setError(null);
      await reactivateSubscription();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reactivate subscription",
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasSubscription = subscription?.has_active_subscription;
  const isCanceled = subscription?.cancel_at_period_end;
  const isTrialing = subscription?.is_trialing;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {success && (
        <Alert>
          <RiCheckLine className="h-4 w-4" />
          <AlertTitle>Payment successful!</AlertTitle>
          <AlertDescription>
            Your subscription is now active. Thank you for subscribing!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <RiErrorWarningLine className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {subscription?.plan_name || "Pro"}
                    </p>
                    {isTrialing && <Badge variant="secondary">Trial</Badge>}
                  </div>
                  <p className="text-muted-foreground">
                    {subscription?.status === "active" &&
                      !isCanceled &&
                      "Active"}
                    {subscription?.status === "trialing" && "Trial Period"}
                    {isCanceled && "Cancels at period end"}
                  </p>
                </div>
                <div className="text-right">
                  {subscription?.current_period_end && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RiCalendarLine className="h-4 w-4" />
                      <span>
                        {isCanceled ? "Access until" : "Renews"}{" "}
                        {new Date(
                          subscription.current_period_end,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isCanceled ? (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Your subscription will end on{" "}
                      {subscription?.current_period_end &&
                        new Date(
                          subscription.current_period_end,
                        ).toLocaleDateString()}
                      . You&apos;ll keep access until then.
                    </span>
                    <LoadingButton
                      size="sm"
                      onClick={handleReactivate}
                      disabled={actionLoading !== null}
                      loading={actionLoading === "reactivate"}
                    >
                      Reactivate
                    </LoadingButton>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex gap-3">
                  <LoadingButton
                    variant="outline"
                    onClick={handleOpenPortal}
                    disabled={actionLoading !== null}
                    loading={actionLoading === "portal"}
                  >
                    Manage Billing
                  </LoadingButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <LoadingButton
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={actionLoading !== null}
                        loading={actionLoading === "cancel"}
                      >
                        Cancel Subscription
                      </LoadingButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Cancel subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You&apos;ll keep access until the end of your current
                          billing period (
                          {subscription?.current_period_end &&
                            new Date(
                              subscription.current_period_end,
                            ).toLocaleDateString()}
                          ). You can reactivate anytime before then.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold">Free</p>
                <p className="text-muted-foreground">
                  You&apos;re on the free plan with limited features
                </p>
              </div>
              <Button asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      {hasSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices from the billing portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleOpenPortal}
              disabled={actionLoading !== null}
            >
              View Invoices
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
