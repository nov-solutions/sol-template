"use client";

import { axiosClient } from "@/lib/axiosClient";
import { extractApiError } from "@/lib/errors";
import { useCallback, useEffect, useState } from "react";

interface SubscriptionStatus {
  has_active_subscription: boolean;
  status: string;
  plan_name?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  is_trialing?: boolean;
  trial_end?: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/stripe/status/");
      setSubscription(response.data);
      setError(null);
    } catch {
      setSubscription({
        has_active_subscription: false,
        status: "none",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const createCheckoutSession = async (priceId: string) => {
    try {
      const response = await axiosClient.post(
        "/stripe/checkout/",
        new URLSearchParams({ price_id: priceId }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
      return response.data;
    } catch (err: unknown) {
      throw new Error(
        extractApiError(err, "Failed to create checkout session"),
      );
    }
  };

  const openBillingPortal = async () => {
    try {
      const response = await axiosClient.post("/stripe/portal/");
      if (response.data.url) {
        window.location.href = response.data.url;
      }
      return response.data;
    } catch (err: unknown) {
      throw new Error(extractApiError(err, "Failed to open billing portal"));
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await axiosClient.post("/stripe/cancel/");
      await fetchStatus();
      return response.data;
    } catch (err: unknown) {
      throw new Error(extractApiError(err, "Failed to cancel subscription"));
    }
  };

  const reactivateSubscription = async () => {
    try {
      const response = await axiosClient.post("/stripe/reactivate/");
      await fetchStatus();
      return response.data;
    } catch (err: unknown) {
      throw new Error(
        extractApiError(err, "Failed to reactivate subscription"),
      );
    }
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchStatus,
    createCheckoutSession,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
  };
}
