"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuthRedirect(to = "/dashboard") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace(to);
    }
  }, [user, loading, router, to]);

  return { user, loading };
}
